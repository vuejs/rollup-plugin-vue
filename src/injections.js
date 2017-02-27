import transpileVueTemplate from 'vue-template-es2015-compiler'

export function templateJs (script, template, lang, id, options, modules) {
    if (template === undefined) return script

    const matches = /(export default[^{]*\{)/g.exec(script)

    if (matches && matches.length) {
        return script.split(matches[1]).join(`${matches[1]} template: ${JSON.stringify(template)},`)
    }

    throw new Error(
          `[rollup-plugin-vue] Template is injected in the default export of .vue file (lang: ${lang}). In ${id}, it cannot find 'export defaults'.`
    )
}

/**
 * Wrap code inside a with statement inside a function
 * This is necessary for Vue 2 template compilation
 */
function wrapRenderFunction (code) {
    return `function(){${code}}`
}

export function renderJs (script, render, lang, id, options) {
    const matches = /(export default[^{]*\{)/g.exec(script)

    if (matches && matches.length) {
        let renderScript = 'module.exports={' +
              `render: ${wrapRenderFunction(render.render)},` +
              'staticRenderFns: [' +
              `${render.staticRenderFns.map(wrapRenderFunction).join(',')}],}`

        if (options.stripWith !== false) {
            renderScript = transpileVueTemplate(renderScript, options.vue)
        }

        return script.split(matches[1]).join(renderScript.replace('module.exports={', 'export default {').replace(/\}$/, ''))
    }

    throw new Error(
          `[rollup-plugin-vue] Generated render function is injected in the default export of .vue file (lang: ${lang}). In ${id}, it cannot find 'export defaults'.`
    )
}

export function moduleJs (script, modules, lang, id, options) {
    if (Object.keys(modules).length === 0) return script

    const matches = /(export default[^{]*\{)/g.exec(script)

    if (matches && matches.length) {
        const moduleScript = `${matches[1]}cssModules: ${JSON.stringify(modules)},`

        return script.split(matches[1]).join(moduleScript)
    }

    throw new Error(
          `[rollup-plugin-vue] CSS modules are injected in the default export of .vue file (lang: ${lang}). In ${id}, it cannot find 'export defaults'.`
    )
}

export function injectTemplate (script, template, lang, id, options) {
    if (lang in options.inject.template) {
        return options.inject.template[lang](script, template, lang, id, options)
    }
    throw new Error(
          `[rollup-plugin-vue] Template is injected in the default export of .vue file. In ${id}, it cannot find 'export defaults'.`
    )
}

export function injectRender (script, render, lang, id, options) {
    if (lang in options.inject.render) {
        return options.inject.render[lang](script, render, lang, id, options)
    }

    throw new Error(
          `[rollup-plugin-vue] Generated render function is injected in the default export of .vue file. In ${id}, it cannot find 'export defaults'.`
    )
}

export function injectModule (script, modules, lang, id, options) {
    if (lang in options.inject.module) {
        return options.inject.module[lang](script, modules, lang, id, options)
    }

    throw new Error(
          `[rollup-plugin-vue] CSS modules are injected in the default export of .vue file. In ${id}, it cannot find 'export defaults'.`
    )
}
