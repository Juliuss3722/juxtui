<script setup lang="ts">
import type { Component } from 'vue'

export interface SidebarItemProps {
  /** Marks the current page: styled and announced with `aria-current="page"`. */
  active?: boolean
  disabled?: boolean
  /** Render as another element or component, e.g. `NuxtLink`. */
  as?: string | Component
}

withDefaults(defineProps<SidebarItemProps>(), { as: 'a' })

defineSlots<{
  default?: () => unknown
  /** Icon before the label. */
  leading?: () => unknown
  /** After the label: a count, badge or shortcut. */
  trailing?: () => unknown
}>()
</script>

<template>
  <component
    :is="as"
    class="j-sidebar-item j-focusable"
    :class="{ 'is-active': active, 'is-disabled': disabled }"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
  >
    <span v-if="$slots.leading" class="j-sidebar-item__icon"><slot name="leading" /></span>
    <span class="j-sidebar-item__label"><slot /></span>
    <span v-if="$slots.trailing" class="j-sidebar-item__trailing"><slot name="trailing" /></span>
  </component>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--juxt-space-2);
  min-height: var(--juxt-control-sm);
  padding: 0 var(--juxt-space-2);
  border-radius: var(--juxt-radius-sm);
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-sm);
  letter-spacing: var(--juxt-tracking-tight);
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition-property: color, background-color, outline-color, outline-offset;
}

.j-sidebar-item:hover:not(.is-disabled) {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
}

.j-sidebar-item.is-active {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
  font-weight: var(--juxt-weight-medium);
}

/* Same marker as the command palette: a short accent line where you are. */
.j-sidebar-item.is-active::before {
  content: '';
  position: absolute;
  top: 0.4375rem;
  bottom: 0.4375rem;
  left: 0;
  width: 2px;
  border-radius: 0 2px 2px 0;
  background: var(--juxt-accent);
}

.j-sidebar-item.is-disabled {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-sidebar-item__icon {
  display: inline-flex;
  flex: none;
  color: var(--juxt-fg-muted);
}

.j-sidebar-item.is-active .j-sidebar-item__icon,
.j-sidebar-item:hover:not(.is-disabled) .j-sidebar-item__icon {
  color: var(--juxt-fg);
}

.j-sidebar-item__icon > svg {
  width: 1rem;
  height: 1rem;
}

.j-sidebar-item__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.j-sidebar-item__trailing {
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  font-variant-numeric: tabular-nums;
}
}
</style>
