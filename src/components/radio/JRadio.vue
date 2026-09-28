<script setup lang="ts">
import type { RadioValue } from './context'
import { computed, inject, useId } from 'vue'
import { RADIO_GROUP } from './context'

export interface RadioProps {
  value: RadioValue
  label?: string
  description?: string
  disabled?: boolean
}

defineOptions({ inheritAttrs: false })

const props = defineProps<RadioProps>()

defineSlots<{ default?: () => unknown, description?: () => unknown }>()

const group = inject(RADIO_GROUP, null)

const id = `j-${useId()}`
const descriptionId = `${id}-description`
const checked = computed(() => group?.value.value === props.value)
const isDisabled = computed(() => props.disabled || !!group?.disabled.value)
</script>

<template>
  <div
    class="j-radio"
    :class="[$attrs.class, { 'is-disabled': isDisabled }]"
    :style="$attrs.style as any"
    :data-state="checked ? 'checked' : 'unchecked'"
  >
    <span class="j-radio__control">
      <input
        :id="id"
        v-bind="{ ...$attrs, class: undefined, style: undefined }"
        type="radio"
        class="j-radio__input"
        :name="group?.name.value"
        :value="value"
        :checked="checked"
        :disabled="isDisabled"
        :required="group?.required.value"
        :aria-describedby="description || $slots.description ? descriptionId : undefined"
        @change="group?.select(value)"
      />
      <span class="j-radio__circle" aria-hidden="true" />
    </span>
    <span v-if="label || $slots.default || description || $slots.description" class="j-radio__text">
      <label v-if="label || $slots.default" :for="id" class="j-radio__label">
        <slot>{{ label }}</slot>
      </label>
      <span v-if="description || $slots.description" :id="descriptionId" class="j-radio__description">
        <slot name="description">{{ description }}</slot>
      </span>
    </span>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-radio {
  --j-radio-size: 1rem;

  display: inline-flex;
  align-items: flex-start;
  gap: var(--juxt-space-2-5);
  font-family: var(--juxt-font-sans);
}

.j-radio__control {
  position: relative;
  display: inline-flex;
  flex: none;
  margin-top: calc((var(--juxt-text-md) * var(--juxt-leading-snug) - var(--j-radio-size)) / 2);
}

.j-radio__input {
  position: absolute;
  inset: -4px;
  z-index: 1;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.j-radio__input:disabled {
  cursor: not-allowed;
}

.j-radio__circle {
  position: relative;
  display: block;
  width: var(--j-radio-size);
  height: var(--j-radio-size);
  border: 1px solid var(--juxt-border-strong);
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-surface);
  box-shadow: var(--juxt-shadow-xs);
  outline: 2px solid transparent;
  outline-offset: 0;
  transition:
    background-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    border-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    transform var(--juxt-duration-fast) var(--juxt-ease-out),
    outline-color var(--juxt-duration-fast) var(--juxt-ease-out),
    outline-offset var(--juxt-duration-fast) var(--juxt-ease-out);
}

/* The inner dot grows out of the centre once the fill lands. */
.j-radio__circle::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-accent-fg);
  opacity: 0;
  transform: scale(0.3);
  transition:
    opacity var(--juxt-duration-instant) var(--juxt-ease-standard),
    transform var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-radio__input:hover:not(:disabled) + .j-radio__circle {
  border-color: var(--juxt-fg-muted);
}

.j-radio__input:active:not(:disabled) + .j-radio__circle {
  transform: scale(0.9);
}

.j-radio__input:focus-visible + .j-radio__circle {
  outline-color: var(--juxt-ring);
  outline-offset: 2px;
}

.j-radio[data-state='checked'] .j-radio__circle {
  border-color: var(--juxt-accent);
  background: var(--juxt-accent);
}

.j-radio[data-state='checked'] .j-radio__input:hover:not(:disabled) + .j-radio__circle {
  border-color: var(--juxt-accent-hover);
  background: var(--juxt-accent-hover);
}

.j-radio[data-state='checked'] .j-radio__circle::after {
  opacity: 1;
  transform: none;
  transition-delay: 30ms;
}

.j-radio-group.is-invalid .j-radio:not([data-state='checked']) .j-radio__circle {
  border-color: var(--juxt-danger-border);
}

@media (prefers-reduced-motion: reduce) {
  .j-radio__input:active:not(:disabled) + .j-radio__circle {
    transform: none;
  }
}

.j-radio__text {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-0-5);
  min-width: 0;
}

.j-radio__label {
  color: var(--juxt-fg);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-snug);
  letter-spacing: var(--juxt-tracking-tight);
  cursor: pointer;
  user-select: none;
}

.j-radio__description {
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-normal);
}

.j-radio.is-disabled .j-radio__circle {
  opacity: 0.5;
  box-shadow: none;
}

.j-radio.is-disabled .j-radio__label {
  color: var(--juxt-fg-muted);
  cursor: not-allowed;
}
}
</style>
