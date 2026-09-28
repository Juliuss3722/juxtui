import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import JToggleGroup from '../src/components/toggle-group/JToggleGroup.vue'
import JToggleGroupItem from '../src/components/toggle-group/JToggleGroupItem.vue'
import { key } from './utils'

describe('JToggleGroup', () => {
  function setup(props: Record<string, unknown>, initial: string | string[] | null) {
    const value = ref(initial)
    const Host = defineComponent({
      setup: () => () =>
        h(JToggleGroup, {
          'modelValue': value.value,
          'onUpdate:modelValue': (v: string | string[] | null) => (value.value = v),
          ...props,
        }, () => [
          h(JToggleGroupItem, { value: 'left' }, () => 'Left'),
          h(JToggleGroupItem, { value: 'center' }, () => 'Center'),
          h(JToggleGroupItem, { value: 'right' }, () => 'Right'),
        ]),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    return { wrapper, value }
  }

  it('selects a single value and reflects aria-pressed', async () => {
    const { wrapper, value } = setup({ type: 'single' }, 'left')
    const items = wrapper.findAll('.j-toggle-group__item')
    expect(items[0]!.attributes('aria-pressed')).toBe('true')
    await items[1]!.trigger('click')
    expect(value.value).toBe('center')
    expect(items[0]!.attributes('aria-pressed')).toBe('false')
  })

  it('toggles multiple values independently', async () => {
    const { wrapper, value } = setup({ type: 'multiple' }, [])
    const items = wrapper.findAll('.j-toggle-group__item')
    await items[0]!.trigger('click')
    await items[2]!.trigger('click')
    expect(value.value).toEqual(['left', 'right'])
    await items[0]!.trigger('click')
    expect(value.value).toEqual(['right'])
  })

  it('respects group and item disabled state', async () => {
    const { wrapper, value } = setup({ disabled: true }, null)
    await wrapper.findAll('.j-toggle-group__item')[0]!.trigger('click')
    expect(value.value).toBeNull()
  })

  it('moves focus between items with arrow keys', () => {
    const { wrapper } = setup({}, 'left')
    const items = wrapper.findAll('.j-toggle-group__item').map(w => w.element as HTMLElement)
    items[0]!.focus()
    key(items[0]!, 'ArrowRight')
    expect(document.activeElement).toBe(items[1])
    key(items[1]!, 'ArrowRight')
    expect(document.activeElement).toBe(items[2])
    key(items[2]!, 'ArrowRight')
    expect(document.activeElement).toBe(items[0])
  })
})
