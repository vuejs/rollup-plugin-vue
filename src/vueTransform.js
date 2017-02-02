import deIndent from 'de-indent'
import htmlMinifier from 'html-minifier'
import parse5 from 'parse5'
import templateValidator from 'vue-template-validator'
import transpileVueTemplate from 'vue-template-es2015-compiler'
import { compile } from './style/index'
import templateProcessor from './template/index'
import { relative } from 'path'
import MagicString from 'magic-string'
import debug from './debug'

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

/**
 * Wrap code inside a with statement inside a function
 * This is necessary for Vue 2 template compilation
 */
function wrapRenderFunction (code) {
    return `function(){${code}}`
}

function injectModule (script, lang, options, modules) {
    if (Object.keys(modules).length === 0) return script

    if (['js', 'babel'].indexOf(lang.toLowerCase()) > -1) {
        const matches = /(export default[^{]*\{)/g.exec(script)

        if (matches) {
            const moduleScript = `${matches[1]}cssModules: ${JSON.stringify(modules)},`

            return script.split(matches[1]).join(moduleScript)
        }
    } else if (typeof (options.injectModule) === 'function') {
        return options.injectModule(script, lang, options, modules)
    }

    throw new Error('[rollup-plugin-vue] could not inject css module in script')
}

function injectRender (script, render, lang, options, modules) {
    if (['js', 'babel'].indexOf(lang.toLowerCase()) > -1) {
        const matches = /(export default[^{]*\{)/g.exec(script)
        if (matches) {
            let renderScript = 'module.exports={' +
                  `render: ${wrapRenderFunction(render.render)},` +
                  'staticRenderFns: [' +
                  `${render.staticRenderFns.map(wrapRenderFunction).join(',')}],}`

            if (options.stripWith !== false) {
                renderScript = transpileVueTemplate(renderScript, options.vue)
            }

            return script.split(matches[1])
                  .join(renderScript.replace('module.exports={', 'export default {').replace(/\}$/, ''))
        }

        debug(`No injection location found in: \n${script}\n`)
    } else if (typeof (options.inject) === 'function') {
        return options.inject(script, render, lang, options)
    }
    throw new Error('[rollup-plugin-vue] could not find place to inject template in script.')
}

/**
 * @param script
 * @param template
 * @param lang
 * @param options
 * @param modules
 * @returns {string}
 */
function injectTemplate (script, template, lang, options, modules) {
    if (template === undefined) return script

    if (['js', 'babel'].indexOf(lang.toLowerCase()) > -1) {
        const matches = /(export default[^{]*\{)/g.exec(script)
        if (matches) {
            return script.split(matches[1])
                  .join(`${matches[1]} template: ${JSON.stringify(template)},`)
        }

        debug(`No injection location found in: \n${script}\n`)
    } else if (typeof (options.inject) === 'function') {
        return options.inject(script, template, lang, options)
    }

    throw new Error('[rollup-plugin-vue] could not find place to inject template in script.')
}

var validateTemplate = function (code, content, id) {
    const warnings = templateValidator(code, content)
    if (warnings) {
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

    const extras = { modules, id, lang: source.attrs.lang }
    const { code } = source
    const template = deIndent(
          await (options.disableCssModuleStaticReplacement !== true
                ? templateProcessor(code, extras, options)
                : code)
    )

    if (!options.compileTemplate) {
        validateTemplate(code, content, id)
    }

    return htmlMinifier.minify(template, options.htmlMinifier)
}

async function processScript (source, id, content, options, nodes, modules) {
    const template = await processTemplate(nodes.template[0], id, content, options, nodes, modules)

    const lang = source.attrs.lang || 'js'

    const script = deIndent(padContent(content.slice(0, content.indexOf(source.code))) + source.code)
    const map = (new MagicString(script)).generateMap({ hires: true })
    const scriptWithModules = injectModule(script, lang, options, modules)

    if (template && options.compileTemplate) {
        const render = require('vue-template-compiler').compile(template)

        return { map, code: injectRender(scriptWithModules, render, lang, options, modules) }
    } else if (template) {
        return { map, code: injectTemplate(scriptWithModules, template, lang, options, modules) }
    } else {
        return { map, code: scriptWithModules }
    }
}

async function processStyle (styles, id, content, options) {
    const outputs = []

    for (let i = 0; i < styles.length; i += 1) {
        const style = styles[i]

        const code = deIndent(
              padContent(content.slice(0, content.indexOf(style.code))) + style.code
        )

        const map = (new MagicString(code)).generateMap({ hires: true })

        const output = {
            id,
            code: code,
            map: map,
            lang: style.attrs.lang || 'css',
            module: 'module' in style.attrs,
            scoped: 'scoped' in style.attrs
        }

        if (options.autoStyles) {
            outputs.push(await compile(output, options))
        } else {
            outputs.push(output)
        }
    }

    return outputs
}

function parseTemplate (code) {
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

var getModules = function (styles) {
    let all = {}

    for (let i = 0; i < styles.length; i += 1) {
        const style = styles[i]

        if (style.module) {
            all = Object.assign(all, style.$compiled.module)
        }
    }

    return all
}

export default async function vueTransform (code, id, options) {
    const nodes = parseTemplate(code)
    const css = await processStyle(nodes.style, id, code, options, nodes)
    const modules = getModules(css)
    const js = await processScript(nodes.script[0], id, code, options, nodes, modules)

    const isProduction = process.env.NODE_ENV === 'production'
    const isWithStripped = options.stripWith !== false

    if (!isProduction && !isWithStripped) {
        js.code = js.code + '\nmodule.exports.render._withStripped = true'
    }

    if (options.styleToImports === true) {
        const style = css.map((s, i) => 'import ' + JSON.stringify(`${id}.${i}.vue.component.${s.lang}`) + ';').join(' ')

        return { css, code: style + js.code, map: js.map }
    }

    return { css, code: js.code, map: js.map }
}
