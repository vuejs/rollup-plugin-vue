// utility for generating a uid for each component file
// used in scoped CSS rewriting
import path from 'path'
import hash from 'hash-sum'
const cache = Object.create(null)

export default function genScopeID (file) {
    const modified = path.relative(process.cwd(), file)

    if (!cache[modified]) {
        cache[modified] = 'data-v-' + hash(modified)
    }

    return cache[modified]
}
