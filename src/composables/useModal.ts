import type { Ref } from 'vue'
import { ref } from 'vue'
import { prefersReducedMotion } from '../utils/dom'
import { useFocusTrap } from './useFocusTrap'
import { useLayer } from './useLayer'
import { useScrollLock } from './useScrollLock'

export interface ModalOptions {
  closeOnEscape: () => boolean
  closeOnOverlay: () => boolean
  close: () => void
  /** Selector for the element to focus first, inside the panel. */
  focusSelector?: string
}

/**
 * Internal: everything a modal surface (Dialog, Sheet) shares | layering,
 * focus trap and restoration, scroll lock, backdrop clicks and the "nudge"
 * when dismissal is refused.
 */
export function useModal(panel: Ref<HTMLElement | null>, open: Ref<boolean>, options: ModalOptions) {
  const nudging = ref(false)

  // A modal that refuses to close gives a small, polite nudge instead.
  function nudge() {
    if (prefersReducedMotion()) return
    nudging.value = false
    requestAnimationFrame(() => (nudging.value = true))
  }

  const { isTopLayer } = useLayer({
    active: open,
    elements: () => [panel.value],
    onEscape: () => (options.closeOnEscape() ? options.close() : nudge()),
  })

  useFocusTrap(panel, open, {
    // Prefer an explicit autofocus, then the first form field. Otherwise focus the
    // panel itself so screen readers announce it without jumping to a button.
    initialFocus: () =>
      panel.value?.querySelector<HTMLElement>('[autofocus], [data-autofocus]')
      ?? (options.focusSelector ? panel.value?.querySelector<HTMLElement>(options.focusSelector) : null)
      ?? panel.value,
  })

  useScrollLock(open)

  // Close on a click that both starts and ends on the backdrop, so dragging a
  // text selection out of the panel never dismisses it.
  let pressedOutside = false
  function onBackdropPointerDown(event: PointerEvent) {
    pressedOutside = event.target === event.currentTarget && isTopLayer()
  }
  function onBackdropClick(event: MouseEvent) {
    const outside = pressedOutside && event.target === event.currentTarget
    pressedOutside = false
    if (!outside) return
    if (options.closeOnOverlay()) options.close()
    else nudge()
  }

  return { nudging, onBackdropPointerDown, onBackdropClick }
}

/** Form fields worth focusing first in a modal body. */
export const FIELD_SELECTOR = ':is(input:not([type=hidden]), textarea, select, [role=combobox]):not(:disabled)'
