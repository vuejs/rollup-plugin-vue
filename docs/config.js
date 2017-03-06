const languages = {
    title: 'Language',
    type: 'dropdown',
    exact: true,
    items: [
        { title: 'English', path: '/en/' }
    ]
}

const home = { title: 'Home', path: '/' }

const version_en = {
    title: 'Version',
    type: 'dropdown',
    exact: true,
    items: [
        { title: 'Version 2.2', path: '/en/2.2/' },
        { title: 'Version 2.3', path: '/en/2.3/' },
    ]
}

self.$config = {
    repo: 'vuejs/rollup-plugin-vue',
    'edit-link': 'https://github.com/vuejs/rollup-plugin-vue/edit/master/docs',

    nav: {
        default: [home, languages, version_en],

        'en2.2': [home, { title: 'Examples', path: '/en/2.2/examples' }, languages, version_en]
    }
}
