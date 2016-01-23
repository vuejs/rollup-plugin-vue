import {createFilter} from 'rollup-pluginutils';
const {compiler} = require('vueify');

export default plugin;

function plugin(options = {}) {
    let filter = createFilter(options['include'], options['exclude']);

    return {
        transform(code, id) {
            if (!filter(id)) return;

            return new Promise(
                function (resolve, reject) {
                    compiler['compile'](code, id, function (error, compiled) {
                        if (error) reject(compiled);

                        resolve(compiled);
                    });
                }
            );
        }
    };
}

plugin.version = '1.0.1';

