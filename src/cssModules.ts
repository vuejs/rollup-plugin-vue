export function genCSSModulesCode(
  // @ts-ignore
  id: string,
  index: number,
  request: string,
  moduleName: string | boolean
): string {
  const styleVar = `style${index}`
  let code = `\nimport ${styleVar} from ${request}`

  // inject variable
  const name = typeof moduleName === 'string' ? moduleName : '$style'
  code += `\ncssModules["${name}"] = ${styleVar}`

  return code
}
