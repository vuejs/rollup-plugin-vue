import debug from '../debug'

export default function (style, options) {
    const sass = require('node-sass')
    debug(`SASS: ${style.id}`)
    const { css, map } = sass.renderSync({
        file: style.id,
        data: style.code,
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
