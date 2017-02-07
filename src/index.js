import { createFilter } from 'rollup-pluginutils'

import vueTransform from './vueTransform'
import DEFAULT_OPTIONS from './options'
import compileStyle from './style/index'
import debug from './debug'
import mergeOptions from 'merge-options'

export default function vue (opts = {}) {
    debug('Yo! rolling vue!')
    const filter = createFilter(opts.include, opts.exclude)

    delete opts.include
    delete opts.exclude

    /* eslint-disable */
    try {
        const vueVersion = require('vue').version;
        if (parseInt(vueVersion.split('.')[0], 10) >= 2) {
            if (!('compileTemplate' in config)) {
                debug('Vue 2.0 detected. Compiling template.');
                opts.compileTemplate = true;
            }
        } else {
            if (opts.compileTemplate === true) {
                console.warn('Vue version < 2.0.0 does not support compiled template.');
            }
            opts.compileTemplate = false;
        }
    } catch (e) {}
    /* eslint-enable */

    const config = mergeOptions(DEFAULT_OPTIONS, opts)
    const styles = {}

    return {
        name: 'vue',
        options (opts) {
            DEFAULT_OPTIONS.css = (opts.dest || 'bundle.js').replace(/js$/i, 'css')
        },
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
        async transform (source, id) {
            if (!filter(id) || !id.endsWith('.vue')) {
                debug(`Ignore: ${id}`)
                return null
            }

            debug(`Compile: ${id}`)

            const { code, css, map } = await vueTransform(source, id, config)

            styles[id] = css

            return { code, map }
        },

        ongenerate () {
            if (config.styleToImports !== true) {
                if (config.css === undefined || config.css === null) config.css = DEFAULT_OPTIONS.css
                compileStyle(styles, config)
            }
        }
    }
}
