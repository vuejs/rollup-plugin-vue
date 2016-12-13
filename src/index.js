import { createFilter } from 'rollup-pluginutils'

import vueTransform from './vueTransform'
import DEFAULT_OPTIONS from './options'
import compileStyle from './style'
import debug from './debug'

function mergeOptions (options, defaults) {
    Object.keys(defaults).forEach((key) => {
        const val = defaults[key]

        if (key in options) {
            if (typeof options[key] === 'object') {
                mergeOptions(options[key], val)
            }
        } else {
            options[key] = val
        }
    })

    return options
}

export default function vue (options = {}) {
    debug('Yo! rolling vue!')
    const filter = createFilter(options.include, options.exclude)

    delete options.include
    delete options.exclude

    /* eslint-disable */
    try {
        const vueVersion = require('vue').version;
        if (parseInt(vueVersion.split('.')[0], 10) >= 2) {
            if (!('compileTemplate' in options)) {
                debug('Vue 2.0 detected. Compiling template.');
                options.compileTemplate = true;
            }
        } else {
            if (options.compileTemplate === true) {
                console.warn('Vue version < 2.0.0 does not support compiled template.');
            }
            options.compileTemplate = false;
        }
    } catch (e) {}
    /* eslint-enable */

    options = mergeOptions(options, DEFAULT_OPTIONS)

    const styles = {}

    return {
        name: 'vue',
        transform (source, id) {
            if (!filter(id) || !id.endsWith('.vue')) {
                debug(`Ignore: ${id}`)
                return null
            }

            debug(`Transform: ${id}`)

            const { code, css, map } = vueTransform(source, id, options)

            styles[id] = css

            debug(`Transformed: ${id}`)

            return { code, map }
        },

        ongenerate () {
            compileStyle(styles, options)
        }
    }
}
