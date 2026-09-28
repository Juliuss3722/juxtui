<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { IconX } from '../../icons'

export type TagVariant = 'neutral' | 'success' | 'warning' | 'destructive' | 'accent'

export interface TagProps {
  variant?: TagVariant
  size?: 'sm' | 'md'
  disabled?: boolean
  /** Accessible label for the remove button, e.g. `"Remove Engineering"`. Defaults to "Remove". */
  removeLabel?: string
}

const props = withDefaults(defineProps<TagProps>(), { variant: 'neutral', size: 'md' })

const emit = defineEmits<{ remove: [] }>()

defineSlots<{ default?: () => unknown, leading?: () => unknown }>()

const slots = useSlots()
// Falls back to the tag's own text so a list of tags without an explicit
// `removeLabel` each still announce a distinct name, not several "Remove"s.
const text = computed(() => slots.default?.().map(vnode => (typeof vnode.children === 'string' ? vnode.children : '')).join('').trim())
const removeButtonLabel = computed(() => props.removeLabel || (text.value ? `Remove ${text.value}` : 'Remove'))

function onRemove() {
  if (props.disabled) return
  emit('remove')
}
</script>

<template>
  <span class="j-tag" :class="[`j-tag--${variant}`, `j-tag--${size}`, { 'is-disabled': disabled }]">
    <span v-if="$slots.leading" class="j-tag__icon"><slot name="leading" /></span>
    <span class="j-tag__label"><slot /></span>
    <button type="button" class="j-tag__remove j-focusable" :aria-label="removeButtonLabel" :disabled="disabled" @click="onRemove">
      <IconX />
    </button>
  </span>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
/*
 * Tags are pills, not stamps | fully rounded and carrying their own remove
 * affordance, which is what sets them apart from the static JBadge.
 */
.j-tag {
  --j-tag-fg: var(--juxt-fg-secondary);
  --j-tag-bg: var(--juxt-surface-active);

  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.3125rem;
  height: 1.375rem;
  padding: 0 var(--juxt-space-1) 0 var(--juxt-space-2-5);
  border-radius: var(--juxt-radius-full);
  background: var(--j-tag-bg);
  color: var(--j-tag-fg);
  font-family: var(--juxt-font-sans);
  font-size: var(--juxt-text-xs);
  font-weight: var(--juxt-weight-medium);
  line-height: 1;
  white-space: nowrap;
}

.j-tag--sm {
  height: 1.125rem;
  padding: 0 0.1875rem 0 var(--juxt-space-2);
  font-size: var(--juxt-text-2xs);
}

.j-tag--success {
  --j-tag-fg: var(--juxt-success-text);
  --j-tag-bg: var(--juxt-success-soft);
}

.j-tag--warning {
  --j-tag-fg: var(--juxt-warning-text);
  --j-tag-bg: var(--juxt-warning-soft);
}

.j-tag--destructive {
  --j-tag-fg: var(--juxt-danger-text);
  --j-tag-bg: var(--juxt-danger-soft);
}

.j-tag--accent {
  --j-tag-fg: var(--juxt-accent-fg);
  --j-tag-bg: var(--juxt-accent-strong);
}

.j-tag__icon {
  display: inline-flex;
  margin-left: -0.0625rem;
}

.j-tag__icon > svg {
  width: 0.75rem;
  height: 0.75rem;
}

.j-tag__label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.j-tag__remove {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.125rem;
  height: 1.125rem;
  padding: 0;
  border: 0;
  border-radius: var(--juxt-radius-full);
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition:
    background-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    opacity var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-tag--sm .j-tag__remove {
  width: 0.875rem;
  height: 0.875rem;
}

.j-tag__remove:hover:not(:disabled) {
  background: rgb(0 0 0 / 0.08);
  opacity: 1;
}

.dark .j-tag__remove:hover:not(:disabled),
[data-theme='dark'] .j-tag__remove:hover:not(:disabled) {
  background: rgb(255 255 255 / 0.12);
}

.j-tag__remove > svg {
  width: 0.625rem;
  height: 0.625rem;
}

.j-tag--sm .j-tag__remove > svg {
  width: 0.5rem;
  height: 0.5rem;
}

.j-tag.is-disabled {
  opacity: 0.5;
}

.j-tag__remove:disabled {
  cursor: not-allowed;
}
}
</style>
