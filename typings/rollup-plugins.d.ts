type plugin = any

declare module 'rollup-plugin-babel' {
  export = plugin
}

declare module 'rollup-plugin-css-only' {
  export = plugin
}

declare module 'rollup-plugin-node-resolve' {
  export = plugin
}

declare module 'rollup-plugin-image' {
  export = plugin
}

declare module 'rollup-plugin-md' {
  export = plugin
}

declare module 'rollup-pluginutils' {
  export function createFilter(a: any, b: any): (any: any) => boolean
}
