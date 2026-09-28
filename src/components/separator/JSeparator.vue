<script setup lang="ts">
export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  /** Text in the middle of a horizontal separator, e.g. "or". */
  label?: string
  /**
   * Purely visual (the default). Set to false when the separator divides
   * meaningful groups and should be announced.
   */
  decorative?: boolean
}

withDefaults(defineProps<SeparatorProps>(), { orientation: 'horizontal', decorative: true })

defineSlots<{ default?: () => unknown }>()
</script>

<template>
  <div
    class="j-separator"
    :class="[`j-separator--${orientation}`, { 'j-separator--labelled': label || $slots.default }]"
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="decorative ? undefined : orientation"
  >
    <span v-if="label || $slots.default" class="j-separator__label"><slot>{{ label }}</slot></span>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-separator {
  flex: none;
  background: var(--juxt-border-subtle);
}

.dark .j-separator,
[data-theme='dark'] .j-separator {
  background: var(--juxt-border);
}

.j-separator--horizontal {
  width: 100%;
  height: 1px;
}

.j-separator--vertical {
  align-self: stretch;
  width: 1px;
  min-height: 1rem;
}

.j-separator--labelled {
  display: flex;
  align-items: center;
  gap: var(--juxt-space-3);
  height: auto;
  background: none !important;
  color: var(--juxt-fg-muted);
  font-family: var(--juxt-font-sans);
  font-size: var(--juxt-text-xs);
}

.j-separator--labelled::before,
.j-separator--labelled::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--juxt-border-subtle);
}

.dark .j-separator--labelled::before,
.dark .j-separator--labelled::after,
[data-theme='dark'] .j-separator--labelled::before,
[data-theme='dark'] .j-separator--labelled::after {
  background: var(--juxt-border);
}

.j-separator__label {
  flex: none;
}
}
</style>
