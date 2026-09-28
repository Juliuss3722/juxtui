<script setup lang="ts">
import { computed } from 'vue'
import { IconArrowDownRight, IconArrowUpRight } from '../../icons'

export type StatTrend = 'up' | 'down' | 'neutral'

export interface StatProps {
  label: string
  value: string | number
  /** Delta shown next to the value, e.g. `"+12%"`. */
  delta?: string
  trend?: StatTrend
  description?: string
}

const props = defineProps<StatProps>()

defineSlots<{
  /** Icon shown next to the label. */
  icon?: () => unknown
}>()

const trendIcon = computed(() => (props.trend === 'up' ? IconArrowUpRight : props.trend === 'down' ? IconArrowDownRight : null))
</script>

<template>
  <div class="j-stat">
    <div class="j-stat__header">
      <span v-if="$slots.icon" class="j-stat__icon" aria-hidden="true"><slot name="icon" /></span>
      <span class="j-stat__label">{{ label }}</span>
    </div>
    <div class="j-stat__row">
      <span class="j-stat__value">{{ value }}</span>
      <span v-if="delta" class="j-stat__delta" :class="trend ? `j-stat__delta--${trend}` : undefined">
        <component :is="trendIcon" v-if="trendIcon" aria-hidden="true" />
        {{ delta }}
      </span>
    </div>
    <p v-if="description" class="j-stat__description">
      {{ description }}
    </p>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-stat {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-1-5);
  font-family: var(--juxt-font-sans);
}

.j-stat__header {
  display: flex;
  align-items: center;
  gap: var(--juxt-space-1-5);
}

.j-stat__icon {
  display: grid;
  place-items: center;
  color: var(--juxt-fg-muted);
}

.j-stat__icon > svg {
  width: 0.875rem;
  height: 0.875rem;
}

.j-stat__label {
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-stat__row {
  display: flex;
  align-items: baseline;
  gap: var(--juxt-space-2);
}

.j-stat__value {
  color: var(--juxt-fg);
  font-size: var(--juxt-text-3xl);
  font-weight: var(--juxt-weight-semibold);
  line-height: var(--juxt-leading-tight);
  letter-spacing: var(--juxt-tracking-tighter);
  font-variant-numeric: tabular-nums;
}

.j-stat__delta {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
  font-variant-numeric: tabular-nums;
}

.j-stat__delta > svg {
  width: 0.875rem;
  height: 0.875rem;
}

.j-stat__delta--up {
  color: var(--juxt-success-text);
}

.j-stat__delta--down {
  color: var(--juxt-danger-text);
}

.j-stat__description {
  margin: 0;
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  line-height: var(--juxt-leading-normal);
}
}
</style>
