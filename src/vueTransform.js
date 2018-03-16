import deIndent from 'de-indent'
import htmlMinifier from 'html-minifier'
import parse5 from 'parse5'
import templateValidator from 'vue-template-validator'
import { compile } from './style/index'
import templateProcessor from './template/index'
import { relative } from 'path'
import MagicString from 'magic-string'
import debug from './debug'
import { injectModule, injectScopeID, injectTemplate, injectRender } from './injections'
import genScopeID from './gen-scope-id'

function getNodeAttrs (node) {
    if (node.attrs) {
        const attributes = {}

        for (const attr of node.attrs) {
            attributes[attr.name] = attr.value
        }

        return attributes
    }

    return {}
}

/**
 * Pad content with empty lines to get correct line number in errors.
 */
function padContent (content) {
    return content
        .split(/\r?\n/g)
        .map(() => '')
        .join('\n')
}

function validateTemplate (code, content, id) {
    const warnings = templateValidator(code, content)
    if (Array.isArray(warnings)) {
        const relativePath = relative(process.cwd(), id)
        warnings.forEach((msg) => {
            console.warn(`\n Warning in ${relativePath}:\n ${msg}`)
        })
    }
}
/**
 * Compile template: DeIndent and minify html.
 */
async function processTemplate (source, id, content, options, nodes, modules) {
    if (source === undefined) return undefined

    debug(`Process template: ${id}`)

    const extras = { modules, id, lang: source.attrs.lang }
    const code = deIndent(source.code).trim()
    const template = await (
        options.disableCssModuleStaticReplacement !== true
            ? templateProcessor(code, extras, options)
            : code
    )

    if (!options.compileTemplate) {
        validateTemplate(code, content, id)
    }

    return htmlMinifier.minify(template, options.htmlMinifier)
}

/* eslint-disable complexity */
function normalizeLang (any) {
    switch (any) {
    case 'coffee':
    case 'coffeescript':
    case 'coffee-script':
        return 'coffee'
    case 'ts':
    case 'typescript':
    case 'type-script':
        return 'ts'
    default:
        return 'js'
    }
}
/* eslint-enable complexity */

async function processScript (source, id, content, options, nodes, modules, scoped) {
    const template = await processTemplate(nodes.template[0], id, content, options, nodes, modules)

    debug(`Process script: ${id}`)
    const lang = normalizeLang(source.attrs.lang)

    if (source.attrs.src) {
        source.code = `import __vue_module__ from '${source.attrs.src}'; export default __vue_module__;`
    }

    if (source.attrs.lang && ['js', 'babel'].indexOf(source.attrs.lang) < 0) {
        if (!(source.attrs.lang in options.script)) {
            throw new Error(`[rollup-plugin-vue] ${source.attrs.lang} is not yet supported in .vue files.`)
        }

        source = await options.script[source.attrs.lang](source, id, content, options, nodes)
    }

    let script = deIndent(padContent(content.slice(0, content.indexOf(source.code))) + source.code)
    const map = (new MagicString(script)).generateMap({ hires: true })

    script = processScriptForStyle(script, modules, scoped, lang, id, options)

    script = await processScriptForRender(script, template, lang, id, options)

    return { map, code: script }
}

function processScriptForStyle (script, modules, scoped, lang, id, options) {
    script = injectModule(script, modules, lang, id, options)

    if (scoped) {
        const scopeID = genScopeID(id)
        script = injectScopeID(script, scopeID, lang, id, options)
    }

    return script
}

async function processScriptForRender (script, template, lang, id, options) {
    if (template && options.compileTemplate) {
        const render = require('vue-template-compiler').compile(template, options.compileOptions)

        return await injectRender(script, render, lang, id, options)
    }

    if (template) {
        return await injectTemplate(script, template, lang, id, options)
    }

    return script
}

// eslint-disable-next-line complexity
async function processStyle (styles, id, content, options) {
    debug(`Process styles: ${id}`)
    const outputs = []
    for (let i = 0; i < styles.length; i += 1) {
        const style = styles[i]

        const code = deIndent(
            padContent(content.slice(0, content.indexOf(style.code))) + style.code
        )

        const map = (new MagicString(code)).generateMap({ hires: true })

        let output = {
            id,
            code: code,
            map: map,
            lang: style.attrs.lang || 'css',
            module: 'module' in style.attrs ? style.attrs.module || true : false,
            scoped: 'scoped' in style.attrs
        }

        if (options.autoStyles || output.scoped || output.module) {
            output = await compile(output, options)
        }

        outputs.push(output)
    }

    return outputs
}

function parseTemplate (code) {
    debug('Parsing template....')
    const fragment = parse5.parseFragment(code, { locationInfo: true })

    const nodes = {
        template: [],
        script: [],
        style: []
    }

    for (let i = fragment.childNodes.length - 1; i >= 0; i -= 1) {
        const name = fragment.childNodes[i].nodeName
        if (!(name in nodes)) {
            continue
        }

        const start = fragment.childNodes[i].__location.startTag.endOffset
        const end = fragment.childNodes[i].__location.endTag.startOffset

        nodes[name].push({
            node: fragment.childNodes[i],
            code: code.substr(start, end - start),
            attrs: getNodeAttrs(fragment.childNodes[i])
        })
    }

    if (nodes.script.length === 0) {
        nodes.script.push({
            node: null,
            code: 'export default {\n}',
            attrs: {}
        })
    }

    return nodes
}

const getModules = function (styles) {
    let all = {}

    for (let i = 0; i < styles.length; i += 1) {
        const style = styles[i]

        if (style.module) {
            all = Object.assign(all, style.$compiled.module)
        }
    }

    return all
}

const hasScoped = function (styles) {
    return styles.reduce((scoped, style) => {
        return scoped || style.scoped
    }, false)
}
export default async function vueTransform (code, id, options) {
    const nodes = parseTemplate(code)
    const css = await processStyle(nodes.style, id, code, options, nodes)
    const modules = getModules(css)
    const scoped = hasScoped(css)
    const js = await processScript(nodes.script[0], id, code, options, nodes, modules, scoped)

    const isProduction = process.env.NODE_ENV === 'production'
    const isWithStripped = options.stripWith !== false

    if (!isProduction && !isWithStripped) {
        js.code = js.code + '\nmodule.exports.render._withStripped = true'
    }

    if (options.styleToImports === true) {
        const style = css.map((s, i) => 'import ' + JSON.stringify(`${id}.${i}.vue.component.${s.lang}`) + ';').join(' ')

        return { css, code: style + js.code, map: js.map }
    } else if (options.css === true) {
        const style = css.map(s => '$compiled' in s ? s.$compiled.code : s.code).join('\n').replace(/(\r?\n|[\s])+/g, ' ')
        const styleCode = `
        (function(){
            if(typeof document !== 'undefined'){
                var head=document.head||document.getElementsByTagName('head')[0],
                    style=document.createElement('style'),
                    css=${JSON.stringify(style)};
                 style.type='text/css';
                 if (style.styleSheet){
                   style.styleSheet.cssText = css;
                 } else {
                   style.appendChild(document.createTextNode(css));
                 }
                 head.appendChild(style);
             }
         })();
         `.replace(/(\r?\n|[\s])+/g, ' ').trim()

        return { css, code: styleCode + js.code, map: js.map }
    }

    return { css, code: js.code, map: js.map }
}
