import { onMounted, ref } from 'vue'

export interface RecentCommandsOptions {
  /** localStorage key. */
  key?: string
  /** How many ids to remember. */
  limit?: number
}

/**
 * Remembers which commands were used most recently, per browser.
 * Pair `record(item.id)` in your select handler with `resolve(allItems)`
 * to feed the palette's `recent` prop.
 */
export function useRecentCommands(options: RecentCommandsOptions = {}) {
  const key = options.key ?? 'juxt:recent-commands'
  const limit = options.limit ?? 5
  const ids = ref<string[]>([])

  function read(): string[] {
    try {
      const value = JSON.parse(localStorage.getItem(key) ?? '[]')
      return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
    } catch {
      return []
    }
  }

  function write() {
    try {
      localStorage.setItem(key, JSON.stringify(ids.value))
    } catch {
      // Private mode or storage disabled: recents simply won't persist.
    }
  }

  onMounted(() => (ids.value = read()))

  function record(id: string) {
    ids.value = [id, ...ids.value.filter(existing => existing !== id)].slice(0, limit)
    write()
  }

  function clear() {
    ids.value = []
    write()
  }

  /** Map remembered ids back to items, dropping any that no longer exist. */
  function resolve<T extends { id: string }>(items: T[]): T[] {
    const byId = new Map(items.map(item => [item.id, item]))
    return ids.value.map(id => byId.get(id)).filter((item): item is T => !!item)
  }

  return { ids, record, clear, resolve }
}
