export default function (files, options) {
        if (options.css === false) {
            return;
        }

        // Combine all stylesheets.
        let css = '';
        const allStyles = [];

        Object.keys(files).forEach((file) => {
          files[file].forEach((style) => {
            css += style.code + '\n';
            allStyles.push(style);
          });
        });

        // Emit styles through callback
        if (typeof options.css === 'function') {
            options.css(css, allStyles);

            return;
        }

        // Don't generate empty style file.
        if (!css.trim().length) {
            return;
        }

        let dest = options.css;

        if (typeof dest !== 'string') {
            return;
        }

        // Emit styles to file
        writeFile(dest, css, (err) => {
            if (err) throw err;
            emitted(dest, css.length);
        });
    };
