import * as Typescript from 'typescript'
import debug from '../debug'
export default async function (script, id, content, options, nodes) {
    debug(`Typescript: Compiling ${id}`)
    options.typescript = options.typescript || {}
    const config = Object.assign({}, options.typescript, { fileName: id })
    config.compilerOptions = Object.assign({}, options.typescript.compilerOptions, {
        experimentalDecorators: true,
        module: Typescript.ModuleKind.ES2015,
        moduleResolution: Typescript.ModuleResolutionKind.NodeJs
    })
    script.code = (await Typescript.transpileModule(script.code, config)).outputText
    return script
}
