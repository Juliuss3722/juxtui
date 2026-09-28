import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JSlider from '../src/components/slider/JSlider.vue'

describe('JSlider', () => {
  it('renders one thumb for a single value', () => {
    const wrapper = mount(JSlider, { props: { modelValue: 40, min: 0, max: 100 } })
    const thumbs = wrapper.findAll('.j-slider__thumb')
    expect(thumbs).toHaveLength(1)
    expect(thumbs[0]!.attributes('aria-valuenow')).toBe('40')
  })

  it('renders two thumbs for a range value', () => {
    const wrapper = mount(JSlider, { props: { modelValue: [20, 60], min: 0, max: 100 } })
    expect(wrapper.findAll('.j-slider__thumb')).toHaveLength(2)
  })

  it('exposes min/max on each thumb', () => {
    const wrapper = mount(JSlider, { props: { modelValue: 10, min: 0, max: 50 } })
    const thumb = wrapper.get('.j-slider__thumb')
    expect(thumb.attributes('aria-valuemin')).toBe('0')
    expect(thumb.attributes('aria-valuemax')).toBe('50')
    expect(thumb.attributes('role')).toBe('slider')
  })

  it('steps with arrow keys', async () => {
    const wrapper = mount(JSlider, {
      props: { 'modelValue': 10, 'step': 5, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as number }) },
    })
    await wrapper.get('.j-slider__thumb').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.props('modelValue')).toBe(15)
    await wrapper.get('.j-slider__thumb').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.props('modelValue')).toBe(10)
  })

  it('jumps to min/max with Home and End', async () => {
    const wrapper = mount(JSlider, {
      props: { 'modelValue': 40, 'min': 0, 'max': 100, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as number }) },
    })
    await wrapper.get('.j-slider__thumb').trigger('keydown', { key: 'End' })
    expect(wrapper.props('modelValue')).toBe(100)
    await wrapper.get('.j-slider__thumb').trigger('keydown', { key: 'Home' })
    expect(wrapper.props('modelValue')).toBe(0)
  })

  it('keeps range thumbs from crossing', async () => {
    const wrapper = mount(JSlider, {
      props: { 'modelValue': [20, 30] as [number, number], 'step': 1, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as [number, number] }) },
    })
    const [low] = wrapper.findAll('.j-slider__thumb')
    for (let i = 0; i < 20; i++) await low!.trigger('keydown', { key: 'ArrowRight' })
    expect((wrapper.props('modelValue') as [number, number])[0]).toBeLessThanOrEqual(30)
  })

  it('ignores keyboard input when disabled', async () => {
    const wrapper = mount(JSlider, {
      props: { 'modelValue': 10, 'disabled': true, 'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as number }) },
    })
    await wrapper.get('.j-slider__thumb').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.props('modelValue')).toBe(10)
  })
})
