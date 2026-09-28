import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JAspectRatio from '../src/components/aspect-ratio/JAspectRatio.vue'

describe('JAspectRatio', () => {
  it('defaults to a 16/9 ratio', () => {
    const wrapper = mount(JAspectRatio)
    expect(wrapper.attributes('style')).toContain('--j-aspect-ratio')
  })

  it('applies a custom ratio', () => {
    const wrapper = mount(JAspectRatio, { props: { ratio: 1 } })
    expect(wrapper.attributes('style')).toContain('--j-aspect-ratio: 1')
  })

  it('constrains slotted content to the wrapper', () => {
    const wrapper = mount(JAspectRatio, { slots: { default: '<img src="/a.png" alt="" />' } })
    expect(wrapper.find('.j-aspect-ratio__content img').exists()).toBe(true)
  })
})
