<script setup lang="ts">
import { computed, inject } from 'vue'
import { TOGGLE_GROUP } from './context'

export interface ToggleGroupItemProps {
  /** Identifies the item in the group's `v-model`. */
  value: string
  disabled?: boolean
  /** Accessible name, when the slot content isn't descriptive enough (e.g. an icon-only item). */
  label?: string
}

const props = defineProps<ToggleGroupItemProps>()

defineSlots<{ default?: () => unknown }>()

const group = inject(TOGGLE_GROUP)!
const selected = computed(() => group.isSelected(props.value))
const isDisabled = computed(() => props.disabled || group.disabled.value)
</script>

<template>
  <button
    type="button"
    class="j-toggle-group__item j-focusable"
    :class="{ 'is-selected': selected }"
    :aria-pressed="selected"
    :aria-label="label"
    :disabled="isDisabled"
    @click="group.toggle(value)"
  >
    <slot />
  </button>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-toggle-group__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--juxt-space-1-5);
  height: var(--j-toggle-height, var(--juxt-control-md));
  padding: 0 var(--juxt-space-3);
  border: 0;
  border-radius: var(--juxt-radius-sm);
  background: transparent;
  color: var(--juxt-fg-secondary);
  font: inherit;
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
  white-space: nowrap;
  cursor: pointer;
  outline: 2px solid transparent;
  outline-offset: 0;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    color var(--juxt-duration-fast) var(--juxt-ease-standard),
    box-shadow var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-toggle-group__item > svg {
  width: 1rem;
  height: 1rem;
}

.j-toggle-group__item:hover:not(:disabled) {
  color: var(--juxt-fg);
}

.j-toggle-group__item.is-selected {
  background: var(--juxt-surface);
  box-shadow: var(--juxt-shadow-sm);
  color: var(--juxt-fg);
}

.dark .j-toggle-group__item.is-selected,
[data-theme='dark'] .j-toggle-group__item.is-selected {
  background: var(--juxt-surface-active);
}

.j-toggle-group__item:disabled {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}
}
</style>
