import less from 'less'

export default async function (style, options) {
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
