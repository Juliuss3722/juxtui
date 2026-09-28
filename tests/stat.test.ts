import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JStat from '../src/components/stat/JStat.vue'

describe('JStat', () => {
  it('renders the label and value', () => {
    const wrapper = mount(JStat, { props: { label: 'Revenue', value: '$12,400' } })
    expect(wrapper.find('.j-stat__label').text()).toBe('Revenue')
    expect(wrapper.find('.j-stat__value').text()).toBe('$12,400')
  })

  it('shows a trend delta with an icon', () => {
    const wrapper = mount(JStat, { props: { label: 'Revenue', value: 100, delta: '+12%', trend: 'up' } })
    const delta = wrapper.find('.j-stat__delta')
    expect(delta.classes()).toContain('j-stat__delta--up')
    expect(delta.find('svg').exists()).toBe(true)
  })

  it('omits the delta when not provided', () => {
    const wrapper = mount(JStat, { props: { label: 'Revenue', value: 100 } })
    expect(wrapper.find('.j-stat__delta').exists()).toBe(false)
  })

  it('renders a description and icon slot', () => {
    const wrapper = mount(JStat, {
      props: { label: 'Revenue', value: 100, description: 'vs last month' },
      slots: { icon: '<svg />' },
    })
    expect(wrapper.find('.j-stat__description').text()).toBe('vs last month')
    expect(wrapper.find('.j-stat__icon svg').exists()).toBe(true)
  })
})
