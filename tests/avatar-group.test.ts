import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JAvatarGroup from '../src/components/avatar-group/JAvatarGroup.vue'

describe('JAvatarGroup', () => {
  const items = [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }, { name: 'Alan Turing' }, { name: 'Edsger Dijkstra' }]

  it('renders every avatar when under the max', () => {
    const wrapper = mount(JAvatarGroup, { props: { items: items.slice(0, 2) } })
    expect(wrapper.findAllComponents({ name: undefined }).length).toBeGreaterThanOrEqual(0)
    expect(wrapper.findAll('.j-avatar-group__item')).toHaveLength(2)
    expect(wrapper.find('.j-avatar-group__overflow').exists()).toBe(false)
  })

  it('collapses extra items into a +N overflow indicator', () => {
    const wrapper = mount(JAvatarGroup, { props: { items, max: 2 } })
    expect(wrapper.findAll('.j-avatar')).toHaveLength(2)
    expect(wrapper.get('.j-avatar-group__overflow').text()).toBe('+2')
  })

  it('exposes an accessible group label', () => {
    const wrapper = mount(JAvatarGroup, { props: { items } })
    expect(wrapper.attributes('aria-label')).toBe('4 avatars')
  })

  it('accepts a custom accessible label', () => {
    const wrapper = mount(JAvatarGroup, { props: { items, label: 'Reviewers' } })
    expect(wrapper.attributes('aria-label')).toBe('Reviewers')
  })

  it('makes the overflow indicator keyboard-focusable', () => {
    const wrapper = mount(JAvatarGroup, { props: { items, max: 2 } })
    const overflow = wrapper.get('.j-avatar-group__overflow')
    expect(overflow.attributes('tabindex')).toBe('0')
    expect(overflow.attributes('aria-label')).toBe('2 more')
  })
})
