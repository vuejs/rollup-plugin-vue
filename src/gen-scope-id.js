// utility for generating a uid for each component file
// used in scoped CSS rewriting
import hash from 'hash-sum'
const cache = Object.create(null)

export default function genScopeID (file) {
    if (!cache[file]) {
        cache[file] = 'data-v-' + hash(file)
    }
    return cache[file]
}
