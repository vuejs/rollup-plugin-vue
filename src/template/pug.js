export default async function (template, extras, options) {
    const pug = require('pug')
    const compiler = pug.compile(template, { filename: extras.id, doctype: 'html', ...options.pug })

    return compiler({css: extras.modules || {}})
}
