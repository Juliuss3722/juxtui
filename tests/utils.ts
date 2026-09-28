import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

/** Let Vue, promises and a couple of animation frames settle. */
export async function settle() {
  await flushPromises()
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

export function key(target: Element | Document, keyName: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

export function byRole<T extends HTMLElement = HTMLElement>(role: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(`[role="${role}"]`))
}

/** Poll until `check` passes (or time out), letting Vue and timers run in between. */
export async function waitFor(check: () => unknown, timeout = 1000) {
  const start = Date.now()
  while (!check()) {
    if (Date.now() - start > timeout) throw new Error('waitFor timed out')
    await settle()
  }
}
