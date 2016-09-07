import deIndent from 'de-indent';
import htmlMinifier from 'html-minifier';
import parse5 from 'parse5';
import validateTemplate from 'vue-template-validator';
import { relative } from 'path';

/**
 * Check the lang attribute of a parse5 node.
 *
 * @param {Node|*} node
 * @return {String|undefined}
 */
function checkLang(node) {
    if (node.attrs) {
        let i = node.attrs.length;
        while (i--) {
            const attr = node.attrs[i];
            if (attr.name === 'lang') {
                return attr.value;
            }
        }
    }
    return undefined;
}

/**
 * Pad content with empty lines to get correct line number in errors.
 *
 * @param content
 * @returns {string}
 */
function padContent(content) {
    return content
          .split(/\r?\n/g)
          .map(() => '')
          .join('\n');
}

/**
 * Wrap code inside a with statement inside a function
 * This is necessary for Vue 2 template compilation
 *
 * @param {string} code
 * @returns {string}
 */
function wrapRenderFunction(code) {
    // Replace with(this) by something that works on strict mode
    // https://github.com/vuejs/vue-template-es2015-compiler/blob/master/index.js
    code = code.replace(/with\(this\)/g, "if('__VUE_WITH_STATEMENT__')");
    return `function(){${code}}`;
}

/**
 * Only support for es5 modules
 *
 * @param script
 * @param render
 * @param lang
 * @returns {string}
 */
function injectRender(script, render, lang) {
    if (['js', 'babel'].indexOf(lang.toLowerCase()) > -1) {
        const matches = /(export default[^{]*\{)/g.exec(script);
        if (matches) {
            return script.split(matches[1])
                  .join(`${matches[1]}` +
                        `render: ${wrapRenderFunction(render.render)},` +
                        'staticRenderFns: [' +
                        `${render.staticRenderFns.map(wrapRenderFunction).join(',')}],`
                  );
        }
    }
    throw new Error('[rollup-plugin-vue] could not find place to inject template in script.');
}

/**
 * @param script
 * @param template
 * @param lang
 * @returns {string}
 */
function injectTemplate(script, template, lang) {
    if (['js', 'babel'].indexOf(lang.toLowerCase()) > -1) {
        const matches = /(export default[^{]*\{)/g.exec(script);
        if (matches) {
            return script.split(matches[1])
                  .join(`${matches[1]} template: ${JSON.stringify(template)},`);
        }
    }
    throw new Error('[rollup-plugin-vue] could not find place to inject template in script.');
}

/**
 * Compile template: DeIndent and minify html.
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 * @param {*} options
 */
function processTemplate(node, filePath, content, options) {
    const template = deIndent(parse5.serialize(node.content));
    const warnings = validateTemplate(node.content, content);
    if (warnings) {
        const relativePath = relative(process.cwd(), filePath);
        warnings.forEach((msg) => {
            console.warn(`\n Warning in ${relativePath}:\n ${msg}`);
        });
    }
    return htmlMinifier.minify(template, options.htmlMinifier);
}

/**
 * @param {Node|ASTNode} node
 * @param {string} filePath
 * @param {string} content
 * @param templateOrRender
 */
function processScript(node, filePath, content, templateOrRender) {
    const lang = checkLang(node) || 'js';
    const { template, render } = templateOrRender;
    let script = parse5.serialize(node);

    // pad the script to ensure correct line number for syntax errors
    const location = content.indexOf(script);
    const before = padContent(content.slice(0, location));
    script = before + script;

    if (template) {
        script = injectTemplate(script, template, lang);
    } else if (render) {
        script = injectRender(script, render, lang);
    }
    script = deIndent(script);

    return script;
}

export default function vueTransform(code, filePath, options) {
    // 1. Parse the file into an HTML tree
    const fragment = parse5.parseFragment(code, { locationInfo: true });

    // 2. Walk through the top level nodes and check for their types
    const nodes = {};
    for (let i = fragment.childNodes.length - 1; i >= 0; i--) {
        nodes[fragment.childNodes[i].nodeName] = fragment.childNodes[i];
    }

    // 3. Don't touch files that don't look like Vue components
    if (!nodes.template && !nodes.script) {
        throw new Error('There must be at least one script tag or one' +
              ' template tag per *.vue file.');
    }

    // 4. Process template
    const template = processTemplate(nodes.template, filePath, code, options);
    let js;
    if (options.compileTemplate) {
        /* eslint-disable */
        const render = require('vue-template-compiler').compile(template);
        /* eslint-enable */
        js = processScript(nodes.script, filePath, code, { render });
    } else {
        js = processScript(nodes.script, filePath, code, { template });
    }

    // 5. Process script & style
    return {
        js,
        css: nodes.style && {
            content: parse5.serialize(nodes.style),
            lang: checkLang(nodes.style),
        },
    };
}
