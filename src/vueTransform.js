import deIndent from 'de-indent'
import htmlMinifier from 'html-minifier'
import parse5 from 'parse5'
import validateTemplate from 'vue-template-validator'
import transpileVueTemplate from 'vue-template-es2015-compiler'
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

function injectRender (script, render, lang, options) {
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

            const result = script.split(matches[1])
                  .join(renderScript.replace('module.exports={', 'export default {').replace(/\}$/, ''))

            return result
        }

        debug(`No injection location found in: \n${script}\n`)
    } else if (options.inject) {
        return options.inject(script, render, lang, options)
    }
    throw new Error('[rollup-plugin-vue] could not find place to inject template in script.')
}

/**
 * @param script
 * @param template
 * @param lang
 * @returns {string}
 */
function injectTemplate (script, template, lang, options) {
    if (template === undefined) return script

    if (['js', 'babel'].indexOf(lang.toLowerCase()) > -1) {
        const matches = /(export default[^{]*\{)/g.exec(script)
        if (matches) {
            return script.split(matches[1])
                  .join(`${matches[1]} template: ${JSON.stringify(template)},`)
        }

        debug(`No injection location found in: \n${script}\n`)
    } else if (options.inject) {
        return options.inject(script, template, lang, options)
    }

    throw new Error('[rollup-plugin-vue] could not find place to inject template in script.')
}

/**
 * Compile template: DeIndent and minify html.
 */
function processTemplate (source, id, content, options) {
    if (source === undefined) return undefined

    const {node, code} = source

    const warnings = validateTemplate(code, content)
    if (warnings) {
        const relativePath = relative(process.cwd(), id)
        warnings.forEach((msg) => {
            console.warn(`\n Warning in ${relativePath}:\n ${msg}`)
        })
    }

    /* eslint-disable no-underscore-dangle */
    const start = node.content.childNodes[0].__location.startOffset
    const end = node.content.childNodes[node.content.childNodes.length - 1].__location.endOffset
    const template = deIndent(content.slice(start, end))
    /* eslint-enable no-underscore-dangle */

    return htmlMinifier.minify(template, options.htmlMinifier)
}

function processScript (source, id, content, options, nodes) {
    const template = processTemplate(nodes.template[0], id, content, options, nodes)

    const lang = source.attrs.lang || 'js'

    const script = deIndent(padContent(content.slice(0, content.indexOf(source.code))) + source.code)
    const map = (new MagicString(script)).generateMap({ hires: true })

    if (template && options.compileTemplate) {
        const render = require('vue-template-compiler').compile(template)

        return { map, code: injectRender(script, render, lang, options) }
    } else {
        return { map, code: injectTemplate(script, template, lang, options) }
    }
}

function processStyle (styles, id) {
    return styles.map(style => ({
        id,
        code: deIndent(style.code).trim(),
        lang: style.attrs.lang || 'css'
    }))
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
            nodes[name] = []
        }
        nodes[name].push({
            node: fragment.childNodes[i],
            code: parse5.serialize(fragment.childNodes[i]),
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

export default function vueTransform (code, id, options) {
    const nodes = parseTemplate(code)
    const js = processScript(nodes.script[0], id, code, options, nodes)
    const css = processStyle(nodes.style, id, code, options, nodes)

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
