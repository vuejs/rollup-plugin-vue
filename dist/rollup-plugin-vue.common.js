/*!
 * rollup-plugin-vue v1.0.3
 * (c) 2016 undefined
 * Release under the MIT License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
var deIndent = _interopDefault(require('de-indent'));
var validateTemplate = _interopDefault(require('vue-template-validator'));
var path = _interopDefault(require('path'));
var parse5 = _interopDefault(require('parse5'));
var htmlMinifier = _interopDefault(require('html-minifier'));
var chalk = _interopDefault(require('chalk'));
var babel = _interopDefault(require('babel-core'));
var fs = _interopDefault(require('fs'));
var objectAssign = _interopDefault(require('object-assign'));

var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers;

var defaultBabelOptions = {
  presets: ['es2015-rollup']
};
var babelRcPath = path.resolve(process.cwd(), '.babelrc');
var babelOptions = fs.existsSync(babelRcPath) ? getBabelRc() || defaultBabelOptions : defaultBabelOptions;

function getBabelRc() {
  var rc = null;
  try {
    rc = JSON.parse(fs.readFileSync(babelRcPath, 'utf-8'));
  } catch (e) {
    throw new Error('[rollup-plugin-vue] Your .babelrc seems to be incorrectly formatted.');
  }
  return rc;
}

var options = {
  autoprefixer: { remove: false },
  babel: babelOptions,
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
};

function last(arr) {
  if (arr && arr.length) {
    return arr[arr.length - 1];
  }
  return arr;
}
var babel$1 = {
  compile: function compile(code, _, id) {
    var res = babel.transform(code, options.babel);
    return {
      code: res.code,
      map: res.map,
      type: 'script'
    };
  },
  inject: function inject(script, template) {
    var matches = /(export default[^{]*\{)/g.exec(script);
    if (matches) {
      return script.split(matches[1]).join(matches[1] + ' template: ' + JSON.stringify(template) + ',');
    }
    console.log('Lang: babel\n Script: ' + last(script.split('export default')));
    throw new Error('[rollup-vue-plugin] failed to inject template in script.\n Create an issue at https://github.com/znck/rollup-plugin-vue/issues. Include above text.');
  }
};

var compilers = { babel: babel$1 };

/**
 * Ensure there's only one template node.
 *
 * @param {DocumentFragment} fragment
 * @return {Boolean}
 */
function validateNodeCount(fragment) {
  var count = 0;
  fragment.childNodes.forEach(function (node) {
    if (node.nodeName === 'template') {
      count++;
    }
  });
  return count <= 1;
}

/**
 * Parse string into an HTML tree
 *
 * @param {string} content
 * @returns {DocumentFragment}
 */
function parseContent(content) {
  return parse5.parseFragment(content, { locationInfo: true });
}

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
}

function padContent(content) {
  return content.split(/\r?\n/g).map(function () {
    return '';
  }).join('\n');
}

var Compiler = function () {
  function Compiler() {
    babelHelpers.classCallCheck(this, Compiler);
  }

  babelHelpers.createClass(Compiler, [{
    key: 'compile',
    value: function compile(content, filePath) {
      var _this = this;

      // 1. Parse the file into an HTML tree
      var fragment = parseContent(content);

      // 2. Check number of nodes.
      if (!validateNodeCount(fragment)) {
        throw new Error('Only one script tag and one template tag allowed per *.vue file.');
      }

      // 3. Walk through the top level nodes and check for their
      //    types & languages. If there are pre-processing needed,
      //    then push it into a jobs list.
      /**
       * @type {{script: Node, template: Node, style: Node}}
       */
      var components = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = fragment.childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          components[node.nodeName] = node;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var promise = new Promise(function (resolve) {
        resolve();
      });
      return promise.then(function () {
        return _this.processTemplate(components.template, filePath, content);
      }).then(function (compiled) {
        return _this.processScript(components.script, filePath, content, compiled);
      });
    }

    /**
     * Check src import for a node, relative to the filePath if
     * available. Using readFileSync for now since this is a
     * rare use case.
     *
     * @param {Node} node
     * @param {String} filePath
     * @return {String}
     */

  }, {
    key: 'checkSrc',
    value: function checkSrc(node, filePath) {
      // TODO: Up next.
      return null;
    }
    /**
     * @param {Node} node
     * @param {string} filePath
     * @param {string} content
     */

  }, {
    key: 'processTemplate',
    value: function processTemplate(node, filePath, content) {
      var template = deIndent(this.checkSrc(node, filePath) || parse5.serialize(node.content));
      var lang = checkLang(node);
      if (!lang) {
        var warnings = validateTemplate(node.content, content);
        if (warnings) {
          (function () {
            var relativePath = path.relative(process.cwd(), filePath);
            warnings.forEach(function (msg) {
              console.warn(chalk.red('\n Error in ' + relativePath + ':\n ' + msg));
            });
          })();
        }
      }

      return this.compileAsPromise('template', template, lang, filePath).then(function (res) {
        res.code = htmlMinifier.minify(res.code, options.htmlMinifier);
        return res;
      });
    }
    /**
     * @param {Node} node
     * @param {string} filePath
     * @param {string} content
     * @param {*} compiled
     */

  }, {
    key: 'processScript',
    value: function processScript(node, filePath, content, compiled) {
      var lang = checkLang(node) || 'babel';
      var script = this.checkSrc(node, filePath);
      if (!script) {
        script = parse5.serialize(node);
        // pad the script to ensure correct line number for syntax errors
        var location = content.indexOf(script);
        var before = padContent(content.slice(0, location));
        script = before + script;
      }
      script = this.injectTemplate(script, compiled.code, lang);
      script = deIndent(script);
      return this.compileAsPromise('script', script, lang, filePath);
    }
    /**
     * @param {Node} node
     * @param {string} path
     * @param {string} content
     */

  }, {
    key: 'processStyle',
    value: function processStyle(node, path, content) {}
  }, {
    key: 'compileAsPromise',
    value: function compileAsPromise(type, code, lang, filePath) {
      var _this2 = this;

      var compiler = compilers[lang];
      if (compiler) {
        return new Promise(function (resolve, reject) {
          try {
            var compiled = compiler.compile(code, _this2, filePath);
            resolve(compiled);
          } catch (e) {
            reject(e);
          }
        });
      }
      return Promise.resolve({ code: code, type: type });
    }
  }, {
    key: 'injectTemplate',
    value: function injectTemplate(script, template, lang) {
      var compiler = compilers[lang];
      if (compiler) {
        return compiler.inject(script, template);
      }
      throw new Error('rollup-plugin-vue cannot inject template in ' + lang + ' script.');
    }
  }]);
  return Compiler;
}();

var compiler = new Compiler();

function plugin() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  options = objectAssign({}, options, { extensions: ['.vue'] });
  var filter = rollupPluginutils.createFilter(options.include, options.exclude);
  var extensions = options.extensions;
  delete options.extensions;
  delete options.include;
  delete options.exclude;

  return {
    transform: function transform(code, id) {
      if (!filter(id)) return null;
      if (extensions.indexOf(path.extname(id)) === -1) return null;

      return new Promise(function (resolve) {
        compiler.compile(code, id).then(function (compiled) {
          return resolve(compiled);
        });
      });
    }
  };
}

module.exports = plugin;