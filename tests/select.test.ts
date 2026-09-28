import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import JSelect from '../src/components/select/JSelect.vue'
import { byRole, key, settle } from './utils'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
]

function setup(props: Record<string, unknown> = {}) {
  const wrapper = mount(JSelect, {
    attachTo: document.body,
    props: {
      'label': 'Fruit',
      options,
      'modelValue': null,
      'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value as string }),
      ...props,
    },
  })
  const trigger = wrapper.get('[role="combobox"]')
  return { wrapper, trigger }
}

describe('JSelect', () => {
  it('renders a combobox with a placeholder', () => {
    const { trigger } = setup({ placeholder: 'Pick one' })
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.text()).toBe('Pick one')
  })

  it('shows the selected label', () => {
    const { trigger } = setup({ modelValue: 'cherry' })
    expect(trigger.text()).toBe('Cherry')
  })

  it('accepts plain string options', () => {
    const { trigger } = setup({ options: ['One', 'Two'], modelValue: 'Two' })
    expect(trigger.text()).toBe('Two')
  })

  it('opens on click and selects with the mouse', async () => {
    const { wrapper, trigger } = setup()
    await trigger.trigger('click')
    await settle()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const listbox = document.querySelector('[role="listbox"]')!
    expect(listbox).not.toBeNull()
    byRole('option', listbox)[2]!.click()
    await settle()
    expect(wrapper.props('modelValue')).toBe('cherry')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('navigates with the keyboard, skipping disabled options', async () => {
    const { wrapper, trigger } = setup()
    key(trigger.element, 'ArrowDown')
    await settle()
    const optionEls = byRole('option')
    expect(trigger.attributes('aria-activedescendant')).toBe(optionEls[0]!.id)
    key(trigger.element, 'ArrowDown')
    await settle()
    // Banana is disabled, so the next stop is Cherry.
    expect(trigger.attributes('aria-activedescendant')).toBe(optionEls[2]!.id)
    key(trigger.element, 'End')
    await settle()
    expect(trigger.attributes('aria-activedescendant')).toBe(optionEls[3]!.id)
    key(trigger.element, 'Enter')
    await settle()
    expect(wrapper.props('modelValue')).toBe('date')
  })

  it('marks the selected option', async () => {
    const { trigger } = setup({ modelValue: 'apple' })
    await trigger.trigger('click')
    await settle()
    const [first] = byRole('option')
    expect(first!.getAttribute('aria-selected')).toBe('true')
    expect(byRole('option')[1]!.getAttribute('aria-disabled')).toBe('true')
  })

  it('closes on Escape without changing the value', async () => {
    const { wrapper, trigger } = setup({ modelValue: 'apple' })
    key(trigger.element, 'ArrowDown')
    await settle()
    key(trigger.element, 'ArrowDown')
    await settle()
    key(document, 'Escape')
    await settle()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.props('modelValue')).toBe('apple')
  })

  it('jumps with typeahead', async () => {
    const { trigger } = setup()
    key(trigger.element, 'ArrowDown')
    await settle()
    key(trigger.element, 'd')
    await settle()
    expect(trigger.attributes('aria-activedescendant')).toBe(byRole('option')[3]!.id)
  })

  it('does not open when disabled', async () => {
    const { trigger } = setup({ disabled: true })
    await trigger.trigger('click')
    key(trigger.element, 'ArrowDown')
    await settle()
    expect(document.querySelector('[role="listbox"]')).toBeNull()
    expect(trigger.attributes('disabled')).toBeDefined()
  })

  it('submits via a hidden input when named', () => {
    const { wrapper } = setup({ name: 'fruit', modelValue: 'date' })
    expect(wrapper.get('input[type="hidden"]').attributes('value')).toBe('date')
  })

  it('shows errors', () => {
    const { trigger, wrapper } = setup({ error: 'Pick a fruit' })
    expect(trigger.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('.j-field__error').text()).toBe('Pick a fruit')
  })
})
