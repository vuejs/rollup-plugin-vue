import { createFilter } from 'rollup-pluginutils';
import { writeFile } from 'fs';

import vueTransform from './vueTransform';

export default function vue(options = {}) {
    const filter = createFilter(options.include, options.exclude);
    const cssContent = {};
    const cssLang = {};
    let dest = 'bundle.js';

    return {
        name: 'vue',
        transform(source, id) {
            if (!filter(id) || !id.endsWith('.vue')) {
                return null;
            }

            const ref = vueTransform(source, id);

            // Map of every stylesheet content
            cssContent[id] = ref.css || '';

            // Map of every stylesheet lang
            cssLang[id] = ref.cssLang || 'css';

            // Component javascript with inlined html template
            return ref.js;
        },
        ongenerate(opts) {
            if (options.css === false) {
                return;
            }

            // Combine all stylesheets
            let css = '';
            Object.keys(cssContent).forEach((key) => {
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
                options.css = `${dest}.css`;
                /* eslint-enable */
            }

            writeFile(options.css, css, (err) => {
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
    return `\u001b[1m\u001b[32m${text}\u001b[39m\u001b[22m`;
}

function getSize(size) {
    const bytes = size / 1024;
    return bytes < 1000 ? `${bytes.toPrecision(3)} kB` : `${(bytes / 1024).toPrecision(3)} MB`;
}
