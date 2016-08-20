'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
var fs = require('fs');
var deIndent = _interopDefault(require('de-indent'));
var htmlMinifier = _interopDefault(require('html-minifier'));
var parse5 = _interopDefault(require('parse5'));
var validateTemplate = _interopDefault(require('vue-template-validator'));
var path = require('path');

var options = {
    htmlMinifier: {
        customAttrSurround: [[/@/, new RegExp('')], [/:/, new RegExp('')]],
        collapseWhitespace: true,
        removeComments: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        // this is disabled by default to avoid removing
        // "type" on <input type="text">
        removeRedundantAttributes: false,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
    },
};

/**
 * Check the lang attribute of a parse5 node.
 *
 * @param {Node} node
 * @return {String|undefined}
 */
function checkLang(node) {
    if (node.attrs) {
        var i = node.attrs.length;
        while (i--) {
            var attr = node.attrs[i];
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
          .map(function () { return ''; })
          .join('\n');
}

/**
 * Only support for es5 modules
 *
 * @param script
 * @param template
 * @returns {string}
 */
function injectTemplate(script, template) {
    var matches = /(export default[^{]*\{)/g.exec(script);
    if (matches) {
        return script.split(matches[1])
              .join(((matches[1]) + " template: " + (JSON.stringify(template)) + ","));
    }
    throw new Error('[rollup-plugin-vue] could not find place to inject template in script.');
}

/**
 * Compile template: DeIndent and minify html.
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 */
function processTemplate(node, filePath, content) {
    var template = deIndent(parse5.serialize(node.content));
    var warnings = validateTemplate(node.content, content);
    if (warnings) {
        var relativePath = path.relative(process.cwd(), filePath);
        warnings.forEach(function (msg) {
            console.warn(("\n Warning in " + relativePath + ":\n " + msg));
        });
    }
    return htmlMinifier.minify(template, options.htmlMinifier);
}

/**
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 * @param {string} template
 */
function processScript(node, filePath, content, template) {
    var lang = checkLang(node) || 'js';
    var script = parse5.serialize(node);
    // pad the script to ensure correct line number for syntax errors
    var location = content.indexOf(script);
    var before = padContent(content.slice(0, location));
    script = before + script;
    script = injectTemplate(script, template, lang);
    script = deIndent(script);
    return script;
}

function vueTransform(code, filePath) {
    // 1. Parse the file into an HTML tree
    var fragment = parse5.parseFragment(code, { locationInfo: true });

    // 2. Walk through the top level nodes and check for their types
    var nodes = {};
    for (var i = fragment.childNodes.length - 1; i >= 0; i--) {
        nodes[fragment.childNodes[i].nodeName] = fragment.childNodes[i];
    }

    // 3. Don't touch files that don't look like Vue components
    if (!nodes.template && !nodes.script) {
        throw new Error('There must be at least one script tag or one' +
              ' template tag per *.vue file.');
    }

    // 4. Process template
    var template = processTemplate(nodes.template, filePath, code);

    // 5. Process script
    var output = {
        js: processScript(nodes.script, filePath, code, template),
    };

    // 6. Process style
    if (nodes.style) {
        output.css = parse5.serialize(nodes.style);
        output.cssLang = checkLang(nodes.style);
    }

    return output;
}

function vue(options) {
    if ( options === void 0 ) options = {};

    var filter = rollupPluginutils.createFilter(options.include, options.exclude);
    var cssContent = {};
    var cssLang = {};
    var dest = 'bundle.js';

    return {
        name: 'vue',
        transform: function transform(source, id) {
            if (!filter(id) || !id.endsWith('.vue')) {
                return null;
            }

            var ref = vueTransform(source, id);

            // Map of every stylesheet content
            cssContent[id] = ref.css || '';

            // Map of every stylesheet lang
            cssLang[id] = ref.cssLang || 'css';

            // Component javascript with inlined html template
            return ref.js;
        },
        ongenerate: function ongenerate(opts) {
            if (options.css === false) {
                return;
            }

            // Combine all stylesheets
            var css = '';
            Object.keys(cssContent).forEach(function (key) {
                css += cssContent[key];
            });

            // Emit styles through callback or file
            if (typeof options.css === 'function') {
                options.css(css);

                return;
            }

            // Guess destination filename
            if (typeof options.css !== 'string') {
                dest = opts.dest || 'bundle.js';
                if (dest.endsWith('.js')) {
                    dest = dest.slice(0, -3);
                }
                /* eslint-disable */
                options.css = dest + ".css";
                /* eslint-enable */
            }

            fs.writeFile(options.css, css, function (err) {
                if (err) {
                    throw err;
                }
                emitted(options.css, css.length);
            });
        },
    };
}

function emitted(text, bytes) {
    console.log(green(text), getSize(bytes));
}

function green(text) {
    return ("\u001b[1m\u001b[32m" + text + "\u001b[39m\u001b[22m");
}

function getSize(size) {
    var bytes = size / 1024;
    return bytes < 1000 ? ((bytes.toPrecision(3)) + " kB") : (((bytes / 1024).toPrecision(3)) + " MB");
}

module.exports = vue;