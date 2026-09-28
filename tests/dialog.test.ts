import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import JDialog from '../src/components/dialog/JDialog.vue'
import { key, settle } from './utils'

function setup(props: Record<string, unknown> = {}) {
  const open = ref(false)
  const Host = defineComponent({
    setup: () => () => [
      h('button', { id: 'opener', onClick: () => (open.value = true) }, 'Open'),
      h(
        JDialog,
        {
          'open': open.value,
          'onUpdate:open': (value: boolean) => (open.value = value),
          'title': 'Delete project',
          'description': 'This cannot be undone.',
          ...props,
        },
        {
          default: () => h('input', { id: 'name' }),
          footer: () => h('button', { id: 'confirm' }, 'Delete'),
        },
      ),
    ],
  })
  const wrapper = mount(Host, { attachTo: document.body })
  return { wrapper, open }
}

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')

describe('JDialog', () => {
  it('renders nothing while closed', () => {
    setup()
    expect(dialog()).toBeNull()
  })

  it('is labelled and described', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    const el = dialog()!
    expect(el.getAttribute('aria-modal')).toBe('true')
    expect(document.getElementById(el.getAttribute('aria-labelledby')!)!.textContent).toContain('Delete project')
    expect(document.getElementById(el.getAttribute('aria-describedby')!)!.textContent).toContain('cannot be undone')
  })

  it('focuses the first field, then restores focus on close', async () => {
    const { open } = setup()
    const opener = document.getElementById('opener')!
    opener.focus()
    opener.click()
    await settle()
    expect(document.activeElement?.id).toBe('name')
    open.value = false
    await settle()
    expect(document.activeElement).toBe(opener)
  })

  it('closes on Escape', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    key(document, 'Escape')
    await settle()
    expect(open.value).toBe(false)
  })

  it('can refuse Escape', async () => {
    const { open } = setup({ closeOnEscape: false })
    open.value = true
    await settle()
    key(document, 'Escape')
    await settle()
    expect(open.value).toBe(true)
  })

  it('closes when the backdrop is clicked', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    const positioner = document.querySelector<HTMLElement>('.j-dialog__positioner')!
    positioner.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    positioner.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await settle()
    expect(open.value).toBe(false)
  })

  it('ignores clicks that start inside the panel', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    const positioner = document.querySelector<HTMLElement>('.j-dialog__positioner')!
    dialog()!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    positioner.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await settle()
    expect(open.value).toBe(true)
  })

  it('traps Tab inside the dialog', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    const close = document.querySelector<HTMLElement>('.j-dialog__close')!
    close.focus()
    const event = key(document, 'Tab')
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('name')
    key(document, 'Tab', { shiftKey: true })
    expect(document.activeElement).toBe(close)
  })

  it('locks body scroll while open', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    open.value = false
    await settle()
    expect(document.body.style.overflow).toBe('')
  })

  it('closes from the close button', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    document.querySelector<HTMLElement>('.j-dialog__close')!.click()
    await settle()
    expect(open.value).toBe(false)
  })
})
