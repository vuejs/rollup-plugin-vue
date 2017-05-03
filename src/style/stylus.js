export default async function (style, options) {
    const stylus = require('stylus')
    const stylusObj = stylus(style.code, {...options.stylus})
        .set('filename', style.id)
        .set('sourcemap', {
            'comment': false
        })

    const code = await stylusObj.render()
    const map = stylusObj.sourcemap

    style.$compiled = {
        code,
        map
    }

    return style
}
