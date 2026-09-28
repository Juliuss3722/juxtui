import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JBreadcrumb from '../src/components/breadcrumb/JBreadcrumb.vue'

describe('JBreadcrumb', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'juxt.dev' },
  ]

  it('renders links for every item but the last', () => {
    const wrapper = mount(JBreadcrumb, { props: { items } })
    const links = wrapper.findAll('.j-breadcrumb__link')
    expect(links).toHaveLength(2)
    expect(links[0]!.attributes('href')).toBe('/')
  })

  it('marks the last item as the current page', () => {
    const wrapper = mount(JBreadcrumb, { props: { items } })
    const current = wrapper.get('.j-breadcrumb__current')
    expect(current.text()).toBe('juxt.dev')
    expect(current.attributes('aria-current')).toBe('page')
  })

  it('collapses long trails with an ellipsis', () => {
    const long = Array.from({ length: 6 }, (_, i) => ({ label: `Level ${i + 1}`, href: `/${i}` }))
    const wrapper = mount(JBreadcrumb, { props: { items: long, maxItems: 4 } })
    expect(wrapper.find('.j-breadcrumb__ellipsis').exists()).toBe(true)
    expect(wrapper.findAll('.j-breadcrumb__item')).toHaveLength(4)
  })

  it('falls back to the default slot when no items are given', () => {
    const wrapper = mount(JBreadcrumb, { slots: { default: '<li class="j-breadcrumb__item">Custom</li>' } })
    expect(wrapper.find('.j-breadcrumb__item').text()).toBe('Custom')
  })

  it('has an accessible nav landmark', () => {
    const wrapper = mount(JBreadcrumb, { props: { items, label: 'You are here' } })
    expect(wrapper.get('nav').attributes('aria-label')).toBe('You are here')
  })
})
