<script setup lang="ts">
export interface EmptyStateProps {
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<EmptyStateProps>(), { size: 'md' })

defineSlots<{
  /** Icon or illustration shown above the title. */
  icon?: () => unknown
  default?: () => unknown
  /** Call to action, typically a `JButton`. */
  actions?: () => unknown
}>()
</script>

<template>
  <div class="j-empty-state" :class="`j-empty-state--${size}`">
    <div v-if="$slots.icon" class="j-empty-state__icon">
      <slot name="icon" />
    </div>
    <p v-if="title" class="j-empty-state__title">
      {{ title }}
    </p>
    <div v-if="description || $slots.default" class="j-empty-state__description">
      <slot>{{ description }}</slot>
    </div>
    <div v-if="$slots.actions" class="j-empty-state__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 24rem;
  margin: 0 auto;
  padding: var(--juxt-space-8) var(--juxt-space-4);
  text-align: center;
  font-family: var(--juxt-font-sans);
}

.j-empty-state--sm {
  max-width: 18rem;
  padding: var(--juxt-space-6) var(--juxt-space-3);
}

.j-empty-state--lg {
  max-width: 28rem;
  padding: var(--juxt-space-12) var(--juxt-space-4);
}

.j-empty-state__icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  margin-bottom: var(--juxt-space-4);
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-surface-sunken);
  color: var(--juxt-fg-muted);
}

.j-empty-state--lg .j-empty-state__icon {
  width: 3.5rem;
  height: 3.5rem;
}

.j-empty-state__icon > svg {
  width: 1.25rem;
  height: 1.25rem;
}

.j-empty-state--lg .j-empty-state__icon > svg {
  width: 1.5rem;
  height: 1.5rem;
}

.j-empty-state__title {
  margin: 0;
  color: var(--juxt-fg);
  font-size: var(--juxt-text-lg);
  font-weight: var(--juxt-weight-semibold);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-empty-state__description {
  margin-top: var(--juxt-space-1-5);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-normal);
}

.j-empty-state__description > p {
  margin: 0;
}

.j-empty-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--juxt-space-2);
  margin-top: var(--juxt-space-5);
}
}
</style>
