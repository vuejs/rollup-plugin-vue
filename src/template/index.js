import compileHTML from './html'

const compilers = {
    html: compileHTML
}

export function compile (template, extras, options) {
    return compilers[template.lang].call(null, template, extras, options)
}
