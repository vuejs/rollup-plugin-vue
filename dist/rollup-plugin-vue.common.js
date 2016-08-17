/*!
 * rollup-plugin-vue v2.0.0
 * (c) 2016 undefined
 * Release under the MIT License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
var deIndent = _interopDefault(require('de-indent'));
var validateTemplate = _interopDefault(require('vue-template-validator'));
var path = require('path');
var path__default = _interopDefault(path);
var parse5 = _interopDefault(require('parse5'));
var htmlMinifier = _interopDefault(require('html-minifier'));
var chalk = _interopDefault(require('chalk'));
var buble = _interopDefault(require('buble'));
var fs = _interopDefault(require('fs'));
var postcss = _interopDefault(require('postcss'));
var objectAssign = _interopDefault(require('object-assign'));

var defaultBubleOptions = {
  transforms: {
    modules: false
  }
}
// Not sure if 'buble.config.js' is the supposed filename
var bubleOptionsPath = path__default.resolve(process.cwd(), 'buble.config.js')
var bubleOptions = fs.existsSync(bubleOptionsPath) && getBubleConfig() || defaultBubleOptions

function getBubleConfig () {
  var rc = null
  try {
    rc = JSON.parse(fs.readFileSync(bubleOptionsPath, 'utf-8'))
  } catch (e) {
    throw new Error('[rollup-plugin-vue] Your buble.config.js seems to be incorrectly formatted.')
  }
  return rc
}

var options = {
  autoprefixer: {remove: false},
  buble: bubleOptions,
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
  },
  postcss: {
    plugins: [],
    options: {}
  }
}

function last (arr) {
  if (arr && arr.length) {
    return arr[arr.length - 1]
  }
  return arr
}
var buble$1 = {
  compile: function compile (code, _, id) {
    var res = buble.transform(code, options.buble)
    return {
      code: res.code,
      map: res.map,
      type: 'script'
    }
  },
  inject: function inject (script, template) {
    var matches = /(export default[^{]*\{)/g.exec(script)
    if (matches) {
      return script.split(matches[1]).join(((matches[1]) + " template: " + (JSON.stringify(template)) + ","))
    }
    console.log('Lang: buble\n Script: ' + last(script.split('export default')))
    throw new Error('[rollup-vue-plugin] failed to inject template in script.\n Create an issue at https://github.com/znck/rollup-plugin-vue/issues. Include above text.')
  }
}

var compilers = {buble: buble$1}

require('es6-promise').polyfill()

/**
 * Ensure there's only one template node.
 *
 * @param {DocumentFragment} fragment
 * @return {Boolean}
 */
function validateNodeCount (fragment) {
  var count = 0
  fragment.childNodes.forEach(function (node) {
    if (node.nodeName === 'template') {
      count++
    }
  })
  return count <= 1
}

/**
 * Parse string into an HTML tree
 *
 * @param {string} content
 * @returns {DocumentFragment}
 */
