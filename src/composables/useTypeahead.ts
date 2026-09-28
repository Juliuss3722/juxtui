/**
 * Type-to-jump for lists. Characters typed in quick succession form a query;
 * repeating the same letter cycles through matches.
 */
export function useTypeahead(timeout = 500) {
  let query = ''
  let timer: ReturnType<typeof setTimeout> | undefined

  function search<T>(key: string, items: T[], getLabel: (item: T) => string, currentIndex: number): number {
    if (key.length !== 1 || (key === ' ' && query === '')) return -1
    clearTimeout(timer)
    timer = setTimeout(() => (query = ''), timeout)
    query += key.toLowerCase()

    const repeated = query.length > 1 && [...query].every(char => char === query[0])
    const needle = repeated ? query[0]! : query
    // A fresh search starts after the current item so repeated keys cycle.
    const start = repeated || query.length === 1 ? currentIndex + 1 : currentIndex
    for (let i = 0; i < items.length; i++) {
      const index = (start + i + items.length) % items.length
      if (getLabel(items[index]!).trim().toLowerCase().startsWith(needle)) return index
    }
    return -1
  }

  const isSearching = () => query.length > 0

  return { search, isSearching }
}
