export default {
    htmlMinifier: {
        customAttrSurround: [[/@/, new RegExp('')], [/:/, new RegExp('')]],
        collapseWhitespace: true,
        removeComments: true
    },
    vue: {
        // Remove all trasforms added by vue since it's up to the user
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
    }
}
