import buble from 'buble'
import options from '../options'
function last (arr) {
  if (arr && arr.length) {
    return arr[arr.length - 1]
  }
  return arr
}
export default {
  compile (code, _, id) {
    const res = buble.transform(code, options.buble)
    return {
      code: res.code,
      map: res.map,
      type: 'script'
    }
  },
  inject (script, template) {
    let matches = /(export default[^{]*\{)/g.exec(script)
    if (matches) {
      return script.split(matches[1]).join(`${matches[1]} template: ${JSON.stringify(template)},`)
    }
    console.log('Lang: buble\n Script: ' + last(script.split('export default')))
    throw new Error('[rollup-vue-plugin] failed to inject template in script.\n Create an issue at https://github.com/znck/rollup-plugin-vue/issues. Include above text.')
  }
}
