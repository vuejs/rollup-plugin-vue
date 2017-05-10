export default async function (template, extras, options) {
    const pug = require('pug')
    const trim = typeof template === 'string' ? template.trim : template
    const compiler = pug.compile(trim, { filename: extras.id, ...options.pug })

    return compiler({css: extras.modules || {}})
}
