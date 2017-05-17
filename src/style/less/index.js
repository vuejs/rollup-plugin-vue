import path from 'path'

export default async function (style, options) {
    const less = require('less')
    const config = {
        plugins: [],
        paths: [],
        sourceMap: {
            sourceMapFullFilename: style.id,
            sourceMapFileInline: false
        },
        ...options.less
    }

    config.paths.unshift(path.dirname(style.id))

    const { css, map } = await less.render(
          'data' in options.less ? `${options.less.data}\n${style.code}` : style.code, config
    )

    style.$compiled = {
        code: css.toString(),
        map: map.toString()
    }

    return style
}
