import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JTabs from '../src/components/tabs/JTabs.vue'
import { key, settle } from './utils'

const items = [
  { value: 'account', label: 'Account' },
  { value: 'billing', label: 'Billing', disabled: true },
  { value: 'team', label: 'Team' },
  { value: 'security', label: 'Security' },
]

function setup(modelValue = 'account') {
  const wrapper = mount(JTabs, {
    attachTo: document.body,
    props: { items, modelValue, 'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value as string }) },
    slots: { account: 'Account panel', team: 'Team panel', security: 'Security panel' },
  })
  return wrapper
}

describe('JTabs', () => {
  it('renders an accessible tablist', () => {
    const wrapper = setup()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(4)
    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs[0]!.attributes('tabindex')).toBe('0')
    expect(tabs[2]!.attributes('tabindex')).toBe('-1')
    const panel = wrapper.get(`#${tabs[0]!.attributes('aria-controls')}`)
    expect(panel.attributes('role')).toBe('tabpanel')
    expect(panel.attributes('aria-labelledby')).toBe(tabs[0]!.attributes('id'))
  })

  it('shows only the selected panel', () => {
    const wrapper = setup('team')
    const panels = wrapper.findAll('[role="tabpanel"]')
    const visible = panels.filter(panel => panel.attributes('hidden') === undefined)
    expect(visible).toHaveLength(1)
    expect(visible[0]!.text()).toBe('Team panel')
  })

  it('selects on click', async () => {
    const wrapper = setup()
    await wrapper.findAll('[role="tab"]')[3]!.trigger('click')
    expect(wrapper.props('modelValue')).toBe('security')
  })

  it('ignores disabled tabs', async () => {
    const wrapper = setup()
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    expect(wrapper.props('modelValue')).toBe('account')
  })

  it('moves with arrow keys, skipping disabled tabs and wrapping', async () => {
    const wrapper = setup()
    const list = wrapper.get('[role="tablist"]').element
    key(list, 'ArrowRight')
    await settle()
    expect(wrapper.props('modelValue')).toBe('team')
    expect((document.activeElement as HTMLElement).textContent?.trim()).toBe('Team')
    key(list, 'End')
    await settle()
    expect(wrapper.props('modelValue')).toBe('security')
    key(list, 'ArrowRight')
    await settle()
    expect(wrapper.props('modelValue')).toBe('account')
    key(list, 'ArrowLeft')
    await settle()
    expect(wrapper.props('modelValue')).toBe('security')
    key(list, 'Home')
    await settle()
    expect(wrapper.props('modelValue')).toBe('account')
  })

  it('applies variants', () => {
    const wrapper = mount(JTabs, { props: { items, variant: 'pill', size: 'sm' } })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['j-tabs--pill', 'j-tabs--sm']))
  })
})
