import {writeFileSync} from 'fs'
import humanSize from 'human-size'

export default function writeStyles (content, lang, bundle) {
  // Merge content and lang
  var data = {}
  for (let key in content) {
    data[lang[key]] = (data[lang[key]] || '') + content[key]
  }

  // Write files
  for (let key in data) {
    let ext = '.' + key
    let dest = bundle.replace('.js', ext)
    if (dest.indexOf(ext) === -1) {
      dest += ext
    }
    console.log('Writing', humanSize(data[key].length), 'to', dest)
    writeFileSync(dest, data[key])
  }
}
