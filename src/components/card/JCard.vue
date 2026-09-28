<script setup lang="ts">
import type { Component } from 'vue'

export interface CardProps {
  title?: string
  description?: string
  /** `outline` sits on the page; `muted` recedes into it. */
  variant?: 'outline' | 'muted'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: string | Component
}

withDefaults(defineProps<CardProps>(), { variant: 'outline', padding: 'md', as: 'div' })

defineSlots<{
  default?: () => unknown
  header?: () => unknown
  /** Sits to the right of the title | a button, badge or menu. */
  actions?: () => unknown
  footer?: () => unknown
}>()
</script>

<template>
  <component :is="as" class="j-card" :class="[`j-card--${variant}`, `j-card--p-${padding}`]">
    <header v-if="title || description || $slots.header || $slots.actions" class="j-card__header">
      <slot name="header">
        <div class="j-card__heading">
          <h3 v-if="title" class="j-card__title">
            {{ title }}
          </h3>
          <p v-if="description" class="j-card__description">
            {{ description }}
          </p>
        </div>
      </slot>
      <div v-if="$slots.actions" class="j-card__actions">
        <slot name="actions" />
      </div>
    </header>
    <div v-if="$slots.default" class="j-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="j-card__footer">
      <slot name="footer" />
    </footer>
  </component>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-card {
  --j-card-p: var(--juxt-space-5);

  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: var(--juxt-radius-lg);
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
}

.j-card--outline {
  --j-avatar-ring: var(--juxt-surface);

  border: 1px solid var(--juxt-border);
  background: var(--juxt-surface);
  box-shadow: var(--juxt-shadow-xs);
}

.j-card--muted {
  --j-avatar-ring: var(--juxt-surface-sunken);

  border: 1px solid transparent;
  background: var(--juxt-surface-sunken);
}

.j-card--p-none {
  --j-card-p: 0;
}

.j-card--p-sm {
  --j-card-p: var(--juxt-space-3);
}

.j-card--p-lg {
  --j-card-p: var(--juxt-space-6);
}

.j-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--juxt-space-4);
  padding: var(--j-card-p) var(--j-card-p) 0;
}

.j-card__heading {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-1);
  min-width: 0;
}

.j-card__title {
  margin: 0;
  font-size: var(--juxt-text-md);
  font-weight: var(--juxt-weight-semibold);
  line-height: var(--juxt-leading-snug);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-card__description {
  margin: 0;
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-normal);
}

.j-card__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--juxt-space-2);
  margin: calc(var(--juxt-space-1) * -1) 0;
}

.j-card__body {
  flex: 1;
  padding: var(--j-card-p);
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-normal);
}

.j-card__header + .j-card__body {
  padding-top: var(--juxt-space-4);
}

.j-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--juxt-space-2);
  padding: var(--juxt-space-3) var(--j-card-p);
  border-top: 1px solid var(--juxt-border-subtle);
}

.j-card__header:last-child {
  padding-bottom: var(--j-card-p);
}

.j-card--muted .j-card__footer {
  border-top-color: var(--juxt-border);
}
}
</style>
