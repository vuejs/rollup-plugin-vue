---
nav: en2.3
search: 
  - "version\:2.3"
---

- #### Bootstrap like SASS export 
``` js
// Assuming `rollup.config.js` is in project root directory.
 ...
 vue ({
     cssModules: {
       generateScopedName: 'foo-bar-[name]-[local]'
     },
     css (_, styles) {
       let combine = ''
       const result = styles.map(style => {
         const filename = style.id.replace(path.resolve(__dirname, 'src'))
                                  .replace(/\.vue$/i, '.scss')
                                  .replace(/^\//, '')

         combine += '@import ' + JSON.stringify(filename.replace(/\.scss$/i, '')) + ';\n'

         fs.writeFileSync(path.resolve(__dirname, `dist/scss/${filename}`), style.code.trim())

         return style.$compiled.code
       }).join('\n')

       fs.writeFileSync(path.resolve(__dirname, `dist/scss/${name}.scss`), combine)
     }
   })
 ...
```

