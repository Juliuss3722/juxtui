import type { Ref } from 'vue'
import { nextTick, onBeforeUnmount, watch } from 'vue'
import { focusElement, getFocusableElements, isClient } from '../utils/dom'

export interface FocusTrapOptions {
  /** Element to focus when the trap activates. Falls back to the first focusable element, then the container. */
  initialFocus?: () => HTMLElement | null | undefined
  /** Return focus to whatever was focused before activation. Defaults to true. */
  restoreFocus?: boolean
}

interface Trap {
  container: Ref<HTMLElement | null>
}

// Traps nest: only the most recently activated one is in charge.
const stack: Trap[] = []

function isTop(trap: Trap) {
  return stack[stack.length - 1] === trap
}

let listening = false

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab' || event.defaultPrevented) return
  const trap = stack[stack.length - 1]
  const container = trap?.container.value
  if (!container) return

  const focusable = getFocusableElements(container)
  if (focusable.length === 0) {
    event.preventDefault()
    focusElement(container)
    return
  }

  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  const active = document.activeElement as HTMLElement | null
  const inside = active ? container.contains(active) : false

  if (event.shiftKey && (active === first || active === container || !inside)) {
    event.preventDefault()
    focusElement(last)
  } else if (!event.shiftKey && (active === last || !inside)) {
    event.preventDefault()
    focusElement(first)
  }
}

function onFocusIn(event: FocusEvent) {
  const trap = stack[stack.length - 1]
  const container = trap?.container.value
  const target = event.target as Node | null
  if (!container || !target || container.contains(target)) return
  // Focus escaped (e.g. a programmatic focus elsewhere) | bring it back.
  if ((target as HTMLElement).closest?.('[data-juxt-layer-ignore]')) return
  const [first] = getFocusableElements(container)
  focusElement(first ?? container)
}

function listen() {
  if (listening || !isClient) return
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('focusin', onFocusIn)
  listening = true
}

function unlisten() {
  if (!listening || stack.length > 0) return
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('focusin', onFocusIn)
  listening = false
}

/**
 * Keep keyboard focus inside `container` while `active` is true, and put it
 * back where it came from afterwards.
 */
export function useFocusTrap(container: Ref<HTMLElement | null>, active: Ref<boolean>, options: FocusTrapOptions = {}) {
  const trap: Trap = { container }
  let returnTo: HTMLElement | null = null
  // The container as it was while active. By the time we deactivate, Vue may
  // already have cleared the template ref while the element animates out.
  let activeContainer: HTMLElement | null = null

  async function activate() {
    returnTo = document.activeElement as HTMLElement | null
    stack.push(trap)
    listen()
    await nextTick()
    const el = container.value
    activeContainer = el
    if (!el || !isTop(trap)) return
    if (el.contains(document.activeElement)) return
    const target = options.initialFocus?.() ?? el.querySelector<HTMLElement>('[autofocus], [data-autofocus]') ?? getFocusableElements(el)[0] ?? el
    focusElement(target)
  }

  function deactivate() {
    const index = stack.indexOf(trap)
    if (index === -1) return
    stack.splice(index, 1)
    unlisten()

    if (options.restoreFocus === false) return
    const target = returnTo
    returnTo = null
    if (!target || !target.isConnected) return
    const current = document.activeElement as HTMLElement | null
    // Only restore when focus would otherwise be lost. If the user deliberately
    // moved focus somewhere meaningful, respect that.
    const lost = !current || current === document.body || !current.isConnected
      || !!activeContainer?.contains(current) || !!container.value?.contains(current)
    activeContainer = null
    if (lost) focusElement(target)
  }

  if (isClient) {
    watch(
      active,
      (value) => {
        if (value) activate()
        else deactivate()
      },
      { immediate: true, flush: 'post' },
    )
    onBeforeUnmount(deactivate)
  }
}
