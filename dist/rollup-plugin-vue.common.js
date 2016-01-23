/*!
 * rollup-plugin-vue v1.0.2
 * (c) 2016 undefined
 * Release under the MIT License.
 */
'use strict';

var rollupPluginutils = require('rollup-pluginutils');
var vueify = require('vueify');

function plugin() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var filter = rollupPluginutils.createFilter(options.include || '**/*.vue', options.exclude || 'node_modules/**');

    return {
        transform: function transform(code, id) {
            if (!filter(id)) {
                return null;
            }

            return new Promise(function (resolve, reject) {
                vueify.compiler['compile'](code, id, function (error, compiled) {
                    var temp = {
                        code: compiled,
                        map: { mappings: '' }
                    };

                    if (error) {
                        temp.error = error;
                        reject(temp);
                    }

                    resolve(temp);
                });
            });
        }
    };
}

plugin.compiler = vueify.compiler;
plugin.version = '1.0.2';

module.exports = plugin;