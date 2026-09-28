<script setup lang="ts">
import type { Component } from 'vue'
import { inject, ref } from 'vue'
import { IconCheck } from '../../icons'
import { focusElement } from '../../utils/dom'
import { MENU_LEVEL, MENU_ROOT } from './context'

export interface DropdownMenuItemProps {
  disabled?: boolean
  /** Styles the item as a destructive action. */
  destructive?: boolean
  /** A keyboard shortcut to display, e.g. `⌘D`. Display only. */
  shortcut?: string
  /** Render as another element, e.g. `a` or `NuxtLink` for navigation items. */
  as?: string | Component
  /**
   * Makes the item one choice in a set (e.g. a theme picker). `true` shows a
   * check at the end of the row. Leave undefined for a plain action.
   */
  checked?: boolean
}

const props = withDefaults(defineProps<DropdownMenuItemProps>(), { as: 'div', checked: undefined })

const emit = defineEmits<{
  /** Fired when the item is chosen. Call `event.preventDefault()` to keep the menu open. */
  select: [event: Event]
}>()

defineSlots<{ default?: () => unknown, leading?: () => unknown }>()

const root = inject(MENU_ROOT)!
const level = inject(MENU_LEVEL)!
const el = ref<HTMLElement | null>(null)

function onClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  const selectEvent = new Event('select', { cancelable: true })
  emit('select', selectEvent)
  if (!selectEvent.defaultPrevented) root.close(true)
}

function resolve(target: unknown): HTMLElement | null {
  const value = target as { $el?: HTMLElement } | HTMLElement | null
  return value instanceof HTMLElement ? value : (value?.$el ?? null)
}

// Hover moves real focus, so pointer and keyboard always agree on one item.
function onPointerMove() {
  level.scheduleSubClose()
  const node = resolve(el.value)
  if (props.disabled || !node || document.activeElement === node) return
  focusElement(node)
}

function onPointerLeave() {
  const node = resolve(el.value)
  if (node && document.activeElement === node) focusElement(level.content.value)
}
</script>

<template>
  <component
    :is="as"
    ref="el"
    :role="checked === undefined ? 'menuitem' : 'menuitemradio'"
    :aria-checked="checked === undefined ? undefined : checked"
    tabindex="-1"
    class="j-menu__item"
    :class="{ 'j-menu__item--destructive': destructive }"
    :aria-disabled="disabled || undefined"
    @click="onClick"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <span v-if="$slots.leading" class="j-menu__icon"><slot name="leading" /></span>
    <span class="j-menu__text"><slot /></span>
    <span v-if="shortcut" class="j-menu__shortcut">{{ shortcut }}</span>
    <IconCheck v-if="checked !== undefined" class="j-menu__check" :class="{ 'is-checked': checked }" />
  </component>
</template>
