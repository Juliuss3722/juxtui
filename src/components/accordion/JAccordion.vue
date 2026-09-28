<script setup lang="ts">
import { provide } from 'vue'
import { focusElement } from '../../utils/dom'
import { ACCORDION } from './context'

export interface AccordionProps {
  /** `single` keeps at most one item open; `multiple` lets any number stay open. */
  type?: 'single' | 'multiple'
  /** In `single` mode, allow closing the open item so none are open. */
  collapsible?: boolean
  /** Heading level wrapping each trigger, for a correct document outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(defineProps<AccordionProps>(), {
  type: 'single',
  collapsible: true,
  headingLevel: 3,
})

/** Open item(s): a value in `single` mode, an array in `multiple` mode. */
const model = defineModel<string | string[] | null>({ default: null })

defineSlots<{ default?: () => unknown }>()

function openValues(): string[] {
  const value = model.value
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

provide(ACCORDION, {
  isOpen: value => openValues().includes(value),
  toggle: (value) => {
    const current = openValues()
    const isOpen = current.includes(value)
    if (props.type === 'multiple') {
      model.value = isOpen ? current.filter(v => v !== value) : [...current, value]
      return
    }
    if (isOpen) {
      if (props.collapsible) model.value = null
      return
    }
    model.value = value
  },
  headingLevel: () => props.headingLevel,
})

// Arrow keys move between headers, per the WAI-ARIA accordion pattern.
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (!target.classList.contains('j-accordion__trigger')) return
  const root = event.currentTarget as HTMLElement
  const triggers = Array.from(root.querySelectorAll<HTMLElement>('.j-accordion__trigger:not(:disabled)'))
    .filter(el => el.closest('.j-accordion') === root)
  const index = triggers.indexOf(target)
  let next: HTMLElement | undefined
  if (event.key === 'ArrowDown') next = triggers[(index + 1) % triggers.length]
  else if (event.key === 'ArrowUp') next = triggers[(index - 1 + triggers.length) % triggers.length]
  else if (event.key === 'Home') next = triggers[0]
  else if (event.key === 'End') next = triggers[triggers.length - 1]
  if (!next) return
  event.preventDefault()
  focusElement(next)
}
</script>

<template>
  <div class="j-accordion" @keydown="onKeydown">
    <slot />
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-accordion {
  display: flex;
  flex-direction: column;
  font-family: var(--juxt-font-sans);
}
}
</style>
