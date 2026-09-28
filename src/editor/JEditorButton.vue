<script setup lang="ts">
/** Internal: a toolbar / bubble-menu button with a tooltip that shows its shortcut. */
import JKbd from '../components/kbd/JKbd.vue'
import JTooltip from '../components/tooltip/JTooltip.vue'

defineProps<{
  label: string
  /** Hotkey syntax, e.g. `mod+b`. */
  shortcut?: string
  /** Toggle state; renders `aria-pressed`. Leave undefined for plain actions. */
  active?: boolean
  disabled?: boolean
  side?: 'top' | 'bottom'
}>()

const emit = defineEmits<{ click: [event: MouseEvent] }>()

defineSlots<{ default?: () => unknown }>()
</script>

<template>
  <JTooltip :side="side ?? 'top'" :delay="500" :disabled="disabled">
    <button
      type="button"
      class="j-editor-button j-focusable"
      :class="{ 'is-active': active }"
      :aria-label="label"
      :aria-pressed="active === undefined ? undefined : active"
      :disabled="disabled"
      data-editor-control
      @pointerdown.prevent
      @click="emit('click', $event)"
    >
      <slot />
    </button>
    <template #content>
      {{ label }}<JKbd v-if="shortcut" :keys="shortcut" size="sm" class="j-editor-button__keys" />
    </template>
  </JTooltip>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-editor-button {
  display: inline-grid;
  flex: none;
  place-items: center;
  width: var(--juxt-control-sm);
  height: var(--juxt-control-sm);
  padding: 0;
  border: 0;
  border-radius: var(--juxt-radius-sm);
  background: transparent;
  color: var(--juxt-fg-secondary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition-property: background-color, color, outline-color, outline-offset, transform;
}

.j-editor-button > svg {
  width: 1rem;
  height: 1rem;
}

.j-editor-button:hover:not(:disabled) {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
}

.j-editor-button:active:not(:disabled) {
  transform: scale(0.94);
  transition-duration: var(--juxt-duration-instant);
}

.j-editor-button.is-active {
  background: var(--juxt-surface-active);
  color: var(--juxt-fg);
}

.j-editor-button:disabled {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-editor-button__keys {
  margin-left: var(--juxt-space-1-5);
}

@media (prefers-reduced-motion: reduce) {
  .j-editor-button:active:not(:disabled) {
    transform: none;
  }
}
}
</style>
