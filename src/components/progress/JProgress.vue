<script setup lang="ts">
import { computed, useId } from 'vue'

export interface ProgressProps {
  /** Current value. `null` shows an indeterminate bar. */
  value?: number | null
  max?: number
  size?: 'sm' | 'md'
  /** Visible label above the bar; also its accessible name. */
  label?: string
  /** Show the percentage next to the label. */
  showValue?: boolean
  /** `accent` for progress toward a goal, `neutral` for plain measurement. */
  variant?: 'accent' | 'neutral'
}

const props = withDefaults(defineProps<ProgressProps>(), {
  value: null,
  max: 100,
  size: 'md',
  variant: 'accent',
})

const id = `j-${useId()}`
const indeterminate = computed(() => props.value === null || props.value === undefined)
const ratio = computed(() => (indeterminate.value ? 0 : Math.min(1, Math.max(0, Number(props.value) / props.max))))
const percent = computed(() => Math.round(ratio.value * 100))
</script>

<template>
  <div class="j-progress" :class="[`j-progress--${size}`, `j-progress--${variant}`, { 'is-indeterminate': indeterminate }]">
    <div v-if="label || showValue" class="j-progress__header">
      <span v-if="label" :id="`${id}-label`" class="j-progress__label">{{ label }}</span>
      <span v-if="showValue && !indeterminate" class="j-progress__value">{{ percent }}%</span>
    </div>
    <div
      class="j-progress__track"
      role="progressbar"
      :aria-labelledby="label ? `${id}-label` : undefined"
      aria-valuemin="0"
      :aria-valuemax="max"
      :aria-valuenow="indeterminate ? undefined : value!"
      :aria-valuetext="indeterminate ? 'Loading' : `${percent}%`"
    >
      <span class="j-progress__fill" :style="indeterminate ? undefined : { transform: `scaleX(${ratio})` }" />
    </div>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-progress {
  --j-progress-height: 0.375rem;
  --j-progress-fill: var(--juxt-accent);

  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-2);
  width: 100%;
  font-family: var(--juxt-font-sans);
}

.j-progress--sm {
  --j-progress-height: 0.25rem;
}

.j-progress--neutral {
  --j-progress-fill: var(--juxt-fg);
}

.j-progress__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--juxt-space-3);
  font-size: var(--juxt-text-sm);
}

.j-progress__label {
  color: var(--juxt-fg);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-progress__value {
  color: var(--juxt-fg-muted);
  font-variant-numeric: tabular-nums;
}

.j-progress__track {
  position: relative;
  height: var(--j-progress-height);
  overflow: hidden;
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-surface-active);
}

/* Width changes are transforms, so updates glide without reflow. */
.j-progress__fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--j-progress-fill);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--juxt-duration-slow) var(--juxt-ease-out);
}

.j-progress.is-indeterminate .j-progress__fill {
  width: 40%;
  transform: none;
  animation: j-progress-indeterminate 1.4s var(--juxt-ease-standard) infinite;
}

@keyframes j-progress-indeterminate {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(250%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .j-progress.is-indeterminate .j-progress__fill {
    width: 100%;
    animation: j-progress-pulse 1.6s ease-in-out infinite;
  }

  @keyframes j-progress-pulse {
    50% {
      opacity: 0.35;
    }
  }
}
}
</style>
