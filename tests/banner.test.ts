import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JBanner from '../src/components/banner/JBanner.vue'

describe('JBanner', () => {
  it.each(['neutral', 'info', 'success', 'warning', 'destructive'] as const)('renders the %s variant', (variant) => {
    const wrapper = mount(JBanner, { props: { variant, title: 'Maintenance window', description: 'Details' } })
    expect(wrapper.classes()).toContain(`j-banner--${variant}`)
    expect(wrapper.find('.j-banner__title').text()).toBe('Maintenance window')
  })

  it('emits dismiss', async () => {
    const wrapper = mount(JBanner, { props: { title: 'x', dismissible: true } })
    await wrapper.get('button[aria-label="Dismiss"]').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('renders actions and can hide the icon', () => {
    const wrapper = mount(JBanner, { props: { hideIcon: true }, slots: { actions: () => 'Upgrade' } })
    expect(wrapper.find('.j-banner__icon').exists()).toBe(false)
    expect(wrapper.find('.j-banner__actions').text()).toBe('Upgrade')
  })
})
