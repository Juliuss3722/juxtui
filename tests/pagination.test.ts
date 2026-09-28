import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JPagination from '../src/components/pagination/JPagination.vue'

describe('JPagination', () => {
  it('renders all pages when the total fits', () => {
    const wrapper = mount(JPagination, { props: { total: 5, modelValue: 1 } })
    expect(wrapper.findAll('.j-pagination__page')).toHaveLength(5)
    expect(wrapper.find('.j-pagination__ellipsis').exists()).toBe(false)
  })

  it('collapses large ranges with an ellipsis', () => {
    const wrapper = mount(JPagination, { props: { total: 50, modelValue: 25 } })
    expect(wrapper.findAll('.j-pagination__ellipsis').length).toBeGreaterThan(0)
    const current = wrapper.get('[aria-current="page"]')
    expect(current.text()).toBe('25')
  })

  it('updates v-model when a page is clicked', async () => {
    const wrapper = mount(JPagination, {
      props: { 'total': 5, 'modelValue': 1, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as number }) },
    })
    const pages = wrapper.findAll('.j-pagination__page')
    await pages[2]!.trigger('click')
    expect(wrapper.props('modelValue')).toBe(3)
  })

  it('disables prev on the first page and next on the last', async () => {
    const wrapper = mount(JPagination, { props: { total: 3, modelValue: 1 } })
    const [prev, next] = wrapper.findAll('.j-pagination__nav')
    expect(prev!.attributes('disabled')).toBeDefined()
    expect(next!.attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ modelValue: 3 })
    expect(wrapper.findAll('.j-pagination__nav')[1]!.attributes('disabled')).toBeDefined()
  })

  it('advances with next and back with prev', async () => {
    const wrapper = mount(JPagination, {
      props: { 'total': 5, 'modelValue': 2, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as number }) },
    })
    const [prev, next] = wrapper.findAll('.j-pagination__nav')
    await next!.trigger('click')
    expect(wrapper.props('modelValue')).toBe(3)
    await prev!.trigger('click')
    expect(wrapper.props('modelValue')).toBe(2)
  })

  it('does nothing when disabled', async () => {
    const wrapper = mount(JPagination, {
      props: { 'total': 5, 'modelValue': 1, 'disabled': true, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as number }) },
    })
    await wrapper.findAll('.j-pagination__page')[2]!.trigger('click')
    expect(wrapper.props('modelValue')).toBe(1)
  })
})
