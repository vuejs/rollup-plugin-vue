import postcssrc from 'postcss-load-config'

export default async function (postcssOpt) {
    let options = {}
    let plugins = []

    if (typeof postcssOpt === 'function') {
        plugins = postcssOpt.call(this)
    } else if (Array.isArray(postcssOpt)) {
        plugins = plugins.concat(postcssOpt)
    } else if (typeof postcssOpt === 'object') {
        options = Object.assign({}, options, postcssOpt)
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
