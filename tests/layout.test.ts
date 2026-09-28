import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import JBurger from '../src/components/burger/JBurger.vue'
import JFooter from '../src/components/footer/JFooter.vue'
import JFooterColumn from '../src/components/footer/JFooterColumn.vue'
import JNavbar from '../src/components/navbar/JNavbar.vue'
import JNavbarLink from '../src/components/navbar/JNavbarLink.vue'
import JSidebar from '../src/components/sidebar/JSidebar.vue'
import JSidebarGroup from '../src/components/sidebar/JSidebarGroup.vue'
import JSidebarItem from '../src/components/sidebar/JSidebarItem.vue'
import { key, settle } from './utils'

describe('JBurger', () => {
  it('toggles and announces its state', async () => {
    const wrapper = mount(JBurger, {
      props: { 'modelValue': false, 'controls': 'menu', 'onUpdate:modelValue': (v: boolean) => wrapper.setProps({ modelValue: v }) },
    })
    expect(wrapper.attributes('aria-expanded')).toBe('false')
    expect(wrapper.attributes('aria-label')).toBe('Open menu')
    expect(wrapper.attributes('aria-controls')).toBe('menu')
    await wrapper.trigger('click')
    expect(wrapper.props('modelValue')).toBe(true)
    expect(wrapper.attributes('aria-expanded')).toBe('true')
    expect(wrapper.attributes('aria-label')).toBe('Close menu')
  })
})

describe('JNavbar', () => {
  function setup() {
    const open = ref(false)
    const Host = defineComponent({
      setup: () => () => [
        h(JNavbar, { 'open': open.value, 'onUpdate:open': (v: boolean) => (open.value = v) }, {
          brand: () => h('a', { href: '/' }, 'Brand'),
          default: () => [
            h(JNavbarLink, { href: '/docs', active: true }, () => 'Docs'),
            h(JNavbarLink, { href: '/blog' }, () => 'Blog'),
          ],
          'actions': () => h('button', { id: 'action' }, 'Search'),
          'menu-footer': () => h('button', { id: 'signin' }, 'Sign in'),
        }),
        h('button', { id: 'outside' }, 'Outside'),
      ],
    })
    const wrapper = mount(Host, { attachTo: document.body })
    return { wrapper, open }
  }

  it('renders a banner with a labelled nav, links and actions', () => {
    const { wrapper } = setup()
    expect(wrapper.find('header.j-navbar').exists()).toBe(true)
    expect(wrapper.find('.j-navbar__links').attributes('aria-label')).toBe('Main')
    expect(wrapper.find('#action').exists()).toBe(true)
    const active = wrapper.find('.j-navbar__links .j-navbar-link.is-active')
    expect(active.attributes('aria-current')).toBe('page')
  })

  it('opens the mobile menu from the burger and focuses the first link', async () => {
    const { wrapper, open } = setup()
    const burger = wrapper.get('.j-burger')
    expect(burger.attributes('aria-controls')).toBe(wrapper.get('.j-navbar__menu').attributes('id'))
    await burger.trigger('click')
    await settle()
    expect(open.value).toBe(true)
    expect(document.activeElement?.textContent).toBe('Docs')
    expect(wrapper.find('.j-navbar__menu-footer #signin').exists()).toBe(true)
  })

  it('closes on Escape and returns focus to the burger', async () => {
    const { wrapper, open } = setup()
    await wrapper.get('.j-burger').trigger('click')
    await settle()
    key(document.activeElement!, 'Escape')
    await settle()
    expect(open.value).toBe(false)
    expect(document.activeElement).toBe(wrapper.get('.j-burger').element)
  })

  it('closes when a link in the menu is chosen', async () => {
    const { wrapper, open } = setup()
    await wrapper.get('.j-burger').trigger('click')
    await settle()
    await wrapper.findAll('.j-navbar__menu .j-navbar-link')[1]!.trigger('click')
    expect(open.value).toBe(false)
  })

  it('closes when pressing outside', async () => {
    const { wrapper, open } = setup()
    await wrapper.get('.j-burger').trigger('click')
    await settle()
    document.getElementById('outside')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await settle()
    expect(open.value).toBe(false)
  })

  it('never shows a burger with collapse="never"', () => {
    const wrapper = mount(JNavbar, { props: { collapse: 'never' }, slots: { default: () => h(JNavbarLink, () => 'Docs') } })
    expect(wrapper.find('.j-burger').exists()).toBe(false)
  })
})

describe('JFooter', () => {
  it('renders brand, labelled columns and a bottom line', () => {
    const wrapper = mount(JFooter, {
      slots: {
        brand: () => h('span', 'Brand'),
        default: () => h(JFooterColumn, { title: 'Product' }, () => [h('a', { href: '/a' }, 'Pricing')]),
        bottom: () => h('span', '© 2026'),
      },
    })
    expect(wrapper.element.tagName).toBe('FOOTER')
    const column = wrapper.get('.j-footer-column')
    expect(column.element.tagName).toBe('NAV')
    expect(wrapper.get(`#${column.attributes('aria-labelledby')}`).text()).toBe('Product')
    expect(wrapper.find('.j-footer__bottom').text()).toBe('© 2026')
  })
})

describe('JSidebar', () => {
  function setup() {
    return mount(JSidebar, {
      attachTo: document.body,
      props: { label: 'Workspace' },
      slots: {
        default: () => h(JSidebarGroup, { title: 'Projects' }, () => [
          h(JSidebarItem, { href: '/a', active: true }, { default: () => 'Website', trailing: () => '3' }),
          h(JSidebarItem, { href: '/b', disabled: true }, () => 'Archive'),
        ]),
        footer: () => h(JSidebarItem, { href: '/settings' }, () => 'Settings'),
      },
    })
  }

  it('is a labelled nav with items, active state and a footer', () => {
    const wrapper = setup()
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Workspace')
    const active = wrapper.get('.j-sidebar-item.is-active')
    expect(active.attributes('aria-current')).toBe('page')
    expect(active.find('.j-sidebar-item__trailing').text()).toBe('3')
    const disabled = wrapper.findAll('.j-sidebar-item')[1]!
    expect(disabled.attributes('aria-disabled')).toBe('true')
    expect(disabled.attributes('tabindex')).toBe('-1')
    expect(wrapper.find('.j-sidebar__footer .j-sidebar-item').exists()).toBe(true)
  })

  it('collapses a group and makes its items inert', async () => {
    const wrapper = setup()
    const toggle = wrapper.get('.j-sidebar-group__toggle')
    const panel = wrapper.get(`#${toggle.attributes('aria-controls')}`)
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(panel.attributes('aria-labelledby')).toBe(toggle.attributes('id'))
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(panel.attributes('inert')).toBeDefined()
  })

  it('renders a static title when not collapsible', () => {
    const wrapper = mount(JSidebarGroup, { props: { title: 'Help', collapsible: false } })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('.j-sidebar-group__title').text()).toBe('Help')
  })
})
