import { writeFile } from 'fs'
import compileCSS from './css'
import compileSCSS from './scss'

const compilers = {
    scss: compileSCSS
}

export async function compile (style, options) {
    let output

    if (style.lang === 'css') {
        output = await compileCSS(style, options)
    } else {
        output = await compileCSS(compilers[style.lang].call(null, style, options), options)
    }

    return output
}

export default function (files, options) {
    if (options.css === false) {
        return
    }

    // Combine all stylesheets.
    let css = ''
    const allStyles = []

    Object.keys(files).forEach((file) => {
        files[file].forEach((style) => {
            css += style.code + '\n'
            allStyles.push(style)
        })
    })

    // Emit styles through callback
    if (typeof (options.css) === 'function') {
        options.css(css, allStyles, compile)

        return
    }

    // Don't generate empty style file.
    if (!css.trim().length) {
        return
    }

    const dest = options.css

    if (typeof dest !== 'string') {
        return
    }

    // Emit styles to file
    writeFile(dest, css, (err) => {
        if (err) throw err
    })
}
