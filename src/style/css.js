import postcss from 'postcss'
import modules from 'postcss-modules'
import camelcase from 'camelcase'
// import MagicString from 'magic-string'
import debug from '../debug'

function compileModule(code, map, source, options) {
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

function escapeRegExp(str) {
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

    const output = { code, map, lang: 'css' }

    if (style.$compiled) output.$prev = style.$compiled

    style.$compiled = output

    return style
}
