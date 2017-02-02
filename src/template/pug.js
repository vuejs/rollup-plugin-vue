import pug from 'pug'

export default async function (template, extras, options) {
    const compiler = pug.compile(template, { filename: extras.id, ...options.pug })

    return compiler({css: extras.modules || {}})
}
