module.exports = {
  title: 'Rollup Plugin Vue',
  description: 'Bundle .vue files using Rollup',
  ga: 'UA-38503997-4',
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
        nav: [
          {
            text: 'Getting Started',
            link: '/getting-started/'
          },
          {
            text: 'Examples',
            link: '/examples/'
          },
          {
            text: 'Options',
            link: '/options'
          },
          {
            text: 'Migrating from v2',
            link: '/migrating'
          }
        ],
        sidebar: [
          {
            title: 'Guide',
            children: ['/', '/getting-started', '/examples']
          },
          '/options',
          '/changelog'
        ]
      }
    }
  }
}
