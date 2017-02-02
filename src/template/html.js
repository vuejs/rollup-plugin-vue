import postHtml from 'posthtml'
import parseAttrs from 'posthtml-attrs-parser'

const plugin = (modules) => {
    return function cssModules (tree) {
        tree.match({attrs: {'class': /\w+/}}, node => {
            const attrs = parseAttrs(node.attrs)

            if (attrs.class) {
                attrs.class = attrs.class.map(c => modules[c] || c)

                node.attrs = attrs.compose()
            }

            return node
        })
    }
}

export default async function (template, extras, options) {
    if ('modules' in extras && Object.keys(extras.modules).length) {
        const output = await postHtml([
            plugin(extras.modules)
        ]).process(template)

        return output.html
    }

    return template
}
