import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import JPopover from '../src/components/popover/JPopover.vue'
import JSheet from '../src/components/sheet/JSheet.vue'
import { key, settle } from './utils'

describe('JSheet', () => {
  function setup(props: Record<string, unknown> = {}) {
    const open = ref(false)
    const Host = defineComponent({
      setup: () => () => [
        h('button', { id: 'opener', onClick: () => (open.value = true) }, 'Open'),
        h(JSheet, {
          'open': open.value,
          'onUpdate:open': (value: boolean) => (open.value = value),
          'title': 'Filters',
          'description': 'Narrow the list.',
          ...props,
        }, {
          default: () => h('input', { id: 'query' }),
          footer: () => h('button', { id: 'apply' }, 'Apply'),
        }),
      ],
    })
    mount(Host, { attachTo: document.body })
    return { open }
  }

  it('is a labelled modal that focuses the first field and restores focus', async () => {
    const { open } = setup()
    const opener = document.getElementById('opener')!
    opener.focus()
    opener.click()
    await settle()
    const sheet = document.querySelector('[role="dialog"]')!
    expect(sheet.getAttribute('aria-modal')).toBe('true')
    expect(document.getElementById(sheet.getAttribute('aria-labelledby')!)!.textContent).toContain('Filters')
    expect(document.activeElement?.id).toBe('query')
    open.value = false
    await settle()
    expect(document.activeElement).toBe(opener)
  })

  it('closes on Escape and locks scroll', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    key(document, 'Escape')
    await settle()
    expect(open.value).toBe(false)
  })

  it('applies side and size', async () => {
    const { open } = setup({ side: 'left', size: 'lg' })
    open.value = true
    await settle()
    const sheet = document.querySelector('.j-sheet')!
    expect(sheet.classList).toContain('j-sheet--left')
    expect(sheet.classList).toContain('j-sheet--lg')
  })

  it('can refuse to close', async () => {
    const { open } = setup({ closeOnEscape: false })
    open.value = true
    await settle()
    key(document, 'Escape')
    await settle()
    expect(open.value).toBe(true)
  })
})

describe('JPopover', () => {
  async function setup() {
    const open = ref(false)
    const Host = defineComponent({
      setup: () => () => [
        h(JPopover, {
          'open': open.value,
          'onUpdate:open': (value: boolean) => (open.value = value),
          'ariaLabel': 'Share',
        }, {
          trigger: () => h('button', { id: 'trigger' }, 'Share'),
          default: () => [h('input', { id: 'link' }), h('button', { id: 'copy' }, 'Copy')],
        }),
        h('button', { id: 'outside' }, 'Elsewhere'),
      ],
    })
    mount(Host, { attachTo: document.body })
    await new Promise(resolve => setTimeout(resolve, 2))
    return { open, trigger: document.getElementById('trigger')! }
  }

  it('wires the trigger and moves focus into the content', async () => {
    const { trigger } = await setup()
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    trigger.click()
    await settle()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const content = document.querySelector('.j-popover')!
    expect(content.getAttribute('role')).toBe('dialog')
    expect(trigger.getAttribute('aria-controls')).toBe(content.id)
    expect(document.activeElement?.id).toBe('link')
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const { trigger, open } = await setup()
    trigger.click()
    await settle()
    key(document.activeElement!, 'Escape')
    await settle()
    expect(open.value).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('closes when pressing outside', async () => {
    const { trigger, open } = await setup()
    trigger.click()
    await settle()
    document.getElementById('outside')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await settle()
    expect(open.value).toBe(false)
  })

  it('closes when focus leaves', async () => {
    const { trigger, open } = await setup()
    trigger.click()
    await settle()
    document.getElementById('outside')!.focus()
    await settle()
    expect(open.value).toBe(false)
  })

  it('toggles from the trigger', async () => {
    const { trigger, open } = await setup()
    trigger.click()
    await settle()
    trigger.click()
    await settle()
    expect(open.value).toBe(false)
  })
})
