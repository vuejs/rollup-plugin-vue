/*!
 * rollup-plugin-vue v1.0.0
 * (c) 2016 undefined
 * Release under the MIT License.
 */
'use strict';

var rollupPluginutils = require('rollup-pluginutils');

var _require = require('vueify');

var compiler = _require.compiler;

function plugin() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var filter = rollupPluginutils.createFilter(options['include'], options['exclude']);

    return {
        transform: function transform(code, id) {
            if (!filter(id)) return;

            return new Promise(function (resolve, reject) {
                compiler['compile'](code, id, function (error, compiled) {
                    if (error) reject(compiled);

                    resolve(compiled);
                });
            });
        }
    };
}

plugin.version = '1.0.0';

module.exports = plugin;