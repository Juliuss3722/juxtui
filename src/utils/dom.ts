import type { ComponentPublicInstance, MaybeRef } from 'vue'
import { unref } from 'vue'

export const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'

export type MaybeElement = HTMLElement | SVGElement | ComponentPublicInstance | null | undefined

/** Resolve a template ref that may point at an element or a component instance. */
export function unrefElement(target: MaybeRef<MaybeElement>): HTMLElement | null {
  const value = unref(target)
  if (!value) return null
  if (value instanceof Element) return value as HTMLElement
  const el = (value as ComponentPublicInstance).$el as Node | null
  // A component whose root is a fragment exposes a text node as $el.
  if (el && el.nodeType !== Node.ELEMENT_NODE) {
    const next = el.nextSibling
    return next instanceof HTMLElement ? next : null
  }
  return (el as HTMLElement | null) ?? null
}

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',')

function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false
  // `checkVisibility` is precise where supported; the rect check covers the rest.
  if (typeof el.checkVisibility === 'function') return el.checkVisibility({ visibilityProperty: true })
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden') return false
  }
  return true
}

/** Elements that can receive keyboard focus, in DOM order. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el => el.tabIndex >= 0 && !el.closest('[inert]') && isVisible(el),
  )
}

export function focusElement(el: HTMLElement | null | undefined, options?: FocusOptions) {
  if (!el) return
  el.focus({ preventScroll: true, ...options })
}

export const isMac = () => isClient && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)

export function prefersReducedMotion() {
  return isClient && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
