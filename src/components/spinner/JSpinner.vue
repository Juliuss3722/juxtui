<script setup lang="ts">
import { computed } from 'vue'
import { Spinner } from '../../icons'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  /** Announced to screen readers. Set to an empty string when the context already says it. */
  label?: string
}

const props = withDefaults(defineProps<SpinnerProps>(), { size: 'md', label: 'Loading' })

const pixels = computed(() => ({ sm: 14, md: 16, lg: 20 })[props.size])
</script>

<template>
  <span class="j-spinner-wrap" :role="label ? 'status' : undefined">
    <Spinner :size="pixels" />
    <span v-if="label" class="j-sr-only">{{ label }}</span>
  </span>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-spinner-wrap {
  display: inline-flex;
  color: var(--juxt-fg-muted);
  vertical-align: middle;
}
}
</style>
