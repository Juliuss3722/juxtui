<script setup lang="ts">
import type { Component } from 'vue'

export interface VisuallyHiddenProps {
  /** Render as another element or component, e.g. `label` or `h2`. */
  as?: string | Component
}

withDefaults(defineProps<VisuallyHiddenProps>(), { as: 'span' })

defineSlots<{ default?: () => unknown }>()
</script>

<template>
  <component :is="as" class="j-visually-hidden j-sr-only">
    <slot />
  </component>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
/*
 * Visual hiding is handled entirely by the shared `.j-sr-only` utility in
 * base.css | this component just gives it a typed, composable wrapper so it
 * can be used as `<JVisuallyHidden as="label">…</JVisuallyHidden>`.
 */
.j-visually-hidden {
  display: block;
}
}
</style>
