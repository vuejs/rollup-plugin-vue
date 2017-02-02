import compileHTML from './html'
import compilePug from './pug'

const compilers = {
    html: compileHTML,
    pug: compilePug,
    jade: compilePug
}

export default async function (template, extras, options) {
    return await compilers[extras.lang || 'html'].call(null, template, extras, options)
}
