import deIndent from 'de-indent'
import htmlMinifier from 'html-minifier'
import parse5 from 'parse5'
import validateTemplate from 'vue-template-validator'
import {relative} from 'path'

import options from './options'

/**
 * Check the lang attribute of a parse5 node.
 *
 * @param {Node} node
 * @return {String|undefined}
 */
function checkLang (node) {
  if (node.attrs) {
    var i = node.attrs.length
    while (i--) {
      var attr = node.attrs[i]
      if (attr.name === 'lang') {
        return attr.value
      }
    }
  }
}

/**
 * Pad content with empty lines to get correct line number in errors.
 *
 * @param content
 * @returns {string}
 */
function padContent (content) {
  return content
      .split(/\r?\n/g)
      .map(function () { return '' })
      .join('\n')
}

/**
 * Only support for es5 modules
 *
 * @param content
 * @returns {string}
 */
function injectTemplate (script, template) {
  let matches = /(export default[^{]*\{)/g.exec(script)
  if (matches) {
    return script.split(matches[1]).join(`${matches[1]} template: ${JSON.stringify(template)},`)
  }
  throw new Error('[rollup-plugin-vue] could not find place to inject template in script.')
}

/**
 * Compile template: DeIndent and minify html.
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 */
function processTemplate (node, filePath, content) {
  let template = deIndent(parse5.serialize(node.content))
  const warnings = validateTemplate(node.content, content)
  if (warnings) {
    const relativePath = relative(process.cwd(), filePath)
    warnings.forEach(function (msg) {
      console.warn(`\n Warning in ${relativePath}:\n ${msg}`)
    })
  }
  return htmlMinifier.minify(template, options.htmlMinifier)
}

/**
 * @param {Node} node
 * @param {string} filePath
 * @param {string} content
 * @param {string} template
 */
function processScript (node, filePath, content, template) {
  const lang = checkLang(node) || 'js'
  let script = parse5.serialize(node)
  // pad the script to ensure correct line number for syntax errors
  const location = content.indexOf(script)
  const before = padContent(content.slice(0, location))
  script = before + script
  script = injectTemplate(script, template, lang)
  script = deIndent(script)
  return script
}

export default function vueTransform (code, filePath) {
  // 1. Parse the file into an HTML tree
  const fragment = parse5.parseFragment(code, {locationInfo: true})

  // 2. Walk through the top level nodes and check for their types
  const nodes = {}
  for (var i = fragment.childNodes.length - 1; i >= 0; i--) {
    nodes[fragment.childNodes[i].nodeName] = fragment.childNodes[i]
  }

  // 3. Don't touch files that don't look like Vue components
  if (!nodes.template && !nodes.script) {
    throw new Error('There must be at least one script tag or one template tag per *.vue file.')
  }

  // 4. Process template
  const template = processTemplate(nodes.template, filePath, code)

  // 5. Process script
  const output = {
    js: processScript(nodes.script, filePath, code, template)
  }

  // 6. Process style
  if (nodes.style) {
    output.css = parse5.serialize(nodes.style)
    output.cssLang = checkLang(nodes.style)
  }

  return output
}
