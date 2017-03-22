import { writeFile, mkdirSync as mkdir, existsSync as exists } from 'fs'
import { dirname, isAbsolute, resolve as resolvePath } from 'path'
import compileCSS from './css'
import compileSCSS from './scss'
import compileLESS from './less'
import compileSTYLUS from './stylus'

const compilers = {
    scss: compileSCSS,
    sass: compileSCSS,
    less: compileLESS,
    stylus: compileSTYLUS
}

export async function compile (style, options) {
    let output

    if (style.lang === 'css') {
        output = await compileCSS(style, options)
    } else {
        output = await compileCSS(await compilers[style.lang].call(null, style, options), options)
    }

    return output
}

function ensureDirectory (directory) {
    if (!exists(directory)) {
        ensureDirectory(dirname(directory))

        mkdir(directory)
    }
}

export default function (files, options) {
    if (typeof (options.css) === 'boolean') {
        return
    }

    // Combine all stylesheets.
    let css = ''
    const allStyles = []

    Object.keys(files).forEach((file) => {
        files[file].forEach((style) => {
            css += ('$compiled' in style) ? `${style.$compiled.code}\n` : `${style.code}\n`

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

    let dest = options.css

    if (typeof dest !== 'string') {
        return
    }

    dest = isAbsolute(dest) ? dest : resolvePath(process.cwd(), dest)
    // Emit styles to file
    ensureDirectory(dirname(dest))
    writeFile(dest, css, (err) => {
        if (err) throw err
    })
}
