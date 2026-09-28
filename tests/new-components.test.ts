import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import JAccordion from '../src/components/accordion/JAccordion.vue'
import JAccordionItem from '../src/components/accordion/JAccordionItem.vue'
import JAlert from '../src/components/alert/JAlert.vue'
import JKbd from '../src/components/kbd/JKbd.vue'
import JProgress from '../src/components/progress/JProgress.vue'
import JRadio from '../src/components/radio/JRadio.vue'
import JRadioGroup from '../src/components/radio/JRadioGroup.vue'
import JSeparator from '../src/components/separator/JSeparator.vue'
import JSkeleton from '../src/components/skeleton/JSkeleton.vue'
import JSpinner from '../src/components/spinner/JSpinner.vue'
import { key, settle } from './utils'

describe('JRadioGroup', () => {
  function setup(props: Record<string, unknown> = {}) {
    const value = ref<string | number | null>('pro')
    const Host = defineComponent({
      setup: () => () =>
        h(JRadioGroup, {
          'modelValue': value.value,
          'onUpdate:modelValue': (v: string | number | null) => (value.value = v),
          'label': 'Plan',
          ...props,
        }, () => [
          h(JRadio, { value: 'hobby', label: 'Hobby' }),
          h(JRadio, { value: 'pro', label: 'Pro', description: 'For teams' }),
          h(JRadio, { value: 'scale', label: 'Scale', disabled: true }),
        ]),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    return { wrapper, value }
  }

  it('is a fieldset with a legend and native radios sharing a name', () => {
    const { wrapper } = setup()
    expect(wrapper.find('fieldset legend').text()).toBe('Plan')
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
    const names = new Set(radios.map(r => r.attributes('name')))
    expect(names.size).toBe(1)
  })

  it('reflects and updates v-model', async () => {
    const { wrapper, value } = setup()
    const radios = wrapper.findAll('input[type="radio"]')
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(true)
    await radios[0]!.setValue(true)
    expect(value.value).toBe('hobby')
    await nextTick()
    expect(wrapper.findAll('.j-radio')[0]!.attributes('data-state')).toBe('checked')
  })

  it('links labels and descriptions', () => {
    const { wrapper } = setup()
    const pro = wrapper.findAll('.j-radio')[1]!
    const input = pro.get('input')
    expect(pro.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-describedby')).toBe(pro.get('.j-radio__description').attributes('id'))
  })

  it('disables single options and the whole group', () => {
    const { wrapper } = setup()
    expect(wrapper.findAll('input')[2]!.attributes('disabled')).toBeDefined()
    const disabled = setup({ disabled: true })
    expect(disabled.wrapper.find('fieldset').attributes('disabled')).toBeDefined()
    expect(disabled.wrapper.findAll('input').every(i => i.attributes('disabled') !== undefined)).toBe(true)
  })

  it('shows errors', () => {
    const { wrapper } = setup({ error: 'Pick a plan' })
    expect(wrapper.find('fieldset').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('.j-radio-group__error').text()).toBe('Pick a plan')
  })
})

describe('JAccordion', () => {
  function setup(props: Record<string, unknown> = {}, initial: string | string[] | null = null) {
    const value = ref<string | string[] | null>(initial)
    const Host = defineComponent({
      setup: () => () =>
        h(JAccordion, {
          'modelValue': value.value,
          'onUpdate:modelValue': (v: string | string[] | null) => (value.value = v),
          ...props,
        }, () => [
          h(JAccordionItem, { value: 'a', title: 'First' }, () => 'One'),
          h(JAccordionItem, { value: 'b', title: 'Second' }, () => 'Two'),
          h(JAccordionItem, { value: 'c', title: 'Third', disabled: true }, () => 'Three'),
        ]),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    return { wrapper, value }
  }

  it('wires buttons to regions', () => {
    const { wrapper } = setup()
    const trigger = wrapper.findAll('.j-accordion__trigger')[0]!
    const panel = wrapper.get(`#${trigger.attributes('aria-controls')}`)
    expect(panel.attributes('role')).toBe('region')
    expect(panel.attributes('aria-labelledby')).toBe(trigger.attributes('id'))
    expect(trigger.element.parentElement!.tagName).toBe('H3')
  })

  it('opens one item at a time in single mode', async () => {
    const { wrapper, value } = setup()
    const triggers = wrapper.findAll('.j-accordion__trigger')
    await triggers[0]!.trigger('click')
    expect(value.value).toBe('a')
    await triggers[1]!.trigger('click')
    expect(value.value).toBe('b')
    expect(triggers[0]!.attributes('aria-expanded')).toBe('false')
    expect(triggers[1]!.attributes('aria-expanded')).toBe('true')
  })

  it('collapses the open item unless collapsible is off', async () => {
    const collapsible = setup({}, 'a')
    await collapsible.wrapper.findAll('.j-accordion__trigger')[0]!.trigger('click')
    expect(collapsible.value.value).toBeNull()

    const fixed = setup({ collapsible: false }, 'a')
    await fixed.wrapper.findAll('.j-accordion__trigger')[0]!.trigger('click')
    expect(fixed.value.value).toBe('a')
  })

  it('opens several items in multiple mode', async () => {
    const { wrapper, value } = setup({ type: 'multiple' }, [])
    const triggers = wrapper.findAll('.j-accordion__trigger')
    await triggers[0]!.trigger('click')
    await triggers[1]!.trigger('click')
    expect(value.value).toEqual(['a', 'b'])
    await triggers[0]!.trigger('click')
    expect(value.value).toEqual(['b'])
  })

  it('makes closed panels inert', async () => {
    const { wrapper } = setup({}, 'b')
    const panels = wrapper.findAll('.j-accordion__panel')
    expect(panels[0]!.attributes('inert')).toBeDefined()
    expect(panels[1]!.attributes('inert')).toBeUndefined()
  })

  it('moves between headers with arrow keys, skipping disabled', async () => {
    const { wrapper } = setup()
    const triggers = wrapper.findAll('.j-accordion__trigger').map(t => t.element as HTMLElement)
    triggers[0]!.focus()
    key(triggers[0]!, 'ArrowDown')
    expect(document.activeElement).toBe(triggers[1])
    key(triggers[1]!, 'ArrowDown')
    expect(document.activeElement).toBe(triggers[0])
    key(triggers[0]!, 'End')
    expect(document.activeElement).toBe(triggers[1])
    await settle()
  })
})

describe('JAlert', () => {
  it.each(['neutral', 'info', 'success', 'warning', 'destructive'] as const)('renders the %s variant', (variant) => {
    const wrapper = mount(JAlert, { props: { variant, title: 'Heads up', description: 'Details' } })
    expect(wrapper.classes()).toContain(`j-alert--${variant}`)
    expect(wrapper.find('.j-alert__title').text()).toBe('Heads up')
    expect(wrapper.find('.j-alert__icon svg').exists()).toBe(true)
  })

  it('emits dismiss', async () => {
    const wrapper = mount(JAlert, { props: { title: 'x', dismissible: true } })
    await wrapper.get('button[aria-label="Dismiss"]').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('renders actions and can hide the icon', () => {
    const wrapper = mount(JAlert, { props: { hideIcon: true }, slots: { actions: () => h('button', 'Retry') } })
    expect(wrapper.find('.j-alert__icon').exists()).toBe(false)
    expect(wrapper.find('.j-alert__actions button').text()).toBe('Retry')
  })
})

describe('JProgress', () => {
  it('exposes a progressbar with values', () => {
    const wrapper = mount(JProgress, { props: { value: 30, max: 60, label: 'Upload', showValue: true } })
    const bar = wrapper.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('30')
    expect(bar.attributes('aria-valuemax')).toBe('60')
    expect(bar.attributes('aria-valuetext')).toBe('50%')
    expect(wrapper.get('.j-progress__value').text()).toBe('50%')
    expect(wrapper.get('.j-progress__fill').attributes('style')).toContain('scaleX(0.5)')
    expect(bar.attributes('aria-labelledby')).toBe(wrapper.get('.j-progress__label').attributes('id'))
  })

  it('is indeterminate without a value', () => {
    const wrapper = mount(JProgress)
    expect(wrapper.classes()).toContain('is-indeterminate')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBeUndefined()
  })

  it('clamps out-of-range values', () => {
    const wrapper = mount(JProgress, { props: { value: 150 } })
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuetext')).toBe('100%')
  })
})

describe('JSkeleton', () => {
  it('is hidden from assistive technology', () => {
    const wrapper = mount(JSkeleton)
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('renders text lines with a shorter last line', () => {
    const wrapper = mount(JSkeleton, { props: { shape: 'text', lines: 3 } })
    const lines = wrapper.findAll('.j-skeleton--text')
    expect(lines).toHaveLength(3)
    expect(lines[2]!.attributes('style')).toContain('62%')
  })

  it('accepts a circle shape and custom size', () => {
    const wrapper = mount(JSkeleton, { props: { shape: 'circle', width: '3rem', height: '3rem' } })
    expect(wrapper.classes()).toContain('j-skeleton--circle')
    expect(wrapper.attributes('style')).toContain('3rem')
  })
})

describe('JSpinner', () => {
  it('announces a status label', () => {
    const wrapper = mount(JSpinner, { props: { label: 'Saving' } })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.find('.j-sr-only').text()).toBe('Saving')
  })

  it('can be silent', () => {
    const wrapper = mount(JSpinner, { props: { label: '' } })
    expect(wrapper.attributes('role')).toBeUndefined()
  })
})

describe('JKbd', () => {
  it('formats shortcuts after mount', async () => {
    const wrapper = mount(JKbd, { props: { keys: 'shift+enter' } })
    await nextTick()
    expect(wrapper.findAll('kbd').map(k => k.text())).toEqual(['Shift', 'Enter'])
  })

  it('renders literal keys from the slot', () => {
    const wrapper = mount(JKbd, { slots: { default: 'Esc' } })
    expect(wrapper.element.tagName).toBe('KBD')
    expect(wrapper.text()).toBe('Esc')
  })
})

describe('JSeparator', () => {
  it('is decorative by default', () => {
    const wrapper = mount(JSeparator)
    expect(wrapper.attributes('role')).toBe('none')
  })

  it('announces orientation when meaningful', () => {
    const wrapper = mount(JSeparator, { props: { decorative: false, orientation: 'vertical' } })
    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  })

  it('renders a label', () => {
    const wrapper = mount(JSeparator, { props: { label: 'or' } })
    expect(wrapper.find('.j-separator__label').text()).toBe('or')
  })
})
