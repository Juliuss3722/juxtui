import type { MaybeRefOrGetter } from 'vue'
import { onBeforeUnmount, onMounted, toValue } from 'vue'
import { isMac } from '../utils/dom'

/**
 * Parse a shortcut such as `mod+k`, `shift+/` or `alt+t`.
 * `mod` is ⌘ on Apple platforms and Ctrl elsewhere.
 */
export function matchesHotkey(event: KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey.toLowerCase().split('+').map(part => part.trim())
  const key = parts.pop()
  if (!key) return false
  const mac = isMac()
  const want = {
    meta: parts.includes('meta') || (mac && parts.includes('mod')),
    ctrl: parts.includes('ctrl') || (!mac && parts.includes('mod')),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
  }
  if (event.metaKey !== want.meta || event.ctrlKey !== want.ctrl || event.altKey !== want.alt || event.shiftKey !== want.shift)
    return false
  // `code` survives keyboard layouts and Alt/Option remapping.
  const code = event.code.toLowerCase()
  return event.key.toLowerCase() === key || code === `key${key}` || code === `digit${key}`
}

/** Human-readable parts of a shortcut, e.g. `mod+k` → `['⌘', 'K']`. */
export function formatHotkey(hotkey: string): string[] {
  const mac = isMac()
  const labels: Record<string, string> = mac
    ? { mod: '⌘', meta: '⌘', ctrl: '⌃', alt: '⌥', shift: '⇧', enter: '↵', escape: 'Esc' }
    : { mod: 'Ctrl', meta: 'Win', ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', enter: 'Enter', escape: 'Esc' }
  return hotkey.split('+').map((part) => {
    const lower = part.trim().toLowerCase()
    return labels[lower] ?? (lower.length === 1 ? lower.toUpperCase() : part.trim())
  })
}

/** Run `handler` whenever the shortcut is pressed anywhere on the page. */
export function useHotkey(hotkey: MaybeRefOrGetter<string | false | undefined>, handler: (event: KeyboardEvent) => void) {
  function onKeydown(event: KeyboardEvent) {
    const value = toValue(hotkey)
    // A focused component (e.g. the editor binding ⌘K to "link") already handled it.
    if (!value || event.repeat || event.isComposing || event.defaultPrevented) return
    if (!matchesHotkey(event, value)) return
    event.preventDefault()
    handler(event)
  }
  onMounted(() => document.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}
