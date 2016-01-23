/* globals process */

import {createFilter} from 'rollup-pluginutils';
const {compiler} = require('vueify');

export default vue;

function vue(options = {}) {
    let filter = createFilter(options['include'], options['exclude']);

    return {
        transform(code, id) {
            if (!filter(id)) return;

            const promise = new Promise(
                function (resolve, reject) {
                    compiler.compile(code, id, function (error, compiled) {
                        if (error) reject(compiled);

                        resolve(compiled);
                    });
                }
            );

            return promise;
        }
    };
}
