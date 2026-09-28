import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JEmptyState from '../src/components/empty-state/JEmptyState.vue'

describe('JEmptyState', () => {
  it('renders title and description', () => {
    const wrapper = mount(JEmptyState, { props: { title: 'No results', description: 'Try a different search.' } })
    expect(wrapper.find('.j-empty-state__title').text()).toBe('No results')
    expect(wrapper.find('.j-empty-state__description').text()).toBe('Try a different search.')
  })

  it('renders icon and actions slots', () => {
    const wrapper = mount(JEmptyState, {
      props: { title: 'Empty' },
      slots: { icon: '<svg />', actions: '<button>Retry</button>' },
    })
    expect(wrapper.find('.j-empty-state__icon svg').exists()).toBe(true)
    expect(wrapper.find('.j-empty-state__actions button').text()).toBe('Retry')
  })

  it.each(['sm', 'md', 'lg'] as const)('applies the %s size', (size) => {
    const wrapper = mount(JEmptyState, { props: { size } })
    expect(wrapper.classes()).toContain(`j-empty-state--${size}`)
  })
})
