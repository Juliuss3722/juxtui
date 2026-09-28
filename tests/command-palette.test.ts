import type { CommandGroup } from '../src/components/command-palette/JCommandPalette.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import JCommandPalette from '../src/components/command-palette/JCommandPalette.vue'
import { matchText, splitByRanges } from '../src/components/command-palette/search'
import { byRole, key, settle } from './utils'

const groups: CommandGroup[] = [
  {
    id: 'nav',
    label: 'Navigation',
    items: [
      { id: 'home', label: 'Go to home' },
      { id: 'settings', label: 'Go to settings', keywords: ['preferences'] },
      { id: 'billing', label: 'Billing', disabled: true },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'new', label: 'New project', shortcut: 'mod+n' },
      { id: 'invite', label: 'Invite teammate' },
    ],
  },
]

function setup(props: Record<string, unknown> = {}) {
  const open = ref(false)
  const search = ref('')
  const onSelect = vi.fn()
  const Host = defineComponent({
    setup: () => () =>
      h(JCommandPalette, {
        groups,
        'open': open.value,
        'onUpdate:open': (value: boolean) => (open.value = value),
        'search': search.value,
        'onUpdate:search': (value: string) => (search.value = value),
        onSelect,
        ...props,
      }),
  })
  mount(Host, { attachTo: document.body })
  return { open, search, onSelect }
}

const input = () => document.querySelector<HTMLInputElement>('.j-command__input')!
const labels = () => byRole('option').map(el => el.querySelector('.j-command__item-label')!.textContent)
const active = () => document.getElementById(input().getAttribute('aria-activedescendant') ?? '')

async function type(value: string) {
  const el = input()
  el.value = value
  el.dispatchEvent(new Event('input'))
  await settle()
}

describe('search ranking', () => {
  it('ranks exact > prefix > word > substring > fuzzy', () => {
    const q = 'set'
    const exact = matchText(q, 'set').score
    const prefix = matchText(q, 'settings').score
    const word = matchText(q, 'go to settings').score
    const inner = matchText(q, 'reset').score
    const fuzzy = matchText(q, 'sheet').score
    expect(exact).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(word)
    expect(word).toBeGreaterThan(inner)
    expect(inner).toBeGreaterThan(fuzzy)
    expect(fuzzy).toBeGreaterThan(0)
    expect(matchText('xyz', 'settings').score).toBe(0)
  })

  it('returns highlight ranges', () => {
    const { ranges } = matchText('gts', 'Go to settings')
    const parts = splitByRanges('Go to settings', ranges)
    expect(parts.filter(p => p.match).map(p => p.text).join('')).toBe('Gts')
  })
})

describe('JCommandPalette', () => {
  it('toggles with the keyboard shortcut', async () => {
    const { open } = setup()
    key(document, 'k', { ctrlKey: true })
    await settle()
    expect(open.value).toBe(true)
    expect(document.activeElement).toBe(input())
    key(document, 'k', { ctrlKey: true })
    await settle()
    expect(open.value).toBe(false)
  })

  it('renders groups as an accessible listbox', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    expect(input().getAttribute('role')).toBe('combobox')
    expect(byRole('group')).toHaveLength(2)
    expect(labels()).toEqual(['Go to home', 'Go to settings', 'Billing', 'New project', 'Invite teammate'])
    expect(active()?.textContent).toContain('Go to home')
  })

  it('filters and ranks as you type', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    await type('inv')
    expect(labels()).toEqual(['Invite teammate'])
    await type('pref')
    expect(labels()).toEqual(['Go to settings'])
  })

  it('shows an empty state', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    await type('zzzz')
    expect(byRole('option')).toHaveLength(0)
    expect(document.querySelector('.j-command__empty')?.textContent).toContain('No results')
  })

  it('navigates with arrows, skips disabled items and wraps', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    key(input(), 'ArrowDown')
    await nextTick()
    expect(active()?.textContent).toContain('Go to settings')
    key(input(), 'ArrowDown')
    await nextTick()
    expect(active()?.textContent).toContain('New project')
    key(input(), 'ArrowUp')
    key(input(), 'ArrowUp')
    key(input(), 'ArrowUp')
    await nextTick()
    expect(active()?.textContent).toContain('Invite teammate')
  })

  it('selects with Enter and closes', async () => {
    const { open, onSelect } = setup()
    open.value = true
    await settle()
    await type('new')
    key(input(), 'Enter')
    await settle()
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'new' }))
    expect(open.value).toBe(false)
  })

  it('calls item.onSelect', async () => {
    const handler = vi.fn()
    const { open } = setup({ groups: [{ id: 'g', items: [{ id: 'a', label: 'Alpha', onSelect: handler }] }] })
    open.value = true
    await settle()
    byRole('option')[0]!.click()
    expect(handler).toHaveBeenCalledOnce()
  })

  it('shows recent items while the search is empty', async () => {
    const { open } = setup({ recent: [{ id: 'invite', label: 'Invite teammate' }] })
    open.value = true
    await settle()
    expect(document.querySelector('.j-command__group-label')?.textContent).toContain('Recent')
    await type('go')
    expect(document.querySelector('.j-command__group-label')?.textContent).not.toContain('Recent')
  })

  it('shows loading state', async () => {
    const { open } = setup({ loading: true, groups: [] })
    open.value = true
    await settle()
    expect(document.querySelector('.j-command__progress')).not.toBeNull()
    expect(document.querySelector('.j-command__empty')?.textContent).toContain('Searching')
  })

  it('leaves filtering to you when filter=false', async () => {
    const { open } = setup({ filter: false })
    open.value = true
    await settle()
    await type('zzzz')
    expect(byRole('option')).toHaveLength(5)
  })

  it('closes on Escape', async () => {
    const { open } = setup()
    open.value = true
    await settle()
    key(input(), 'Escape')
    await settle()
    expect(open.value).toBe(false)
  })
})
