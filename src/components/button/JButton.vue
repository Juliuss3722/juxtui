<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { Spinner } from '../../icons'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps {
  /** Visual weight. `primary` is for the single most important action in a view. */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows a spinner, keeps the width, and blocks activation while staying focusable. */
  loading?: boolean
  disabled?: boolean
  /** Square button for a single icon. Provide an `aria-label`. */
  icon?: boolean
  /** Stretch to the full width of the container. */
  block?: boolean
  /** Render as another element or component, e.g. `a` or `NuxtLink`. */
  as?: string | Component
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  as: 'button',
  type: 'button',
})

defineSlots<{
  default?: () => unknown
  leading?: () => unknown
  trailing?: () => unknown
}>()

const isNativeButton = computed(() => props.as === 'button')
const inert = computed(() => props.disabled || props.loading)

const attrs = computed(() => {
  if (isNativeButton.value) {
    return {
      type: props.type,
      // A loading button stays focusable so keyboard users don't lose their place.
      'disabled': props.disabled || undefined,
      'aria-disabled': props.loading || undefined,
    }
  }
  return {
    'aria-disabled': inert.value || undefined,
    'tabindex': props.disabled ? -1 : undefined,
  }
})

function onClick(event: MouseEvent) {
  if (inert.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}
</script>

<template>
  <component
    :is="as"
    v-bind="attrs"
    class="j-button j-focusable"
    :class="[
      `j-button--${variant}`,
      `j-button--${size}`,
      { 'j-button--icon': icon, 'j-button--block': block, 'is-loading': loading },
    ]"
    :aria-busy="loading || undefined"
    :data-disabled="disabled || undefined"
    @click.capture="onClick"
  >
    <span class="j-button__content">
      <span v-if="$slots.leading" class="j-button__icon"><slot name="leading" /></span>
      <slot />
      <span v-if="$slots.trailing" class="j-button__icon"><slot name="trailing" /></span>
    </span>
    <Transition name="j-button-spinner">
      <span v-if="loading" class="j-button__spinner">
        <Spinner :size="size === 'xs' ? 12 : size === 'lg' ? 16 : 14" />
      </span>
    </Transition>
  </component>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-button {
  --j-button-height: var(--juxt-control-md);
  --j-button-px: var(--juxt-space-3);
  --j-button-gap: var(--juxt-space-1-5);
  --j-button-font: var(--juxt-text-md);
  --j-button-radius: var(--juxt-radius-sm);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--j-button-height);
  padding: 0 var(--j-button-px);
  border: 1px solid transparent;
  border-radius: var(--j-button-radius);
  font-family: var(--juxt-font-sans);
  font-size: var(--j-button-font);
  font-weight: var(--juxt-weight-medium);
  line-height: 1;
  letter-spacing: var(--juxt-tracking-tight);
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition-property: background-color, border-color, color, box-shadow, transform, outline-color, outline-offset;
  transition-duration: var(--juxt-duration-fast);
  transition-timing-function: var(--juxt-ease-standard);
}

/* Pressed: a short, physical dip. Released slower than pressed. */
.j-button:active:not([aria-disabled='true'], :disabled) {
  transform: scale(0.97);
  transition-duration: var(--juxt-duration-instant);
}

@media (prefers-reduced-motion: reduce) {
  .j-button:active:not([aria-disabled='true'], :disabled) {
    transform: none;
  }
}

.j-button__content {
  display: inline-flex;
  align-items: center;
  gap: var(--j-button-gap);
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-standard),
    transform var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-button__icon {
  display: inline-flex;
  margin-inline: -0.125rem;
  opacity: 0.85;
}

.j-button__icon > svg {
  width: 1em;
  height: 1em;
}

.j-button.is-loading {
  cursor: progress;
}

.j-button.is-loading .j-button__content {
  opacity: 0;
  transform: scale(0.96);
}

.j-button__spinner {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.j-button-spinner-enter-active {
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-out) 40ms,
    transform var(--juxt-duration-normal) var(--juxt-ease-out) 40ms;
}

.j-button-spinner-leave-active {
  transition:
    opacity var(--juxt-duration-instant) var(--juxt-ease-in),
    transform var(--juxt-duration-instant) var(--juxt-ease-in);
}

.j-button-spinner-enter-from,
.j-button-spinner-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Sizes */
.j-button--xs {
  --j-button-height: var(--juxt-control-xs);
  --j-button-px: var(--juxt-space-2);
  --j-button-gap: var(--juxt-space-1);
  --j-button-font: var(--juxt-text-xs);
  --j-button-radius: var(--juxt-radius-xs);
}

.j-button--sm {
  --j-button-height: var(--juxt-control-sm);
  --j-button-px: var(--juxt-space-2-5);
  --j-button-gap: var(--juxt-space-1-5);
  --j-button-font: var(--juxt-text-sm);
}

.j-button--lg {
  --j-button-height: var(--juxt-control-lg);
  --j-button-px: var(--juxt-space-4);
  --j-button-gap: var(--juxt-space-2);
  --j-button-font: var(--juxt-text-md);
  --j-button-radius: var(--juxt-radius-md);
}

.j-button--icon {
  width: var(--j-button-height);
  padding: 0;
}

.j-button--icon .j-button__content > svg,
.j-button--icon .j-button__content > :where(span, i) > svg {
  width: calc(var(--j-button-height) * 0.46);
  height: calc(var(--j-button-height) * 0.46);
}

.j-button--block {
  display: flex;
  width: 100%;
}

/* Variants */
.j-button--primary {
  background: var(--juxt-ink);
  color: var(--juxt-ink-fg);
  box-shadow: var(--juxt-shadow-xs), var(--juxt-control-highlight);
}

.j-button--primary:hover:not([aria-disabled='true'], :disabled) {
  background: var(--juxt-ink-hover);
}

.j-button--secondary {
  background: var(--juxt-surface-sunken);
  border-color: var(--juxt-border-subtle);
  color: var(--juxt-fg);
}

.dark .j-button--secondary,
[data-theme='dark'] .j-button--secondary {
  background: var(--juxt-surface-raised);
  border-color: var(--juxt-border-subtle);
}

.j-button--secondary:hover:not([aria-disabled='true'], :disabled) {
  background: var(--juxt-surface-active);
}

.j-button--outline {
  background: var(--juxt-surface);
  border-color: var(--juxt-border);
  color: var(--juxt-fg);
  box-shadow: var(--juxt-shadow-xs);
}

.j-button--outline:hover:not([aria-disabled='true'], :disabled) {
  background: var(--juxt-surface-hover);
  border-color: var(--juxt-border-strong);
}

.j-button--ghost {
  background: transparent;
  color: var(--juxt-fg-secondary);
}

.j-button--ghost:hover:not([aria-disabled='true'], :disabled) {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
}

.j-button--ghost:active:not([aria-disabled='true'], :disabled) {
  background: var(--juxt-surface-active);
}

.j-button--destructive {
  background: var(--juxt-danger);
  color: var(--juxt-danger-fg);
  box-shadow: var(--juxt-shadow-xs), var(--juxt-control-highlight);
}

.j-button--destructive:hover:not([aria-disabled='true'], :disabled) {
  background: var(--juxt-danger-hover);
}

.j-button--destructive:focus-visible {
  outline-color: var(--juxt-danger);
}

/* Disabled: quiet, not ghostly. */
.j-button:disabled,
.j-button[data-disabled] {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}
}
</style>
