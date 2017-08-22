import postcss from 'postcss'
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

const addScopeID = postcss.plugin('add-scope-id', options => {
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
                attribute: options.scopeID
            }))
        })
    })

    return root => {
        root.walkRules(rule => {
            rule.selector = selectorTransformer.process(rule.selector).result
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

function compileScopedCSS (code, map, source, options) {
    debug(`Scoped CSS: ${source.id}`)

    return postcss([
        addScopeID({
            scopeID: genScopeID(source.id)
        })
    ]).process(code, { map: { inline: false, prev: map }, from: source.id, to: source.id })
        .then(
            result => ({ code: result.css, map: result.map.toString() }),
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
    const { code, map } = ('$compiled' in style) ? style.$compiled : style

    if (style.module === true) {
        return compileModule(code, map, style, options).then(compiled => {
            if (style.$compiled) {
                compiled.$prev = style.$compiled

                const classes = Object.keys(compiled.module)
                const cssModule = {}

                if (classes.length) {
                    // Apply CSS modules to actual source.
                    // TODO: Update source map.
                    // const original = style.code

                    style.code = classes.reduce(
                          (result, original) => {
                              const transformed = compiled.module[original]
                              cssModule[camelcase(original)] = transformed
                              cssModule[original] = transformed

                              return result.replace(new RegExp(escapeRegExp(`.${original}`), 'g'), `.${transformed}`)
                          },
                          style.code
                    )
                    // style.map = (new MagicString(original))

                    compiled.module = (
                          typeof (style.module) === 'string' && style.attrs.module.length
                    ) ? { [style.module]: cssModule } : cssModule
                }
            }

            style.$compiled = compiled

            return style
        }).catch(error => debug(error))
    }

    if (style.scoped === true) {
        return compileScopedCSS(code, map, style, options).then(compiled => {
            if (style.$compiled) {
                compiled.$prev = style.$compiled
            }

            style.$compiled = compiled

            return style
        })
    }

    const output = { code, map, lang: 'css' }

    if (style.$compiled) output.$prev = style.$compiled

    style.$compiled = output

    return style
}
