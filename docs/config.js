const languages = {
    title: 'Language',
    type: 'dropdown',
    exact: true,
    items: [
        { title: 'English', path: '/en/', matchPath: /\/en\/.*/i }
    ]
}

const home = { title: 'Home', path: '/' }

const versions = [
    { title: 'Version 2.2', path: '/2.2/', matchPath: /^\/([a-z-]+)\/2.2\/.*/i },
    { title: 'Version 2.3', path: '/2.3/', matchPath: /^\/([a-z-]+)\/2.3\/.*/i },
]

function lang_version(lang) {
    const version = {
        title: 'Version',
        type: 'dropdown',
        exact: true,
    }
    version.items = versions.map(function (v) {
        const ver = Object.assign({}, v)
        ver.path = '/' + lang + ver.path

        return ver
    })

    return version
}

self.$config = {
    repo: 'vuejs/rollup-plugin-vue',
    'edit-link': 'https://github.com/vuejs/rollup-plugin-vue/edit/master/docs',

    nav: {
        default: [home, languages, lang_version('en')],
        'en2.3': [{ title: 'Home', path: '/en/2.3/' }, { title: 'Examples', path: '/en/2.3/examples' }, languages, lang_version('en')],
        'en2.2': [{ title: 'Home', path: '/en/2.2/' }, { title: 'Examples', path: '/en/2.2/examples' }, languages, lang_version('en')],
    },

    plugins: [
        docsearch({
            apiKey: '7792597613e997afeb0b75a206ca0c5a',
            indexName: 'rollup-plugin-vue',
            tags: ['en', 'v2.2', 'v2.3']
        })
    ],
    
    url: 'https://vuejs.github.io/rollup-plugin-vue'
}
