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
        resolveId (id) {
            if (id.indexOf('.vue.component.') > -1) {
                return id
            }
        },
        load (id) {
            if (id.indexOf('.vue.component.') > -1) {
                const parts = id.split('.')
                const component = parts.slice(0, parts.length - 4).join('.')
                const index = parseInt(parts[parts.length - 4])

                return styles[component][index] || ''
            }
        },
        transform (source, id) {
            if (!filter(id) || !id.endsWith('.vue')) {
                debug(`Ignore: ${id}`)
                return null
            }

            const { code, css, map } = vueTransform(source, id, options)
            styles[id] = css

            return { code, map }
        },

        ongenerate () {
            if (options.styleToImports !== true) {
                compileStyle(styles, options)
            }
        }
    }
}
