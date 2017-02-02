import postcss from 'postcss'
import modules from 'postcss-modules'

function compileModule (code, map, options) {
    let style

    return postcss([
        modules({
            getJSON (filename, json) {
                style = json
            },
            ...(options.modules || {})
        })
    ]).process(code, { map: { inline: false, prev: map } })
      .then(
            result => ({ code: result.css, map: result.map, module: style }),
            error => {
                throw error
            })
}

export default async function (promise, options) {
    const style = await promise
    const { code, map } = ('$compiled' in style) ? style.$compiled : style

    if (style.module === true) {
        return compileModule(code, map, options).then(compiled => {
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
