<script setup lang="ts">
export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'destructive' | 'accent'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  /**
   * Status style: plain text led by a small square marker, no fill.
   * Reads as a state rather than a label.
   */
  dot?: boolean
}

withDefaults(defineProps<BadgeProps>(), { variant: 'neutral', size: 'md' })

defineSlots<{ default?: () => unknown, leading?: () => unknown }>()
</script>

<template>
  <span class="j-badge" :class="[`j-badge--${variant}`, `j-badge--${size}`, { 'j-badge--status': dot }]">
    <span v-if="dot" class="j-badge__marker" aria-hidden="true" />
    <span v-else-if="$slots.leading" class="j-badge__icon"><slot name="leading" /></span>
    <slot />
  </span>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
/*
 * Badges are small, square-shouldered labels | closer to a stamp than a pill.
 * No borders: a quiet tint and the text colour carry the meaning.
 */
.j-badge {
  --j-badge-fg: var(--juxt-fg-secondary);
  --j-badge-bg: var(--juxt-surface-active);
  --j-badge-marker: var(--juxt-fg-muted);

  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.375rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: var(--juxt-radius-xs);
  background: var(--j-badge-bg);
  color: var(--j-badge-fg);
  font-family: var(--juxt-font-sans);
  font-size: var(--juxt-text-xs);
  font-weight: var(--juxt-weight-medium);
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.j-badge--sm {
  gap: 0.3125rem;
  height: 1.0625rem;
  padding: 0 0.3125rem;
  font-size: var(--juxt-text-2xs);
}

.j-badge--success {
  --j-badge-fg: var(--juxt-success-text);
  --j-badge-bg: var(--juxt-success-soft);
  --j-badge-marker: var(--juxt-success);
}

.j-badge--warning {
  --j-badge-fg: var(--juxt-warning-text);
  --j-badge-bg: var(--juxt-warning-soft);
  --j-badge-marker: var(--juxt-warning);
}

.j-badge--destructive {
  --j-badge-fg: var(--juxt-danger-text);
  --j-badge-bg: var(--juxt-danger-soft);
  --j-badge-marker: var(--juxt-danger);
}

/* Accent is the only solid badge | reserve it for the thing that matters. */
.j-badge--accent {
  --j-badge-fg: var(--juxt-accent-fg);
  --j-badge-bg: var(--juxt-accent-strong);
  --j-badge-marker: var(--juxt-accent);
}

/* Status: text first, colour only in the marker. */
.j-badge--status {
  padding: 0;
  background: none;
  color: var(--juxt-fg-secondary);
}

.j-badge__marker {
  flex: none;
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 1.5px;
  background: var(--j-badge-marker);
}

.j-badge--sm .j-badge__marker {
  width: 0.375rem;
  height: 0.375rem;
}

.j-badge__icon {
  display: inline-flex;
  margin-left: -0.0625rem;
}

.j-badge__icon > svg {
  width: 0.75rem;
  height: 0.75rem;
}
}
</style>
