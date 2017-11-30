import { templateJs, moduleJs, scopeJs, renderJs } from './injections'
import { coffee, typescript } from './script/index'

export default {
    // Style compilation options.
    styleToImports: false,
    autoStyles: true,
    disableCssModuleStaticReplacement: false,

    // Template compilation options.
    compileTemplate: true,

    compileOptions: {},

    // Config for html-minifier.
    htmlMinifier: {
        caseSensitive: true,
        customAttrSurround: [[/@/, new RegExp('')], [/:/, new RegExp('')]],
        collapseWhitespace: true,
        conservativeCollapse: true,
        keepClosingSlash: true,
        removeComments: true
    },

    // Handle with(this)
    vue: {
        // Remove all transforms added by vue since it's up to the user
        // to use whatever he wants
        // https://github.com/vuejs/vue-template-es2015-compiler/blob/master/index.js#L6
        transforms: {
            stripWith: true, // remove the with statement

            arrow: false,
            classes: false,
            collections: false,
            computedProperty: false,
            conciseMethodProperty: false,
            constLoop: false,
            dangerousForOf: false,
            dangerousTaggedTemplateString: false,
            defaultParameter: false,
            destructuring: false,
            forOf: false,
            generator: false,
            letConst: false,
            modules: false,
            numericLiteral: false,
            parameterDestructuring: false,
            reservedProperties: false,
            spreadRest: false,
            stickyRegExp: false,
            templateString: false,
            unicodeRegExp: false
        }
    },

    // Config for postcss-modules.
    cssModules: {
        generateScopedName: '[name]__[local]'
    },

    // Config for node-sass.
    scss: {},

    // Config for less.
    less: {},

    // Config for stylus.
    stylus: {},

    // Config for postcss.
    postcss: {},

    // Config for pug compiler.
    pug: {},

    // Custom injectors.
    inject: {
        template: {
            js: templateJs,
            ts: templateJs,
            coffee: templateJs
        },

        render: {
            js: renderJs,
            ts: renderJs,
            coffee: renderJs
        },

        module: {
            js: moduleJs,
            ts: moduleJs,
            coffee: moduleJs
        },

        scoped: {
            js: scopeJs,
            ts: scopeJs,
            coffee: scopeJs
        }
    },

    // script languages.
    script: {
        coffee,
        ts: typescript
    }
}
