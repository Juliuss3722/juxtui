<script setup lang="ts">
import { computed, provide } from 'vue'
import { focusElement } from '../../utils/dom'
import { TOGGLE_GROUP } from './context'

export interface ToggleGroupProps {
  /** `single` keeps at most one item pressed; `multiple` lets any number stay pressed. */
  type?: 'single' | 'multiple'
  size?: 'sm' | 'md'
  disabled?: boolean
  /** Accessible name for the group. */
  label?: string
}

const props = withDefaults(defineProps<ToggleGroupProps>(), {
  type: 'single',
  size: 'md',
})

/** The pressed value in `single` mode, or an array of values in `multiple` mode. */
const model = defineModel<string | string[] | null>({ default: null })

defineSlots<{ default?: () => unknown }>()

provide(TOGGLE_GROUP, {
  type: computed(() => props.type),
  disabled: computed(() => !!props.disabled),
  isSelected: (value) => {
    if (props.type === 'multiple') return Array.isArray(model.value) && model.value.includes(value)
    return model.value === value
  },
  toggle: (value) => {
    if (props.disabled) return
    if (props.type === 'multiple') {
      const current = Array.isArray(model.value) ? model.value : []
      model.value = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
      return
    }
    model.value = value
  },
})

// Arrow keys move between items, per the WAI-ARIA toolbar pattern.
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (!target.classList.contains('j-toggle-group__item')) return
  const root = event.currentTarget as HTMLElement
  const items = Array.from(root.querySelectorAll<HTMLElement>('.j-toggle-group__item:not(:disabled)'))
  const index = items.indexOf(target)
  let next: HTMLElement | undefined
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = items[(index + 1) % items.length]
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = items[(index - 1 + items.length) % items.length]
  else if (event.key === 'Home') next = items[0]
  else if (event.key === 'End') next = items[items.length - 1]
  if (!next) return
  event.preventDefault()
  focusElement(next)
}
</script>

<template>
  <div
    class="j-toggle-group"
    :class="[`j-toggle-group--${size}`, { 'is-disabled': disabled }]"
    role="group"
    :aria-label="label"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-toggle-group {
  --j-toggle-height: var(--juxt-control-md);

  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: var(--juxt-radius-md);
  background: var(--juxt-surface-sunken);
  box-shadow: inset 0 0 0 1px var(--juxt-border-subtle);
  font-family: var(--juxt-font-sans);
}

.j-toggle-group--sm {
  --j-toggle-height: var(--juxt-control-sm);
}

.j-toggle-group.is-disabled {
  opacity: 0.6;
}
}
</style>
