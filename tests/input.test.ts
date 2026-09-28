import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import JInput from '../src/components/input/JInput.vue'
import JTextarea from '../src/components/textarea/JTextarea.vue'

describe('JInput', () => {
  it('links the label to the input', () => {
    const wrapper = mount(JInput, { props: { label: 'Email' } })
    const input = wrapper.get('input')
    const label = wrapper.get('label')
    expect(label.text()).toBe('Email')
    expect(label.attributes('for')).toBe(input.attributes('id'))
  })

  it('supports v-model', async () => {
    const wrapper = mount(JInput, {
      props: { 'modelValue': 'a', 'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value as string }) },
    })
    const input = wrapper.get('input')
    expect(input.element.value).toBe('a')
    await input.setValue('hello')
    expect(wrapper.props('modelValue')).toBe('hello')
  })

  it('describes the input with its description', () => {
    const wrapper = mount(JInput, { props: { label: 'Name', description: 'Shown publicly' } })
    const input = wrapper.get('input')
    const description = wrapper.get('.j-field__description')
    expect(input.attributes('aria-describedby')).toBe(description.attributes('id'))
  })

  it('swaps description for error and marks the input invalid', () => {
    const wrapper = mount(JInput, { props: { label: 'Name', description: 'Hint', error: 'Required' } })
    const input = wrapper.get('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('.j-field__description').exists()).toBe(false)
    const error = wrapper.get('.j-field__error')
    expect(error.text()).toBe('Required')
    expect(input.attributes('aria-describedby')).toBe(error.attributes('id'))
  })

  it('accepts error=true without a message', () => {
    const wrapper = mount(JInput, { props: { error: true } })
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('.j-field__error').exists()).toBe(false)
  })

  it('handles disabled and required', () => {
    const wrapper = mount(JInput, { props: { label: 'Name', disabled: true, required: true } })
    const input = wrapper.get('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('required')).toBeDefined()
    expect(wrapper.find('.j-field__required').exists()).toBe(true)
    expect(wrapper.find('.j-control').classes()).toContain('is-disabled')
  })

  it('forwards attributes to the native input and class to the root', () => {
    const wrapper = mount(JInput, { attrs: { 'class': 'custom', 'data-test': 'x', 'maxlength': 5 } })
    expect(wrapper.classes()).toContain('custom')
    expect(wrapper.get('input').attributes('data-test')).toBe('x')
    expect(wrapper.get('input').attributes('maxlength')).toBe('5')
  })

  it('renders leading and trailing slots', () => {
    const wrapper = mount(JInput, { slots: { leading: () => h('i', { class: 'l' }), trailing: () => h('i', { class: 't' }) } })
    expect(wrapper.find('.j-control__adornment--leading .l').exists()).toBe(true)
    expect(wrapper.find('.j-control__adornment--trailing .t').exists()).toBe(true)
  })

  it('exposes focus()', async () => {
    const wrapper = mount(JInput, { attachTo: document.body })
    ;(wrapper.vm as unknown as { focus: () => void }).focus()
    await nextTick()
    expect(document.activeElement).toBe(wrapper.get('input').element)
  })
})

describe('JTextarea', () => {
  it('supports v-model, label and rows', async () => {
    const wrapper = mount(JTextarea, {
      props: { 'label': 'Bio', 'rows': 4, 'modelValue': '', 'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value as string }) },
    })
    const textarea = wrapper.get('textarea')
    expect(textarea.attributes('rows')).toBe('4')
    expect(wrapper.get('label').attributes('for')).toBe(textarea.attributes('id'))
    await textarea.setValue('Hello')
    expect(wrapper.props('modelValue')).toBe('Hello')
  })

  it('marks errors', () => {
    const wrapper = mount(JTextarea, { props: { error: 'Too long' } })
    expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('.j-field__error').text()).toBe('Too long')
  })

  it('disables resizing handle when autoresize is on', () => {
    const wrapper = mount(JTextarea, { props: { autoresize: true } })
    expect(wrapper.get('textarea').classes()).toContain('is-autoresize')
  })
})
