import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import JTooltip from '../src/components/tooltip/JTooltip.vue'
import { key } from './utils'

function setup(props: Record<string, unknown> = {}) {
  const Host = defineComponent({
    setup: () => () => h(JTooltip, { content: 'Copy to clipboard', ...props }, () => h('button', { id: 'target' }, 'Copy')),
  })
  mount(Host, { attachTo: document.body })
  return document.getElementById('target')!
}

const tooltip = () => document.querySelector('.j-tooltip')

function pointer(target: Element, type: string) {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'mouse' }))
}

describe('JTooltip', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('describes the trigger even while hidden', () => {
    const target = setup()
    const id = target.getAttribute('aria-describedby')!
    expect(document.getElementById(id)?.textContent).toBe('Copy to clipboard')
    expect(tooltip()).toBeNull()
  })

  it('opens after the hover delay', async () => {
    const target = setup({ delay: 300 })
    pointer(target, 'pointerenter')
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(tooltip()).toBeNull()
    vi.advanceTimersByTime(150)
    await nextTick()
    expect(tooltip()?.textContent).toContain('Copy to clipboard')
  })

  it('closes when the pointer leaves', async () => {
    const target = setup({ delay: 0 })
    pointer(target, 'pointerenter')
    vi.advanceTimersByTime(10)
    await nextTick()
    pointer(target, 'pointerleave')
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(tooltip()).toBeNull()
  })

  it('closes on Escape', async () => {
    const target = setup({ delay: 0 })
    pointer(target, 'pointerenter')
    vi.advanceTimersByTime(10)
    await nextTick()
    expect(tooltip()).not.toBeNull()
    key(document, 'Escape')
    await nextTick()
    expect(tooltip()).toBeNull()
  })

  it('hides on press', async () => {
    const target = setup({ delay: 0 })
    pointer(target, 'pointerenter')
    vi.advanceTimersByTime(10)
    await nextTick()
    pointer(target, 'pointerdown')
    await nextTick()
    expect(tooltip()).toBeNull()
  })

  it('does nothing when disabled', async () => {
    const target = setup({ delay: 0, disabled: true })
    expect(target.getAttribute('aria-describedby')).toBeNull()
    pointer(target, 'pointerenter')
    vi.advanceTimersByTime(10)
    await nextTick()
    expect(tooltip()).toBeNull()
  })
})
