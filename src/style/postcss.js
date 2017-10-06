import postcssrc from 'postcss-load-config'

/* eslint-disable complexity */
export default async function (postcssOpt) {
    let options = {}
    let plugins = []

    if (typeof postcssOpt === 'function') {
        plugins = postcssOpt.call(this)
    } else if (Array.isArray(postcssOpt)) {
        plugins = postcssOpt
    } else if (typeof postcssOpt === 'object') {
        plugins = (typeof postcssOpt.plugins === 'function') ? postcssOpt.plugins.call(this) : postcssOpt.plugins || []
        options = postcssOpt.options || {}
    }

    return postcssrc().then((config) => {
        if (config.plugins) {
            plugins = plugins.concat(config.plugins)
        }

        if (config.options) {
            options = Object.assign(options, config.options)
        }
        return {plugins, options}
    }).catch(() => { return {plugins, options} })
}
