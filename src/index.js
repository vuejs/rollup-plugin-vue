import { createFilter } from 'rollup-pluginutils';
import { writeFile } from 'fs';

import vueTransform from './vueTransform';
import DEFAULT_OPTIONS from './options';

function mergeOptions(options, defaults) {
    Object.keys(defaults).forEach((key) => {
        const val = defaults[key];

        if (key in options) {
            if (typeof options[key] === 'object') {
                mergeOptions(options[key], val);
            }
        } else {
            options[key] = val;
        }
    });

    return options;
}

export default function vue(options = {}) {
    const filter = createFilter(options.include, options.exclude);

    delete options.include;
    delete options.exclude;

    /* eslint-disable */
    try {
        const vueVersion = require('vue').version;
        if (parseInt(vueVersion.split('.')[0], 10) >= 2) {
            if (!('compileTemplate' in options)) {
                options.compileTemplate = true;
            }
        } else {
            if (options.compileTemplate === true) {
                console.warn('Vue version < 2.0.0 does not support compiled template.');
            }
            options.compileTemplate = false;
        }
    } catch (e) {
    }
    /* eslint-enable */

    options = mergeOptions(options, DEFAULT_OPTIONS);

    const styles = {};
    let rollupOptions = {};
    let generated = false;
    const generateStyleBundle = () => {
        if (options.css === false) {
            return;
        }

        if (generated) {
            return;
        }

        generated = true;

        // Combine all stylesheets.
        let css = '';
        Object.keys(styles).forEach((key) => {
            css += styles[key].content || '';
        });

        // Emit styles through callback
        if (typeof options.css === 'function') {
            options.css(css, styles);
            return;
        }

        // Don't generate empty style file.
        if (!css.trim().length) {
            return;
        }

        let dest = options.css;
        if (typeof dest !== 'string') {
            // Guess destination filename
            dest = rollupOptions.dest || 'bundle.js';
            if (dest.endsWith('.js')) {
                dest = dest.slice(0, -3);
            }
            dest = `${dest}.css`;
        }

        // Emit styles to file
        writeFile(dest, css, (err) => {
            if (err) {
                throw err;
            }
            emitted(dest, css.length);
        });
    };

    return {
        name: 'vue',
        options(o) {
            rollupOptions = o;
            return o;
        },
        transform(source, id) {
            if (!filter(id) || !id.endsWith('.vue')) {
                return null;
            }

            const { js, css } = vueTransform(source, id, options);

            // Map of every stylesheet
            styles[id] = css || {};

            // Component javascript with inlined html template
            return js;
        },
        transformBundle(source) {
            generateStyleBundle();

            return source.replace(/if[\s]*\('__VUE_WITH_STATEMENT__'\)/g, 'with(this)');
        },
        ongenerate(opts, rendered) {
            generateStyleBundle();
            rendered.code = rendered.code.replace(
                /if[\s]*\('__VUE_WITH_STATEMENT__'\)/g, 'with(this)');
        },
    };
}

function emitted(text, bytes) {
    console.log(green(text), getSize(bytes));
}

function green(text) {
    return `\u001b[1m\u001b[32m${text}\u001b[39m\u001b[22m`;
}

function getSize(bytes) {
    if (bytes < 10000) {
        return `${bytes.toFixed(0)} B`;
    }
    return bytes < 1024000
          ? `${(bytes / 1024).toPrecision(3)} kB'`
          : `${(bytes / 1024 / 1024).toPrecision(4)} MB`;
}
