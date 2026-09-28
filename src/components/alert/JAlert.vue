<script setup lang="ts">
import { IconAlert, IconCircleCheck, IconCircleX, IconInfo, IconX } from '../../icons'

export type AlertVariant = 'neutral' | 'info' | 'success' | 'warning' | 'destructive'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  description?: string
  /** Show a close button; emits `dismiss`. */
  dismissible?: boolean
  /** Hide the leading icon. */
  hideIcon?: boolean
}

withDefaults(defineProps<AlertProps>(), { variant: 'neutral' })

const emit = defineEmits<{ dismiss: [] }>()

defineSlots<{
  default?: () => unknown
  icon?: () => unknown
  actions?: () => unknown
}>()

const icons = {
  neutral: IconInfo,
  info: IconInfo,
  success: IconCircleCheck,
  warning: IconAlert,
  destructive: IconCircleX,
}
</script>

<template>
  <div class="j-alert" :class="`j-alert--${variant}`">
    <span v-if="!hideIcon" class="j-alert__icon" aria-hidden="true">
      <slot name="icon"><component :is="icons[variant]" /></slot>
    </span>
    <div class="j-alert__body">
      <p v-if="title" class="j-alert__title">
        {{ title }}
      </p>
      <div v-if="description || $slots.default" class="j-alert__description">
        <slot>{{ description }}</slot>
      </div>
      <div v-if="$slots.actions" class="j-alert__actions">
        <slot name="actions" />
      </div>
    </div>
    <button v-if="dismissible" type="button" class="j-alert__close j-focusable" aria-label="Dismiss" @click="emit('dismiss')">
      <IconX />
    </button>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
/*
 * Alerts stay on the page's surface. Colour lives in the icon and a hairline
 * of the border | enough to be noticed, never enough to shout.
 */
.j-alert {
  --j-alert-accent: var(--juxt-fg-muted);
  --j-alert-border: var(--juxt-border);

  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--juxt-space-3);
  padding: var(--juxt-space-3) var(--juxt-space-4);
  border: 1px solid var(--j-alert-border);
  border-radius: var(--juxt-radius-md);
  background: var(--juxt-surface);
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
}

.j-alert--info {
  --j-alert-accent: var(--juxt-info-text);
}

.j-alert--success {
  --j-alert-accent: var(--juxt-success-text);
}

.j-alert--warning {
  --j-alert-accent: var(--juxt-warning-text);
  --j-alert-border: var(--juxt-warning-border);
}

.j-alert--destructive {
  --j-alert-accent: var(--juxt-danger-text);
  --j-alert-border: var(--juxt-danger-border);
}

.j-alert__icon {
  display: grid;
  flex: none;
  place-items: center;
  height: 1.25rem;
  color: var(--j-alert-accent);
}

.j-alert__icon > svg {
  width: 1rem;
  height: 1rem;
}

.j-alert__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--juxt-space-0-5);
  min-width: 0;
}

.j-alert__title {
  margin: 0;
  font-size: var(--juxt-text-md);
  font-weight: var(--juxt-weight-medium);
  line-height: 1.25rem;
  letter-spacing: var(--juxt-tracking-tight);
}

.j-alert__description {
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-normal);
}

.j-alert__description > p {
  margin: 0;
}

.j-alert__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--juxt-space-2);
  margin-top: var(--juxt-space-2);
}

.j-alert:has(.j-alert__close) {
  padding-right: var(--juxt-space-10);
}

.j-alert__close {
  position: absolute;
  top: var(--juxt-space-2-5);
  right: var(--juxt-space-2-5);
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: 0;
  border-radius: var(--juxt-radius-xs);
  background: transparent;
  color: var(--juxt-fg-muted);
  cursor: pointer;
  transition-property: background-color, color, outline-color, outline-offset;
}

.j-alert__close:hover {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
}

.j-alert__close > svg {
  width: 0.875rem;
  height: 0.875rem;
}
}
</style>
