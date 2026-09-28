import type { Ref } from 'vue'
import { onBeforeUnmount, watch } from 'vue'
import { isClient } from '../utils/dom'

let locks = 0
let saved: { overflow: string, paddingRight: string } | null = null

function lock() {
  locks++
  if (locks > 1) return
  const body = document.body
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
  body.style.overflow = 'hidden'
  if (scrollbar > 0) {
    // Compensate for the vanished scrollbar so the page doesn't jump sideways.
    const current = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
    body.style.paddingRight = `${current + scrollbar}px`
  }
  document.documentElement.style.setProperty('--juxt-scrollbar-width', `${scrollbar}px`)
  document.documentElement.dataset.juxtScrollLocked = ''
}

function unlock() {
  locks = Math.max(0, locks - 1)
  if (locks > 0 || !saved) return
  document.body.style.overflow = saved.overflow
  document.body.style.paddingRight = saved.paddingRight
  document.documentElement.style.removeProperty('--juxt-scrollbar-width')
  delete document.documentElement.dataset.juxtScrollLocked
  saved = null
}

/** Prevent the page behind an overlay from scrolling while `active` is true. */
export function useScrollLock(active: Ref<boolean>) {
  if (!isClient) return
  let held = false

  const set = (value: boolean) => {
    if (value === held) return
    held = value
    if (value) lock()
    else unlock()
  }

  watch(active, set, { immediate: true })
  onBeforeUnmount(() => set(false))
}
