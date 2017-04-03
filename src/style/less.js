export default async function (style, options) {
    const less = require('less')

    const { css, map } = await less.render(style.code, {
        sourceMap: {
            sourceMapFullFilename: style.id,
            sourceMapFileInline: false
        },
        ...options.less
    })

    style.$compiled = {
        code: css.toString(),
        map: map.toString()
    }

    return style
}
