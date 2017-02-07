import sass from 'node-sass'
import debug from '../debug'

export default function (style, options) {
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
