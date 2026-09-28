import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JTag from '../src/components/tag/JTag.vue'

describe('JTag', () => {
  it.each(['neutral', 'success', 'warning', 'destructive', 'accent'] as const)('renders the %s variant', (variant) => {
    const wrapper = mount(JTag, { props: { variant }, slots: { default: 'Engineering' } })
    expect(wrapper.classes()).toContain(`j-tag--${variant}`)
    expect(wrapper.find('.j-tag__label').text()).toBe('Engineering')
  })

  it('emits remove when the close button is clicked', async () => {
    const wrapper = mount(JTag, { props: { removeLabel: 'Remove Engineering' }, slots: { default: 'Engineering' } })
    await wrapper.get('.j-tag__remove').trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
    expect(wrapper.get('.j-tag__remove').attributes('aria-label')).toBe('Remove Engineering')
  })

  it('does not emit remove when disabled', async () => {
    const wrapper = mount(JTag, { props: { disabled: true }, slots: { default: 'x' } })
    await wrapper.get('.j-tag__remove').trigger('click')
    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.get('.j-tag__remove').attributes('disabled')).toBeDefined()
  })

  it('renders a leading icon slot', () => {
    const wrapper = mount(JTag, { slots: { default: 'x', leading: '<svg />' } })
    expect(wrapper.find('.j-tag__icon svg').exists()).toBe(true)
  })
})
