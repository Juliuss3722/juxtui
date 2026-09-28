<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { formatHotkey } from '../../composables/useHotkey'

export interface KbdProps {
  /**
   * A shortcut in hotkey syntax, e.g. `mod+k` or `shift+enter`. `mod` renders
   * as ⌘ on Apple platforms and Ctrl elsewhere. Use the slot for literal keys.
   */
  keys?: string
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<KbdProps>(), { size: 'md' })

defineSlots<{ default?: () => unknown }>()

// Platform glyphs are only known in the browser; resolve after mount so
// server and client render the same markup.
const mounted = ref(false)
onMounted(() => (mounted.value = true))

const parts = computed(() => {
  if (!props.keys) return []
  if (!mounted.value) return props.keys.split('+').map(part => (part === 'mod' ? 'Ctrl' : part.length === 1 ? part.toUpperCase() : part))
  return formatHotkey(props.keys)
})
</script>

<template>
  <span v-if="keys" class="j-kbd-group" :class="`j-kbd-group--${size}`">
    <kbd v-for="(part, i) in parts" :key="i" class="j-kbd">{{ part }}</kbd>
  </span>
  <kbd v-else class="j-kbd" :class="{ 'j-kbd--sm': size === 'sm' }"><slot /></kbd>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-kbd-group {
  display: inline-flex;
  gap: 3px;
  vertical-align: middle;
}

.j-kbd-group--sm .j-kbd,
.j-kbd--sm {
  min-width: 1.0625rem;
  height: 1.0625rem;
  font-size: 0.625rem;
}
}
</style>
