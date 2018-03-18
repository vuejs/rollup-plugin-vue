import postcss from 'postcss'
import postcssLoadConfig from './postcss'
import modules from 'postcss-modules'
import selectorParser from 'postcss-selector-parser'
import camelcase from 'camelcase'
// import MagicString from 'magic-string'
import genScopeID from '../gen-scope-id'
import debug from '../debug'

/**
 * filter invalid tag, e.g. percentage, keyword(from, to)...
 * @param tag
 * @returns {boolean}
 */
function isInvalidTag (tag) {
    if (
        tag === 'from' ||
        tag === 'to' ||
        /^\d/.test(tag)
    ) {
        return true
    }
}

const addScopeID = postcss.plugin('add-scope-id', ({ scopeID }) => {
    const selectorTransformer = selectorParser(selectors => {
        selectors.each(selector => {
            let target = null
            /* eslint-disable complexity */
            selector.each(n => {
                if (n.type === 'combinator' && n.value === '>>>') {
                    n.value = ' '
                    n.spaces.before = n.spaces.after = ''
                    return false
                }

                if (n.type === 'tag') {
                    if (n.value === '/deep/') {
                        const next = n.next()

                        if (next.type === 'combinator' && next.value === ' ') {
                            next.remove()
                        }

                        n.remove()
                        return false
                    } else if (isInvalidTag(n.value)) {
                        return
                    }
                }

                if (n.type !== 'pseudo' && n.type !== 'combinator') {
                    target = n
                }
            })
            /* eslint-enable complexity */

            target && selector.insertAfter(target, selectorParser.attribute({
                attribute: scopeID
            }))
        })
    })

    return root => {
        root.walkRules(rule => {
            selectorTransformer.processSync(rule, {
                updateSelector: true
            })
        })
    }
})

function compileModule (code, map, source, options) {
    let style
    debug(`CSS Modules: ${source.id}`)

    return postcss([
        modules({
            getJSON (filename, json) {
                style = json
            },
            ...options.cssModules
        })
    ]).process(code, { map: { inline: false, prev: map }, from: source.id, to: source.id })
        .then(
            result => ({ code: result.css, map: result.map.toString(), module: style }),
            error => {
                throw error
            }
        )
}

function escapeRegExp (str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

export default async function (promise, options) {
    const style = await promise
    debug(`CSS: ${style.id}`)
    const {code, map} = ('$compiled' in style) ? style.$compiled : style
    const initPostcssOptions = {map: {inline: false, prev: map}, from: style.id, to: style.id}
    const hasModule = style.module === true
    const hasScope = style.scoped === true
    const postcssConfig = await postcssLoadConfig(options.postcss)
    const plugins = [...postcssConfig.plugins] || []
    let processPromise = Promise.resolve()

    if (hasScope) {
        debug(`Scoped CSS: ${style.id}`)
        plugins.push(addScopeID({
            scopeID: genScopeID(style.id)
        }))
    }

    if (hasModule) {
        // TODO: I found this plugin makes all postcss plugin run twice.
        processPromise = compileModule(code, map, style, options)
    }

    const curOptions = Object.assign({}, postcssConfig.options, initPostcssOptions)

    return processPromise.then(firstResult => {
        const moduleNames = firstResult && firstResult.module
        return postcss(plugins)
            .process(firstResult ? firstResult.code : code, curOptions)
            .then(result => {
                const compiled = {
                    code: result.css,
                    map: result.map.toString()
                }
                if (style.$compiled) {
                    compiled.$prev = style.$compiled
                }

                if (hasModule) {
                    const classes = Object.keys(moduleNames)
                    const cssModule = {}

                    if (classes.length) {
                        // Apply CSS modules to actual source.
                        // TODO: Update source map.
                        // const original = style.code

                        style.code = classes.reduce(
                            (result, original) => {
                                const transformed = moduleNames[original]
                                cssModule[camelcase(original)] = transformed
                                cssModule[original] = transformed

                                return result.replace(new RegExp(escapeRegExp(`.${original}`), 'g'), `.${transformed}`)
                            },
                            style.code
                        )
                        // style.map = (new MagicString(original))

                        compiled.module = (
                            typeof (style.module) === 'string' && style.attrs.module.length
                        ) ? {[style.module]: cssModule} : cssModule
                    }
                }

                style.$compiled = compiled

                return style
            })
            .catch(error => debug(error))
    })
}
