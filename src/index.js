import {createFilter} from 'rollup-pluginutils';
import {compiler} from 'vueify';

export default plugin;


function plugin(options = {}) {
    let filter = createFilter(options.include || '**/*.vue', options.exclude || 'node_modules/**');

    return {
        transform(code, id) {
            if (!filter(id)) {
                return null;
            }

            return new Promise(
                function (resolve, reject) {
                    compiler['compile'](code, id, function (error, compiled) {
                        let temp = {
                            code: compiled,
                            map: {mappings: ''}
                        };

                        if (error) {
                            temp.error = error;
                            reject(temp);
                        }

                        resolve(temp);
                    });
                }
            );
        }
    };
}

plugin.compiler = compiler;
plugin.version = '1.0.2';

