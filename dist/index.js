"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const component_compiler_1 = require("@vue/component-compiler");
const path = require("path");
const component_compiler_utils_1 = require("@vue/component-compiler-utils");
const debug_1 = require("debug");
const templateCompiler = require('vue-template-compiler');
const hash = require('hash-sum');
const d = debug_1.default('rollup-plugin-vue');
const { version } = require('../package.json');
/**
 * Rollup plugin for handling .vue files.
 */
function VuePlugin(opts = {}) {
    const isVue = utils_1.createVueFilter(opts.include, opts.exclude);
    const isProduction = process.env.NODE_ENV === 'production' || process.env.BUILD === 'production';
    d('Version ' + version);
    d(`Build environment: ${isProduction ? 'production' : 'development'}`);
    d(`Build target: ${process.env.VUE_ENV || 'browser'}`);
    if (!opts.normalizer)
        opts.normalizer = '~vue-runtime-helpers/normalize-component.js';
    if (!opts.styleInjector)
        opts.styleInjector = '~vue-runtime-helpers/inject-style/browser.js';
    if (!opts.styleInjectorSSR)
        opts.styleInjectorSSR = '~vue-runtime-helpers/inject-style/server.js';
    utils_1.createVuePartRequest.defaultLang = Object.assign({}, utils_1.createVuePartRequest.defaultLang, opts.defaultLang);
    const shouldExtractCss = opts.css === false;
    const blacklisted = new Set(opts.blackListCustomBlocks || ['*']);
    const whitelisted = new Set(opts.whiteListCustomBlocks || []);
    const isAllowed = (customBlockType) => (!blacklisted.has('*') || !blacklisted.has(customBlockType)) &&
        (whitelisted.has('*') || whitelisted.has(customBlockType));
    delete opts.css;
    delete opts.blackListCustomBlocks;
    delete opts.whiteListCustomBlocks;
    delete opts.defaultLang;
    delete opts.include;
    delete opts.exclude;
    opts.template = Object.assign({ transformAssetUrls: {
            video: ['src', 'poster'],
            source: 'src',
            img: 'src',
            image: 'xlink:href'
        } }, opts.template);
    if (opts.template && typeof opts.template.isProduction === 'undefined') {
        opts.template.isProduction = isProduction;
    }
    const compiler = component_compiler_1.createDefaultCompiler(opts);
    const descriptors = new Map();
    if (opts.css === false)
        d('Running in CSS extract mode');
    return {
        name: 'VuePlugin',
        resolveId(id, importer) {
            if (!utils_1.isVuePartRequest(id))
                return;
            id = path.resolve(path.dirname(importer), id);
            const ref = utils_1.parseVuePartRequest(id);
            if (ref) {
                const element = utils_1.resolveVuePart(descriptors, ref);
                const src = element.src;
                if (ref.meta.type !== 'styles' && typeof src === 'string') {
                    if (src.startsWith('.')) {
                        return path.resolve(path.dirname(ref.filename), src);
                    }
                    else {
                        return require.resolve(src, { paths: [path.dirname(ref.filename)] });
                    }
                }
                else if (ref.meta.type === 'styles') {
                    return id.replace('.vue', '.vue.css');
                }
                return id;
            }
        },
        load(id) {
            const request = utils_1.parseVuePartRequest(id);
            if (!request)
                return;
            const element = utils_1.resolveVuePart(descriptors, request);
            const code = 'code' in element
                ? element.code // .code is set when extract styles is used. { css: false }
                : element.content;
            const map = element.map;
            return { code, map };
        },
        transform(source, filename) {
            return __awaiter(this, void 0, void 0, function* () {
                if (isVue(filename)) {
                    const descriptor = component_compiler_utils_1.parse({
                        filename,
                        source,
                        compiler: opts.compiler || templateCompiler,
                        compilerParseOptions: opts.compilerParseOptions,
                        sourceRoot: opts.sourceRoot,
                        needMap: true
                    });
                    const scopeId = 'data-v-' +
                        (isProduction
                            ? hash(path.basename(filename) + source)
                            : hash(filename + source));
                    descriptors.set(filename, descriptor);
                    const styles = yield Promise.all(descriptor.styles.map((style) => __awaiter(this, void 0, void 0, function* () {
                        if (!(typeof style.map.mappings === 'string')) {
                            style.map.mappings = '';
                        }
                        const compiled = yield compiler.compileStyleAsync(filename, scopeId, style);
                        if (compiled.errors.length > 0)
                            throw Error(compiled.errors[0]);
                        return compiled;
                    })));
                    const input = {
                        scopeId,
                        styles,
                        customBlocks: []
                    };
                    if (descriptor.template) {
                        input.template = compiler.compileTemplate(filename, descriptor.template);
                        input.template.code = utils_1.transformRequireToImport(input.template.code);
                        if (input.template.errors && input.template.errors.length) {
                            input.template.errors.map((error) => this.error(error));
                        }
                        if (input.template.tips && input.template.tips.length) {
                            input.template.tips.map((message) => this.warn({ message }));
                        }
                    }
                    input.script = descriptor.script
                        ? {
                            code: `
            export * from '${utils_1.createVuePartRequest(filename, descriptor.script.lang || 'js', 'script')}'
            import script from '${utils_1.createVuePartRequest(filename, descriptor.script.lang || 'js', 'script')}'
            export default script
            `
                        }
                        : { code: '' };
                    if (shouldExtractCss) {
                        input.styles = input.styles
                            .map((style, index) => {
                            ;
                            descriptor.styles[index].code = style.code;
                            input.script.code +=
                                '\n' +
                                    `import '${utils_1.createVuePartRequest(filename, 'css', 'styles', index)}'`;
                            if (style.module || descriptor.styles[index].scoped) {
                                return Object.assign({}, style, { code: '' });
                            }
                        })
                            .filter(Boolean);
                    }
                    const result = component_compiler_1.assemble(compiler, filename, input, opts);
                    descriptor.customBlocks.forEach((block, index) => {
                        if (!isAllowed(block.type))
                            return;
                        result.code +=
                            '\n' +
                                `export * from '${utils_1.createVuePartRequest(filename, block.attrs.lang ||
                                    utils_1.createVuePartRequest.defaultLang[block.type] ||
                                    block.type, 'customBlocks', index)}'`;
                    });
                    return result;
                }
            });
        }
    };
}
exports.default = VuePlugin;