function parseContent (content) {
  // noinspection JSValidateTypes
  return parse5.parseFragment(content, {locationInfo: true})
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

var Compiler = function Compiler (options) {
  if ( options === void 0 ) options = {};

  this.options = options
};
Compiler.prototype.compile = function compile (content, filePath) {
    var this$1 = this;

  // 1. Parse the file into an HTML tree
  var fragment = parseContent(content)

  // 2. Check number of nodes.
  if (!validateNodeCount(fragment)) {
    throw new Error('Only one script tag and one template tag allowed per *.vue file.')
  }

  // 3. Walk through the top level nodes and check for their
  //  types & languages. If there are pre-processing needed,
  //  then push it into a jobs list.
  /**
   * @type {{script: Node, template: Node, style: Node}}
   */
  var components = {}
  for (var i = 0, list = fragment.childNodes; i < list.length; i += 1) {
    var node = list[i];

      components[node.nodeName] = node
  }
  var promise = new Promise(function (resolve) {resolve()})
  return promise
      .then(function () {
        return this$1.processTemplate(components.template, filePath, content)
      })
      .then(function (template) {
        if (components.style) {
          return this$1.processStyle(components.style, filePath, content)
              .then(function (style) {
                return {template: template.code, style: style.code}
              })
        }
        return {template: template.code, style: ''}
      })
      .then(function (compiled) {
        return this$1.processScript(components.script, filePath, content, compiled)
      })
};

/**
 * Check src import for a node, relative to the filePath if
 * available. Using readFileSync for now since this is a
 * rare use case.
 *
 * @param {Node} node
 * @param {String} filePath
 * @return {String}
 */
Compiler.prototype.checkSrc = function checkSrc (node, filePath) {
  // TODO: Up next. ${node}, ${filePath}
  return null
};

/**
 * Compile template: DeIndent and minify html.
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 */
Compiler.prototype.processTemplate = function processTemplate (node, filePath, content) {
    var this$1 = this;

  var template = deIndent(this.checkSrc(node, filePath) || parse5.serialize(node.content))
  var lang = checkLang(node)
  if (!lang) {
    var warnings = validateTemplate(node.content, content)
    if (warnings) {
      var relativePath = path.relative(process.cwd(), filePath)
      warnings.forEach(function (msg) {
        console.warn(chalk.red(("\n Error in " + relativePath + ":\n " + msg)))
      })
    }
  }
  return this.compileAsPromise('template', template, lang, filePath)
      .then(function (res) {
        res.code = htmlMinifier.minify(res.code, this$1.options.htmlMinifier)
        return res
      })
};
/**
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 * @param {*} compiled
 */
Compiler.prototype.processScript = function processScript (node, filePath, content, compiled) {
  var lang = checkLang(node) || 'buble'
  var script = this.checkSrc(node, filePath)
  var template = compiled.template;
  if (!script) {
    script = parse5.serialize(node)
    // pad the script to ensure correct line number for syntax errors
    var location = content.indexOf(script)
    var before = padContent(content.slice(0, location))
    script = before + script
  }
  script = this.injectTemplate(script, template, lang)
  script = deIndent(script)
  return this.compileAsPromise('script', script, lang, filePath)
      .then(function (res) {
        return {code: res.code}
      })
};
/**
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 */
Compiler.prototype.processStyle = function processStyle (node, filePath, content) {
    var this$1 = this;

  var lang = checkLang(node) || 'css'
  var style = this.checkSrc(node, filePath)
  var injectFnName = '__$styleInject'
  if (!style) {
    style = parse5.serialize(node)
    var location = content.indexOf(style)
    var before = padContent(content.slice(0, location))
    style = before + style
  }
  var options = this.options.postcss
  options.from = filePath
  options.to = filePath
  return this.compileAsPromise('style', style, lang, filePath)
      .then(function (res) {
        return postcss(this$1.options.postcss.plugins || [])
            .process(res.code, options)
            .then(function (res) {
              var code = "export " + injectFnName + "(" + (JSON.stringify(res.css)) + ");"
              return {code: code, type: 'style'}
            })
      })
};

Compiler.prototype.compileAsPromise = function compileAsPromise (type, code, lang, filePath) {
    var this$1 = this;

  var compiler = compilers[lang]
  if (compiler) {
    return new Promise(function (resolve, reject) {
      try {
        var compiled = compiler.compile(code, this$1, filePath)
        resolve(compiled)
      } catch (e) {
        reject(e)
      }
    })
  }
  return Promise.resolve({code: code, type: type})
};

Compiler.prototype.injectTemplate = function injectTemplate (script, template, lang) {
  var compiler = compilers[lang]
  if (compiler) {
    return compiler.inject(script, template)
  }
  throw new Error(("rollup-plugin-vue cannot inject template in " + lang + " script."))
};

function plugin (options$$) {
  if ( options$$ === void 0 ) options$$ = {};

  options$$ = objectAssign({}, options, options$$, {extensions: ['.vue'] })
  var filter = rollupPluginutils.createFilter(options$$.include, options$$.exclude)
  var extensions = options$$.extensions
  delete options$$.extensions
  delete options$$.include
  delete options$$.exclude

  var compiler = new Compiler(options$$)

  return {
    transform: function transform (code, id) {
      if (!filter(id)) { return null }
      if (extensions.indexOf(path__default.extname(id)) === -1) { return null }

      return new Promise(function (resolve) {
        compiler
            .compile(code, id)
            .then(function (compiled) { return resolve(compiled); })
      })
    }
  }
}

module.exports = plugin;