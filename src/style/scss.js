import debug from '../debug'

export default function (style, options) {
    const sass = require('node-sass')
    debug(`SASS: ${style.id}`)
    const { css, map } = sass.renderSync({
        file: style.id,
        data: 'data' in options.scss ? `${options.scss.data}\n${style.code}` : style.code,
        omitSourceMapUrl: true,
        sourceMap: true,
        outFile: style.id,
        ...options.scss
    })

    style.$compiled = {
        code: css.toString(),
        map: map.toString()
    }

    return style
}
