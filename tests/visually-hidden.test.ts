import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JVisuallyHidden from '../src/components/visually-hidden/JVisuallyHidden.vue'

describe('JVisuallyHidden', () => {
  it('renders a span by default with the sr-only class', () => {
    const wrapper = mount(JVisuallyHidden, { slots: { default: 'Close menu' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('j-sr-only')
    expect(wrapper.text()).toBe('Close menu')
  })

  it('renders as another element via `as`', () => {
    const wrapper = mount(JVisuallyHidden, { props: { as: 'label' }, slots: { default: 'Email' } })
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.classes()).toContain('j-sr-only')
  })
})
