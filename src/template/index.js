import compileHTML from './html'

const compilers = {
    html: compileHTML
}

export default async function (template, extras, options) {
    const lang = template.lang || 'html'

    return await compilers[lang].call(null, template, extras, options)
}
