"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rollup_pluginutils_1 = require("rollup-pluginutils");
const queryString = require("querystring");
const path = require("path");
const GET_QUERY = /\.vue(\.[a-z]+?)?\?(.+)$/i;
const PARAM_NAME = 'rollup-plugin-vue';
function createVueFilter(include = [/\.vue$/i], exclude = []) {
    const filter = rollup_pluginutils_1.createFilter(include, exclude);
    return id => filter(id);
}
exports.createVueFilter = createVueFilter;
function getVueMetaFromQuery(id) {
    const match = GET_QUERY.exec(id);
    if (match) {
        const query = queryString.parse(match[2]);
        if (PARAM_NAME in query) {
            const data = (Array.isArray(query[PARAM_NAME])
                ? query[PARAM_NAME][0]
                : query[PARAM_NAME]);
            const [type, index, lang] = data.split('.');
            return (lang
                ? { type, lang, index: parseInt(index) } // styles.0.css
                : { type, lang: index }); // script.js
        }
    }
    return null;
}
exports.getVueMetaFromQuery = getVueMetaFromQuery;
function isVuePartRequest(id) {
    return getVueMetaFromQuery(id) !== null;
}
exports.isVuePartRequest = isVuePartRequest;
exports.createVuePartRequest = ((filename, lang, type, index) => {
    lang = lang || exports.createVuePartRequest.defaultLang[type];
    const match = GET_QUERY.exec(filename);
    const query = match ? queryString.parse(match[2]) : {};
    query[PARAM_NAME] = [type, index, lang]
        .filter(it => it !== undefined)
        .join('.');
    return `${path.basename(filename)}?${queryString.stringify(query)}`;
});
exports.createVuePartRequest.defaultLang = {
    template: 'html',
    styles: 'css',
    script: 'js'
};
function parseVuePartRequest(id) {
    if (!id.includes('.vue'))
        return;
    const filename = id.substr(0, id.lastIndexOf('.vue') + 4);
    const params = getVueMetaFromQuery(id);
    if (params === null)
        return;
    return {
        filename,
        meta: params
    };
}
exports.parseVuePartRequest = parseVuePartRequest;
function resolveVuePart(descriptors, { filename, meta }) {
    const descriptor = descriptors.get(filename);
    if (!descriptor)
        throw Error('File not processed yet, ' + filename);
    const blocks = descriptor[meta.type];
    const block = Array.isArray(blocks) ? blocks[meta.index] : blocks;
    if (!block)
        throw Error(`Requested (type=${meta.type} & index=${meta.index}) block not found in ${filename}`);
    return block;
}
exports.resolveVuePart = resolveVuePart;
function transformRequireToImport(code) {
    const imports = {};
    let strImports = '';
    code = code.replace(/require\(("(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+')\)/g, (_, name) => {
        if (!(name in imports)) {
            imports[name] = `__$_require_${name.replace(/[^a-z0-9]/g, '_').replace(/_{2,}/g, '_').replace(/^_|_$/g, '')}__`;
            strImports += 'import ' + imports[name] + ' from ' + name + '\n';
        }
        return imports[name];
    });
    return strImports + code;
}
exports.transformRequireToImport = transformRequireToImport;
