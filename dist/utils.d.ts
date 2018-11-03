import { SFCDescriptor, SFCBlock, SFCCustomBlock } from '@vue/component-compiler-utils';
export interface VuePartRequest {
    filename: string;
    meta: VuePartRequestMeta;
}
export interface VuePartRequestMeta {
    type: 'template' | 'script' | 'styles' | 'customBlocks';
    lang: string;
    index?: number;
}
export interface VuePartRequestCreator {
    (filename: string, lang: string, type: string, index?: number): string;
    defaultLang: {
        [key: string]: string;
    };
}
export declare function createVueFilter(include?: Array<string | RegExp> | string | RegExp, exclude?: Array<string | RegExp> | string | RegExp): (file: string) => boolean;
export declare function getVueMetaFromQuery(id: string): VuePartRequestMeta | null;
export declare function isVuePartRequest(id: string): boolean;
export declare const createVuePartRequest: VuePartRequestCreator;
export declare function parseVuePartRequest(id: string): VuePartRequest | undefined;
export declare function resolveVuePart(descriptors: Map<string, SFCDescriptor>, { filename, meta }: VuePartRequest): SFCBlock | SFCCustomBlock;
export declare function transformRequireToImport(code: string): string;
