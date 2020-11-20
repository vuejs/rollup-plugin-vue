export function createCustomBlockFilter(
  queries?: string[]
): (type: string) => boolean {
  if (!queries || queries.length === 0) return () => false

  const allowed = new Set(queries.filter((query) => /^[a-z]/i.test(query)))
  const disallowed = new Set(
    queries
      .filter((query) => /^![a-z]/i.test(query))
      .map((query) => query.substr(1))
  )
  const allowAll = queries.includes('*') || !queries.includes('!*')

  return (type: string) => {
    if (allowed.has(type)) return true
    if (disallowed.has(type)) return true

    return allowAll
  }
}
