<script setup lang="ts">
import type { Component } from 'vue'

export interface NavbarLinkProps {
  /** Marks the current page: styled and announced with `aria-current="page"`. */
  active?: boolean
  /** Render as another element or component, e.g. `NuxtLink` or `RouterLink`. */
  as?: string | Component
}

withDefaults(defineProps<NavbarLinkProps>(), { as: 'a' })

defineSlots<{ default?: () => unknown, leading?: () => unknown }>()
</script>

<template>
  <component
    :is="as"
    class="j-navbar-link j-focusable"
    :class="{ 'is-active': active }"
    :aria-current="active ? 'page' : undefined"
  >
    <span v-if="$slots.leading" class="j-navbar-link__icon"><slot name="leading" /></span>
    <slot />
  </component>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-navbar-link {
  display: inline-flex;
  align-items: center;
  gap: var(--juxt-space-1-5);
  height: var(--juxt-control-sm);
  padding: 0 var(--juxt-space-2-5);
  border-radius: var(--juxt-radius-sm);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition-property: color, background-color, outline-color, outline-offset;
}

.j-navbar-link:hover {
  color: var(--juxt-fg);
}

.j-navbar-link.is-active {
  color: var(--juxt-fg);
}

/* In the mobile menu the current page gets a quiet fill, like a selected row. */
.j-navbar__menu .j-navbar-link.is-active {
  background: var(--juxt-surface-hover);
}

.j-navbar-link__icon {
  display: inline-flex;
  color: var(--juxt-fg-muted);
}

.j-navbar-link__icon > svg {
  width: 1rem;
  height: 1rem;
}
}
</style>
