import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import JButton from '../src/components/button/JButton.vue'
import JDropdownMenu from '../src/components/dropdown-menu/JDropdownMenu.vue'
import JDropdownMenuItem from '../src/components/dropdown-menu/JDropdownMenuItem.vue'
import JDropdownMenuSeparator from '../src/components/dropdown-menu/JDropdownMenuSeparator.vue'
import JDropdownMenuSub from '../src/components/dropdown-menu/JDropdownMenuSub.vue'
import { byRole, key, settle, waitFor } from './utils'

async function setup(onSelect = vi.fn()) {
  const Host = defineComponent({
    setup: () => () =>
      h(JDropdownMenu, null, {
        trigger: () => h(JButton, { id: 'trigger' }, () => 'Options'),
        default: () => [
          h(JDropdownMenuItem, { onSelect: () => onSelect('edit') }, () => 'Edit'),
          h(JDropdownMenuItem, { disabled: true, onSelect: () => onSelect('archive') }, () => 'Archive'),
          h(JDropdownMenuItem, { onSelect: () => onSelect('duplicate') }, () => 'Duplicate'),
          h(JDropdownMenuSeparator),
          h(JDropdownMenuSub, { label: 'Share' }, () => [
            h(JDropdownMenuItem, { onSelect: () => onSelect('link') }, () => 'Copy link'),
          ]),
          h(JDropdownMenuItem, { destructive: true, onSelect: () => onSelect('delete') }, () => 'Delete'),
        ],
      }),
  })
  const wrapper = mount(Host, { attachTo: document.body })
  const trigger = document.getElementById('trigger')!
  // Vue ignores listeners attached in the same millisecond an event starts;
  // a real user never clicks that fast after mount, but a test can.
  await new Promise(resolve => setTimeout(resolve, 2))
  return { wrapper, trigger, onSelect }
}

const menus = () => byRole('menu')
const items = (menu = menus()[0]!) => byRole('menuitem', menu)

describe('JDropdownMenu', () => {
  it('wires ARIA onto the trigger without a wrapper', async () => {
    const { trigger } = await setup()
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens from the keyboard and focuses the first item', async () => {
    const { trigger } = await setup()
    trigger.focus()
    key(trigger, 'ArrowDown')
    await settle()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(items()[0])
  })

  it('opens with ArrowUp on the last item', async () => {
    const { trigger } = await setup()
    key(trigger, 'ArrowUp')
    await settle()
    const all = items()
    expect(document.activeElement).toBe(all[all.length - 1])
  })

  it('moves through items, skipping disabled ones, and wraps', async () => {
    const { trigger } = await setup()
    key(trigger, 'ArrowDown')
    await settle()
    const menu = menus()[0]!
    key(menu, 'ArrowDown')
    expect(document.activeElement?.textContent).toContain('Duplicate')
    key(menu, 'End')
    expect(document.activeElement?.textContent).toContain('Delete')
    key(menu, 'ArrowDown')
    expect(document.activeElement?.textContent).toContain('Edit')
  })

  it('selects with Enter, closes, and returns focus', async () => {
    const { trigger, onSelect } = await setup()
    trigger.focus()
    key(trigger, 'ArrowDown')
    await settle()
    key(document.activeElement!, 'Enter')
    await settle()
    expect(onSelect).toHaveBeenCalledWith('edit')
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(trigger)
  })

  it('does not select disabled items', async () => {
    const { trigger, onSelect } = await setup()
    trigger.click()
    await waitFor(() => menus().length === 1)
    const archive = items().find(item => item.textContent?.includes('Archive'))!
    expect(archive.getAttribute('aria-disabled')).toBe('true')
    archive.click()
    await settle()
    expect(onSelect).not.toHaveBeenCalled()
    expect(menus()).toHaveLength(1)
  })

  it('closes on Escape and restores focus', async () => {
    const { trigger } = await setup()
    trigger.focus()
    key(trigger, 'ArrowDown')
    await settle()
    key(document.activeElement!, 'Escape')
    await settle()
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(trigger)
  })

  it('closes when pressing outside', async () => {
    const { trigger } = await setup()
    trigger.click()
    await settle()
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await settle()
    expect(menus()).toHaveLength(0)
  })

  it('jumps with typeahead', async () => {
    const { trigger } = await setup()
    key(trigger, 'ArrowDown')
    await settle()
    key(menus()[0]!, 'd')
    expect(document.activeElement?.textContent).toContain('Duplicate')
  })

  it('opens a submenu with ArrowRight and goes back with ArrowLeft', async () => {
    const { trigger, onSelect } = await setup()
    key(trigger, 'ArrowDown')
    await settle()
    const share = items().find(item => item.textContent?.includes('Share'))!
    expect(share.getAttribute('aria-haspopup')).toBe('menu')
    share.focus()
    key(share, 'ArrowRight')
    await settle()
    expect(menus()).toHaveLength(2)
    expect(share.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement?.textContent).toContain('Copy link')

    key(document.activeElement!, 'ArrowLeft')
    await settle()
    expect(menus()).toHaveLength(1)
    expect(document.activeElement).toBe(share)

    key(share, 'ArrowRight')
    await settle()
    key(document.activeElement!, 'Enter')
    await settle()
    expect(onSelect).toHaveBeenCalledWith('link')
    expect(menus()).toHaveLength(0)
  })

  it('Escape in a submenu only closes the submenu', async () => {
    const { trigger } = await setup()
    key(trigger, 'ArrowDown')
    await settle()
    const share = items().find(item => item.textContent?.includes('Share'))!
    share.focus()
    key(share, 'Enter')
    await settle()
    expect(menus()).toHaveLength(2)
    key(document.activeElement!, 'Escape')
    await settle()
    expect(menus()).toHaveLength(1)
  })

  it('keeps the menu open when select is prevented', async () => {
    const Host = defineComponent({
      setup: () => () =>
        h(JDropdownMenu, null, {
          trigger: () => h('button', { id: 't' }, 'Open'),
          default: () => h(JDropdownMenuItem, { onSelect: (event: Event) => event.preventDefault() }, () => 'Stay'),
        }),
    })
    mount(Host, { attachTo: document.body })
    document.getElementById('t')!.click()
    await settle()
    items()[0]!.click()
    await settle()
    expect(menus()).toHaveLength(1)
  })
})
