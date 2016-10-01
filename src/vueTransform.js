import deIndent from 'de-indent';
import htmlMinifier from 'html-minifier';
import parse5 from 'parse5';
import validateTemplate from 'vue-template-validator';
import { relative } from 'path';
import MagicString from 'magic-string';

/**
 * Check the lang attribute of a parse5 node.
 *
 * @param {Node|*} node
 * @return {String|undefined}
 */
function checkLang(node) {
    if (node.attrs) {
        for (const attr of node.attrs) {
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
    code = code.replace(/with\(this\)/g, 'if(window.__VUE_WITH_STATEMENT__)');
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
    node = node.content;
    const warnings = validateTemplate(node, content);
    if (warnings) {
        const relativePath = relative(process.cwd(), filePath);
        warnings.forEach((msg) => {
            console.warn(`\n Warning in ${relativePath}:\n ${msg}`);
        });
    }

    /* eslint-disable no-underscore-dangle */
    const start = node.childNodes[0].__location.startOffset;
    const end = node.childNodes[node.childNodes.length - 1].__location.endOffset;
    const template = deIndent(content.slice(start, end));
    /* eslint-enable no-underscore-dangle */

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

    const map = new MagicString(script);

    if (template) {
        script = injectTemplate(script, template, lang);
    } else if (render) {
        script = injectRender(script, render, lang);
    }
    script = deIndent(script);

    return {
        code: script,
        map,
    };
}

export default function vueTransform(code, filePath, options) {
    // 1. Parse the file into an HTML tree
    const fragment = parse5.parseFragment(code, { locationInfo: true });

    // 2. Walk through the top level nodes and check for their types
    const nodes = {};
    for (let i = fragment.childNodes.length - 1; i >= 0; i -= 1) {
        nodes[fragment.childNodes[i].nodeName] = fragment.childNodes[i];
    }

    // 3. Don't touch files that don't look like Vue components
    if (!nodes.script) {
        throw new Error('There must be at least one script tag or one' +
              ' template tag per *.vue file.');
    }

    // 4. Process template
    const template = nodes.template
          ? processTemplate(nodes.template, filePath, code, options)
          : undefined;
    let js;
    if (options.compileTemplate) {
        /* eslint-disable */
        const render = template ? require('vue-template-compiler').compile(template) : undefined;
        /* eslint-enable */
        js = processScript(nodes.script, filePath, code, { render });
    } else {
        js = processScript(nodes.script, filePath, code, { template });
    }

    // 5. Process script & style
    return {
        js: js.code,
        map: js.map,
        css: nodes.style && {
            content: parse5.serialize(nodes.style),
            lang: checkLang(nodes.style),
        },
    };
}
