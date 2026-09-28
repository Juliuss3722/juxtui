import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JRating from '../src/components/rating/JRating.vue'

describe('JRating', () => {
  it('renders max stars as radio buttons', () => {
    const wrapper = mount(JRating, { props: { max: 5, modelValue: 0 } })
    expect(wrapper.findAll('.j-rating__button')).toHaveLength(5)
    expect(wrapper.attributes('role')).toBe('radiogroup')
  })

  it('selects a rating on click', async () => {
    const wrapper = mount(JRating, {
      props: { 'modelValue': 0, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as number }) },
    })
    await wrapper.findAll('.j-rating__button')[2]!.trigger('click')
    expect(wrapper.props('modelValue')).toBe(3)
  })

  it('is a static image in readonly mode', () => {
    const wrapper = mount(JRating, { props: { modelValue: 4, readonly: true } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.find('.j-rating__button').exists()).toBe(false)
    expect(wrapper.findAll('.j-rating__star')).toHaveLength(5)
  })

  it('does not change when disabled', async () => {
    const wrapper = mount(JRating, {
      props: { 'modelValue': 1, 'disabled': true, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as number }) },
    })
    await wrapper.findAll('.j-rating__button')[3]!.trigger('click')
    expect(wrapper.props('modelValue')).toBe(1)
  })

  it('supports arrow key adjustment', async () => {
    const wrapper = mount(JRating, {
      props: { 'modelValue': 2, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as number }) },
    })
    await wrapper.get('.j-rating__button').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.props('modelValue')).toBe(3)
  })
})
