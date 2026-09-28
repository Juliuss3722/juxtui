import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JCheckbox from '../src/components/checkbox/JCheckbox.vue'
import JSwitch from '../src/components/switch/JSwitch.vue'

describe('JCheckbox', () => {
  it('renders a native checkbox with a label', () => {
    const wrapper = mount(JCheckbox, { props: { label: 'Accept terms' } })
    const input = wrapper.get('input[type="checkbox"]')
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
  })

  it('supports v-model', async () => {
    const wrapper = mount(JCheckbox, {
      props: { 'modelValue': false, 'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value as boolean }) },
    })
    const input = wrapper.get('input')
    await input.setValue(true)
    expect(wrapper.props('modelValue')).toBe(true)
    expect(wrapper.attributes('data-state')).toBe('checked')
  })

  it('reflects indeterminate on the DOM property', async () => {
    const wrapper = mount(JCheckbox, { props: { indeterminate: true } })
    await wrapper.vm.$nextTick()
    expect((wrapper.get('input').element as HTMLInputElement).indeterminate).toBe(true)
    expect(wrapper.attributes('data-state')).toBe('indeterminate')
  })

  it('does not change when disabled', () => {
    const wrapper = mount(JCheckbox, { props: { disabled: true } })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('is-disabled')
  })

  it('describes the checkbox', () => {
    const wrapper = mount(JCheckbox, { props: { label: 'Newsletter', description: 'Monthly, no spam' } })
    const input = wrapper.get('input')
    expect(input.attributes('aria-describedby')).toBe(wrapper.get('.j-checkbox__description').attributes('id'))
  })
})

describe('JSwitch', () => {
  it('uses the switch role and reflects state', () => {
    const wrapper = mount(JSwitch, { props: { modelValue: true, label: 'Wi-Fi' } })
    const button = wrapper.get('[role="switch"]')
    expect(button.attributes('aria-checked')).toBe('true')
    expect(button.attributes('aria-labelledby')).toBe(wrapper.get('label').attributes('id'))
  })

  it('toggles on click', async () => {
    const wrapper = mount(JSwitch, {
      props: { 'modelValue': false, 'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value as boolean }) },
    })
    await wrapper.get('[role="switch"]').trigger('click')
    expect(wrapper.props('modelValue')).toBe(true)
    expect(wrapper.attributes('data-state')).toBe('on')
  })

  it('does not toggle when disabled', async () => {
    const wrapper = mount(JSwitch, { props: { modelValue: false, disabled: true } })
    await wrapper.get('[role="switch"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('submits a value with a name when on', () => {
    const wrapper = mount(JSwitch, { props: { modelValue: true, name: 'notifications' } })
    const hidden = wrapper.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('notifications')
    expect(hidden.attributes('value')).toBe('on')
  })
})
