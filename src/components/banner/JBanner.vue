<script setup lang="ts">
import { IconAlert, IconCircleCheck, IconCircleX, IconInfo, IconX } from '../../icons'

export type BannerVariant = 'neutral' | 'info' | 'success' | 'warning' | 'destructive'

export interface BannerProps {
  variant?: BannerVariant
  title?: string
  description?: string
  /** Show a close button; emits `dismiss`. */
  dismissible?: boolean
  /** Hide the leading icon. */
  hideIcon?: boolean
}

withDefaults(defineProps<BannerProps>(), { variant: 'neutral' })

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
  <div class="j-banner" :class="`j-banner--${variant}`" role="region" :aria-label="title">
    <span v-if="!hideIcon" class="j-banner__icon" aria-hidden="true">
      <slot name="icon"><component :is="icons[variant]" /></slot>
    </span>
    <div class="j-banner__body">
      <p v-if="title" class="j-banner__title">
        {{ title }}
      </p>
      <div v-if="description || $slots.default" class="j-banner__description">
        <slot>{{ description }}</slot>
      </div>
    </div>
    <div v-if="$slots.actions" class="j-banner__actions">
      <slot name="actions" />
    </div>
    <button v-if="dismissible" type="button" class="j-banner__close j-focusable" aria-label="Dismiss" @click="emit('dismiss')">
      <IconX />
    </button>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
/*
 * Banners run edge-to-edge across a page or section, unlike JAlert which sits
 * inline in a card or form. A flat tinted surface and a left accent bar
 * distinguish them from the bordered, neutral surface of an alert.
 */
.j-banner {
  --j-banner-accent: var(--juxt-fg-muted);
  --j-banner-bg: var(--juxt-surface-sunken);

  position: relative;
  display: flex;
  align-items: center;
  gap: var(--juxt-space-3);
  padding: var(--juxt-space-3) var(--juxt-space-5);
  border-left: 3px solid var(--j-banner-accent);
  background: var(--j-banner-bg);
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
}

.j-banner--info {
  --j-banner-accent: var(--juxt-info);
  --j-banner-bg: var(--juxt-info-soft);
}

.j-banner--success {
  --j-banner-accent: var(--juxt-success);
  --j-banner-bg: var(--juxt-success-soft);
}

.j-banner--warning {
  --j-banner-accent: var(--juxt-warning);
  --j-banner-bg: var(--juxt-warning-soft);
}

.j-banner--destructive {
  --j-banner-accent: var(--juxt-danger);
  --j-banner-bg: var(--juxt-danger-soft);
}

.j-banner__icon {
  display: grid;
  flex: none;
  place-items: center;
  height: 1.25rem;
  color: var(--j-banner-accent);
}

.j-banner__icon > svg {
  width: 1rem;
  height: 1rem;
}

.j-banner__body {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--juxt-space-1) var(--juxt-space-2);
  min-width: 0;
}

.j-banner__title {
  margin: 0;
  color: var(--juxt-fg);
  font-size: var(--juxt-text-md);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-banner__description {
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-normal);
}

.j-banner__description > p {
  margin: 0;
}

.j-banner__actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: var(--juxt-space-2);
}

.j-banner__close {
  display: grid;
  flex: none;
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

.j-banner__close:hover {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
}

.j-banner__close > svg {
  width: 0.875rem;
  height: 0.875rem;
}
}
</style>
