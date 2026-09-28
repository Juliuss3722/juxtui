import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import JAvatar from '../src/components/avatar/JAvatar.vue'
import JBadge from '../src/components/badge/JBadge.vue'
import JCard from '../src/components/card/JCard.vue'

describe('JBadge', () => {
  it.each(['neutral', 'success', 'warning', 'destructive', 'accent'] as const)('renders the %s variant', (variant) => {
    const wrapper = mount(JBadge, { props: { variant }, slots: { default: 'Label' } })
    expect(wrapper.classes()).toContain(`j-badge--${variant}`)
    expect(wrapper.text()).toBe('Label')
  })

  it('renders the status style with a marker', () => {
    const wrapper = mount(JBadge, { props: { dot: true } })
    expect(wrapper.find('.j-badge__marker').attributes('aria-hidden')).toBe('true')
  })
})

describe('JAvatar', () => {
  it('shows initials as the fallback', () => {
    const wrapper = mount(JAvatar, { props: { name: 'Ada Lovelace' } })
    expect(wrapper.find('.j-avatar__fallback').text()).toBe('AL')
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Ada Lovelace')
  })

  it('uses a single initial for one name', () => {
    const wrapper = mount(JAvatar, { props: { name: 'Grace' } })
    expect(wrapper.find('.j-avatar__fallback').text()).toBe('G')
  })

  it('renders the image and swaps the fallback out once loaded', async () => {
    const wrapper = mount(JAvatar, { props: { name: 'Ada Lovelace', src: '/ada.jpg' } })
    expect(wrapper.attributes('data-state')).toBe('loading')
    await wrapper.find('img').trigger('load')
    expect(wrapper.attributes('data-state')).toBe('loaded')
    expect(wrapper.find('.j-avatar__fallback').exists()).toBe(false)
  })

  it('falls back when the image fails', async () => {
    const wrapper = mount(JAvatar, { props: { name: 'Ada Lovelace', src: '/missing.jpg' } })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.j-avatar__fallback').text()).toBe('AL')
  })

  it('announces status', () => {
    const wrapper = mount(JAvatar, { props: { name: 'Ada', status: 'online' } })
    expect(wrapper.find('.j-avatar__status--online').exists()).toBe(true)
    expect(wrapper.attributes('aria-label')).toBe('Ada (Online)')
  })

  it('applies size and shape', () => {
    const wrapper = mount(JAvatar, { props: { size: 'lg', shape: 'square' } })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['j-avatar--lg', 'j-avatar--square']))
  })
})

describe('JCard', () => {
  it('renders title, description, body and footer', () => {
    const wrapper = mount(JCard, {
      props: { title: 'Usage', description: 'This month' },
      slots: { default: 'Body', footer: () => h('button', 'Upgrade'), actions: () => h('span', { class: 'act' }) },
    })
    expect(wrapper.find('.j-card__title').text()).toBe('Usage')
    expect(wrapper.find('.j-card__description').text()).toBe('This month')
    expect(wrapper.find('.j-card__body').text()).toBe('Body')
    expect(wrapper.find('.j-card__footer button').exists()).toBe(true)
    expect(wrapper.find('.j-card__actions .act').exists()).toBe(true)
  })

  it('omits empty regions', () => {
    const wrapper = mount(JCard, { slots: { default: 'Only body' } })
    expect(wrapper.find('.j-card__header').exists()).toBe(false)
    expect(wrapper.find('.j-card__footer').exists()).toBe(false)
  })

  it('supports variants and padding', () => {
    const wrapper = mount(JCard, { props: { variant: 'muted', padding: 'lg', as: 'section' } })
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['j-card--muted', 'j-card--p-lg']))
  })
})
