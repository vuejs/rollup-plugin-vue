import { ScriptOptions, StyleOptions, TemplateOptions } from '@vue/component-compiler';
import { Plugin } from 'rollup';
import { VueTemplateCompiler, VueTemplateCompilerParseOptions } from '@vue/component-compiler-utils/dist/types';
export interface VuePluginOptions {
    /**
     * Include files or directories.
     * @default `'.vue'`
     */
    include?: Array<string | RegExp> | string | RegExp;
    /**
     * Exclude files or directories.
     * @default `undefined`
     */
    exclude?: Array<string | RegExp> | string | RegExp;
    /**
     * Default language for blocks.
     *
     * @default `{}`
     * @example
     * ```js
     * VuePlugin({ defaultLang: { script: 'ts' } })
     * ```
     */
    defaultLang?: {
        [key: string]: string;
    };
    /**
     * Exclude customBlocks for final build.
     * @default `['*']`
     * @example
     * ```js
     * VuePlugin({ blackListCustomBlocks: ['markdown', 'test'] })
     * ```
     */
    blackListCustomBlocks?: string[];
    /**
     * Include customBlocks for final build.
     * @default `[]`
     * @example
     * ```js
     * VuePlugin({ blackListCustomBlocks: ['markdown', 'test'] })
     * ```
     */
    whiteListCustomBlocks?: string[];
    /**
     * Inject CSS in JavaScript.
     * @default `true`
     * @example
     * ```js
     * VuePlugin({ css: false }) // to extract css
     * ```
     */
    css?: boolean;
    compiler?: VueTemplateCompiler;
    compilerParseOptions?: VueTemplateCompilerParseOptions;
    sourceRoot?: string;
    /**
     * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) script processing options.
     */
    script?: ScriptOptions;
    /**
     * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) style processing options.
     */
    style?: StyleOptions;
    /**
     * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) template processing options.
     */
    template?: TemplateOptions;
    /**
     * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) module name or global function for custom runtime component normalizer.
     */
    normalizer?: string;
    /**
     * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) module name or global function for custom style injector factory.
     */
    styleInjector?: string;
    /**
     * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) module name or global function for custom style injector factory for SSR environment.
     */
    styleInjectorSSR?: string;
}
/**
 * Rollup plugin for handling .vue files.
 */
export default function VuePlugin(opts?: VuePluginOptions): Plugin;
