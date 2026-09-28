import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import JToaster from '../src/components/toast/JToaster.vue'
import { toast, toastState, useToast } from '../src/composables/useToast'
import { key } from './utils'

const titles = () => Array.from(document.querySelectorAll('.j-toast__title')).map(el => el.textContent?.trim())

describe('toast store', () => {
  it('creates typed toasts and returns ids', () => {
    const id = toast.success('Saved')
    expect(toastState.toasts[0]).toMatchObject({ id, title: 'Saved', type: 'success' })
  })

  it('never expires loading toasts by default', () => {
    toast.loading('Uploading')
    expect(toastState.toasts[0]!.duration).toBe(Number.POSITIVE_INFINITY)
  })

  it('replaces a toast when an id is reused', () => {
    toast('One', { id: 'x' })
    toast('Two', { id: 'x' })
    expect(toastState.toasts).toHaveLength(1)
    expect(toastState.toasts[0]!.title).toBe('Two')
  })

  it('updates and dismisses', () => {
    const onDismiss = vi.fn()
    const id = toast.loading('Working', { onDismiss })
    toast.update(id, { title: 'Done', type: 'success' })
    expect(toastState.toasts[0]).toMatchObject({ title: 'Done', type: 'success' })
    expect(Number.isFinite(toastState.toasts[0]!.duration)).toBe(true)
    toast.dismiss(id)
    expect(toastState.toasts).toHaveLength(0)
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('follows a promise', async () => {
    let resolve!: (value: string) => void
    const pending = new Promise<string>(r => (resolve = r))
    toast.promise(pending, { loading: 'Saving', success: value => `Saved ${value}`, error: 'Failed' })
    expect(toastState.toasts[0]!.type).toBe('loading')
    resolve('draft')
    await pending
    await nextTick()
    expect(toastState.toasts[0]).toMatchObject({ type: 'success', title: 'Saved draft' })
  })

  it('reports rejected promises', async () => {
    const failing = Promise.reject(new Error('nope'))
    toast.promise(failing, { loading: 'Saving', success: 'Saved', error: 'Could not save' }).catch(() => {})
    await failing.catch(() => {})
    await nextTick()
    expect(toastState.toasts[0]).toMatchObject({ type: 'error', title: 'Could not save' })
  })

  it('is available from useToast', () => {
    const { toast: fn, toasts } = useToast()
    fn.info('Hello')
    expect(toasts).toHaveLength(1)
  })
})

describe('JToaster', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders toasts in a polite live region', async () => {
    mount(JToaster, { attachTo: document.body })
    toast('Hello', { description: 'World' })
    await nextTick()
    const list = document.querySelector('.j-toaster__list')!
    expect(list.getAttribute('aria-live')).toBe('polite')
    expect(titles()).toEqual(['Hello'])
    expect(document.querySelector('.j-toast__description')?.textContent).toContain('World')
  })

  it('uses role=alert for errors', async () => {
    mount(JToaster, { attachTo: document.body })
    toast.error('Broken')
    await nextTick()
    expect(document.querySelector('.j-toast')?.getAttribute('role')).toBe('alert')
  })

  it('auto-dismisses after its duration', async () => {
    mount(JToaster, { attachTo: document.body })
    toast('Brief', { duration: 1000 })
    await nextTick()
    vi.advanceTimersByTime(999)
    expect(toastState.toasts).toHaveLength(1)
    vi.advanceTimersByTime(2)
    expect(toastState.toasts).toHaveLength(0)
  })

  it('pauses while hovered', async () => {
    mount(JToaster, { attachTo: document.body })
    toast('Stay', { duration: 1000 })
    await nextTick()
    vi.advanceTimersByTime(500)
    document.querySelector('.j-toaster__list')!.dispatchEvent(new PointerEvent('pointerenter'))
    await nextTick()
    vi.advanceTimersByTime(5000)
    expect(toastState.toasts).toHaveLength(1)
    document.querySelector('.j-toaster__list')!.dispatchEvent(new PointerEvent('pointerleave'))
    await nextTick()
    vi.advanceTimersByTime(499)
    expect(toastState.toasts).toHaveLength(1)
    vi.advanceTimersByTime(2)
    expect(toastState.toasts).toHaveLength(0)
  })

  it('dismisses from the close button', async () => {
    mount(JToaster, { attachTo: document.body })
    toast('Closable')
    await nextTick()
    document.querySelector<HTMLElement>('.j-toast__close')!.click()
    expect(toastState.toasts).toHaveLength(0)
  })

  it('dismisses with Escape when focused', async () => {
    mount(JToaster, { attachTo: document.body })
    toast('Focus me')
    await nextTick()
    const el = document.querySelector<HTMLElement>('.j-toast')!
    el.focus()
    key(el, 'Escape')
    expect(toastState.toasts).toHaveLength(0)
  })

  it('runs actions', async () => {
    const onClick = vi.fn()
    mount(JToaster, { attachTo: document.body })
    toast('Archived', { action: { label: 'Undo', onClick } })
    await nextTick()
    document.querySelector<HTMLElement>('.j-toast__action')!.click()
    expect(onClick).toHaveBeenCalledOnce()
    expect(toastState.toasts).toHaveLength(0)
  })

  it('limits how many are visible', async () => {
    mount(JToaster, { attachTo: document.body, props: { max: 2 } })
    toast('1')
    toast('2')
    toast('3')
    await nextTick()
    expect(titles()).toEqual(['2', '3'])
  })
})
