import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import JButton from '../src/components/button/JButton.vue'

describe('JButton', () => {
  it('renders a native button with sensible defaults', () => {
    const wrapper = mount(JButton, { slots: { default: 'Save changes' } })
    const button = wrapper.get('button')
    expect(button.text()).toBe('Save changes')
    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toContain('j-button--primary')
    expect(button.classes()).toContain('j-button--md')
  })

  it.each(['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const)('applies the %s variant', (variant) => {
    const wrapper = mount(JButton, { props: { variant } })
    expect(wrapper.classes()).toContain(`j-button--${variant}`)
  })

  it.each(['xs', 'sm', 'md', 'lg'] as const)('applies the %s size', (size) => {
    const wrapper = mount(JButton, { props: { size } })
    expect(wrapper.classes()).toContain(`j-button--${size}`)
  })

  it('emits click', async () => {
    const onClick = vi.fn()
    const wrapper = mount(JButton, { attrs: { onClick } })
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is natively disabled', async () => {
    const onClick = vi.fn()
    const wrapper = mount(JButton, { props: { disabled: true }, attrs: { onClick } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('blocks clicks while loading but stays focusable', async () => {
    const onClick = vi.fn()
    const wrapper = mount(JButton, { props: { loading: true }, attrs: { onClick }, slots: { default: 'Save' } })
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.j-spinner').exists()).toBe(true)
    // The label stays in the DOM so the width and the accessible name are kept.
    expect(wrapper.text()).toContain('Save')
    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders as another element', () => {
    const wrapper = mount(JButton, { props: { as: 'a' }, attrs: { href: '/docs' } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/docs')
    expect(wrapper.attributes('type')).toBeUndefined()
  })

  it('removes a disabled link from the tab order', () => {
    const wrapper = mount(JButton, { props: { as: 'a', disabled: true } })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('tabindex')).toBe('-1')
  })

  it('renders leading and trailing slots', () => {
    const wrapper = mount(JButton, {
      slots: { default: 'Next', leading: () => h('svg', { class: 'lead' }), trailing: () => h('svg', { class: 'trail' }) },
    })
    expect(wrapper.find('.lead').exists()).toBe(true)
    expect(wrapper.find('.trail').exists()).toBe(true)
  })

  it('supports submit type', () => {
    const wrapper = mount(JButton, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })
})
