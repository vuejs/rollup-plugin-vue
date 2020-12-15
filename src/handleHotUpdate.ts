import fs from 'fs'
import _debug from 'debug'
import { parse, SFCBlock } from '@vue/compiler-sfc'
import { getDescriptor, setDescriptor } from './utils/descriptorCache'

const debug = _debug('vite:hmr')

/**
 * Vite-specific HMR handling
 */
export async function handleHotUpdate(file: string, modules: any[]) {
  if (!file.endsWith('.vue')) {
    return
  }

  const prevDescriptor = getDescriptor(file)
  if (!prevDescriptor) {
    // file hasn't been requested yet (e.g. async component)
    return
  }

  let content = fs.readFileSync(file, 'utf-8')
  if (!content) {
    await untilModified(file)
    content = fs.readFileSync(file, 'utf-8')
  }

  const { descriptor } = parse(content, {
    filename: file,
    sourceMap: true,
    sourceRoot: process.cwd(),
  })
  setDescriptor(file, descriptor)

  let needRerender = false
  const filteredModules = []

  const reload = () => {
    debug(`[vue:reload] ${file}`)
    return modules.filter(
      (m) => !/type=/.test(m.id) || /type=script/.test(m.id)
    )
  }

  if (
    !isEqualBlock(descriptor.script, prevDescriptor.script) ||
    !isEqualBlock(descriptor.scriptSetup, prevDescriptor.scriptSetup)
  ) {
    return reload()
  }

  if (!isEqualBlock(descriptor.template, prevDescriptor.template)) {
    needRerender = true
  }

  let didUpdateStyle = false
  const prevStyles = prevDescriptor.styles || []
  const nextStyles = descriptor.styles || []

  // force reload if CSS vars injection changed
  if (descriptor.cssVars) {
    if (prevDescriptor.cssVars.join('') !== descriptor.cssVars.join('')) {
      return reload()
    }
  }

  // force reload if scoped status has changed
  if (prevStyles.some((s) => s.scoped) !== nextStyles.some((s) => s.scoped)) {
    return reload()
  }

  // only need to update styles if not reloading, since reload forces
  // style updates as well.
  for (let i = 0; i < nextStyles.length; i++) {
    const prev = prevStyles[i]
    const next = nextStyles[i]
    if (!prev || !isEqualBlock(prev, next)) {
      // css modules update causes a reload because the $style object is changed
      // and it may be used in JS.
      // if (prev.module != null || next.module != null) {
      //   return modules.filter(
      //     (m) => !/type=/.test(m.id) || /type=script/.test(m.id)
      //   )
      // }
      didUpdateStyle = true
      filteredModules.push(modules.find((m) => m.id.includes(`index=${i}`)))
    }
  }

  const prevCustoms = prevDescriptor.customBlocks || []
  const nextCustoms = descriptor.customBlocks || []

  // custom blocks update causes a reload
  // because the custom block contents is changed and it may be used in JS.
  if (
    nextCustoms.some(
      (_, i) => !prevCustoms[i] || !isEqualBlock(prevCustoms[i], nextCustoms[i])
    )
  ) {
    return reload()
  }

  if (needRerender) {
    filteredModules.push(modules.find((m) => /type=template/.test(m.id)))
  }

  let updateType = []
  if (needRerender) {
    updateType.push(`template`)
  }
  if (didUpdateStyle) {
    updateType.push(`style`)
  }
  if (updateType.length) {
    debug(`[vue:update(${updateType.join('&')})] ${file}`)
  }
  return filteredModules
}

// vitejs/vite#610 when hot-reloading Vue files, we read immediately on file
// change event and sometimes this can be too early and get an empty buffer.
// Poll until the file's modified time has changed before reading again.
async function untilModified(file: string) {
  const mtime = fs.statSync(file).mtimeMs
  return new Promise((r) => {
    let n = 0
    const poll = async () => {
      n++
      const newMtime = fs.statSync(file).mtimeMs
      if (newMtime !== mtime || n > 10) {
        r(0)
      } else {
        setTimeout(poll, 10)
      }
    }
    setTimeout(poll, 10)
  })
}

function isEqualBlock(a: SFCBlock | null, b: SFCBlock | null) {
  if (!a && !b) return true
  if (!a || !b) return false
  // src imports will trigger their own updates
  if (a.src && b.src && a.src === b.src) return true
  if (a.content !== b.content) return false
  const keysA = Object.keys(a.attrs)
  const keysB = Object.keys(b.attrs)
  if (keysA.length !== keysB.length) {
    return false
  }
  return keysA.every((key) => a.attrs[key] === b.attrs[key])
}
