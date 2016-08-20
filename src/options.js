export default {
    htmlMinifier: {
        customAttrSurround: [[/@/, new RegExp('')], [/:/, new RegExp('')]],
        collapseWhitespace: true,
        removeComments: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        // this is disabled by default to avoid removing
        // "type" on <input type="text">
        removeRedundantAttributes: false,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
    },
};
