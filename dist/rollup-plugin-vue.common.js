/*!
 * rollup-plugin-vue v2.0.0
 * (c) 2016 Rahul Kadyan <hi@znck.me>
 * Release under the MIT License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
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
    removeOptionalTags: true
  }
}

/**
 * Check the lang attribute of a parse5 node.
 *
 * @param {Node} node
 * @return {String|undefined}
 */
function checkLang (node) {
  if (node.attrs) {
    var i = node.attrs.length
    while (i--) {
      var attr = node.attrs[i]
      if (attr.name === 'lang') {
        return attr.value
      }
    }
  }
}

/**
 * Pad content with empty lines to get correct line number in errors.
 *
 * @param content
 * @returns {string}
 */
function padContent (content) {
  return content
      .split(/\r?\n/g)
      .map(function () { return '' })
      .join('\n')
}

/**
 * Only support for es5 modules
 *
 * @param content
 * @returns {string}
 */
function injectTemplate (script, template) {
  var matches = /(export default[^{]*\{)/g.exec(script)
  if (matches) {
    return script.split(matches[1]).join(((matches[1]) + " template: " + (JSON.stringify(template)) + ","))
  }
  throw new Error('[rollup-plugin-vue] could not find place to inject template in script.')
}

/**
 * Compile template: DeIndent and minify html.
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 */
function processTemplate (node, filePath, content) {
  var template = deIndent(parse5.serialize(node.content))
  var warnings = validateTemplate(node.content, content)
  if (warnings) {
    var relativePath = path.relative(process.cwd(), filePath)
    warnings.forEach(function (msg) {
      console.warn(("\n Warning in " + relativePath + ":\n " + msg))
    })
  }
  return htmlMinifier.minify(template, options.htmlMinifier)
}

/**
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 * @param {string} template
 */
function processScript (node, filePath, content, template) {
  var lang = checkLang(node) || 'js'
  var script = parse5.serialize(node)
  // pad the script to ensure correct line number for syntax errors
  var location = content.indexOf(script)
  var before = padContent(content.slice(0, location))
  script = before + script
  script = injectTemplate(script, template, lang)
  script = deIndent(script)
  return script
}

function vueTransform (code, filePath) {
  // 1. Parse the file into an HTML tree
  var fragment = parse5.parseFragment(code, {locationInfo: true})

  // 2. Walk through the top level nodes and check for their types
  var nodes = {}
  for (var i = fragment.childNodes.length - 1; i >= 0; i--) {
    nodes[fragment.childNodes[i].nodeName] = fragment.childNodes[i]
  }

  // 3. Don't touch files that don't look like Vue components
  if (!nodes.template && !nodes.script) {
    throw new Error('There must be at least one script tag or one template tag per *.vue file.')
  }

  // 4. Process style
  if (nodes.style) {
    console.warn('<style> is not yet supported')
  }

  // 5. Process template
  var template = processTemplate(nodes.template, filePath, code)

  // 6. Process script
  return processScript(nodes.script, filePath, code, template)
}

function vue (options) {
  if ( options === void 0 ) options = {};

  var filter = rollupPluginutils.createFilter(options.include, options.exclude)

  return {
    name: 'vue',
    transform: function transform (code, id) {
      if (!filter(id) || !id.endsWith('.vue')) {
        return null
      }

      return vueTransform(code, id)
    }
  }
}

module.exports = vue;