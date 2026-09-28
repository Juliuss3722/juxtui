import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JCollapsible from '../src/components/collapsible/JCollapsible.vue'

describe('JCollapsible', () => {
  it('wires the trigger to the panel', () => {
    const wrapper = mount(JCollapsible, { props: { label: 'Advanced settings' }, slots: { default: 'Content' } })
    const trigger = wrapper.get('.j-collapsible__trigger')
    const panel = wrapper.get(`#${trigger.attributes('aria-controls')}`)
    expect(panel.attributes('role')).toBe('region')
    expect(panel.attributes('aria-labelledby')).toBe(trigger.attributes('id'))
    expect(trigger.text()).toBe('Advanced settings')
  })

  it('toggles v-model on click', async () => {
    const wrapper = mount(JCollapsible, {
      props: { 'modelValue': false, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as boolean }) },
    })
    expect(wrapper.attributes('data-state')).toBe('closed')
    await wrapper.get('.j-collapsible__trigger').trigger('click')
    expect(wrapper.props('modelValue')).toBe(true)
  })

  it('makes a closed panel inert', async () => {
    const wrapper = mount(JCollapsible, { props: { modelValue: false } })
    expect(wrapper.get('.j-collapsible__panel').attributes('inert')).toBeDefined()
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.get('.j-collapsible__panel').attributes('inert')).toBeUndefined()
  })

  it('supports a custom trigger slot', () => {
    const wrapper = mount(JCollapsible, { slots: { trigger: '<strong>Custom</strong>' } })
    expect(wrapper.find('.j-collapsible__label strong').text()).toBe('Custom')
  })
})
