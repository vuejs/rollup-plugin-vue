module.exports = {
  title: 'Rollup Plugin Vue',
  description: 'Bundle .vue files using Rollup',
  base: '/rollup-plugin-vue/',
  markdown: {
    config(md) {
      md.use(require('./markdown-it-code-frame'))
    }
  },
  serviceWorker: true,
  themeConfig: {
    repo: 'vuejs/rollup-plugin-vue',
    editLinks: true,
    docsDir: 'docs',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        nav: [{
            text: 'Guide',
            link: '/guide/'
          },
          {
            text: 'Options Reference',
            link: '/options'
          },
          {
            text: 'Migrating from v2',
            link: '/migrating'
          },
          {
            text: 'Cookbook',
            link: '/cookbook/'
          }
        ],
        sidebar: [
          '/',
          '/guide/',
          '/options',
          '/cookbook/',
          '/changelog'
        ]
      }
    }
  }
}