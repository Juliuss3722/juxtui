<script setup lang="ts">
import type { RadioValue } from './context'
import { computed, provide, useId } from 'vue'
import { RADIO_GROUP } from './context'

export interface RadioGroupProps {
  /** Group label, rendered as the fieldset legend. */
  label?: string
  description?: string
  /** An error message, or `true` to mark the group invalid without one. */
  error?: string | boolean
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
  required?: boolean
  /** Form field name. Generated when omitted. */
  name?: string
}

const props = withDefaults(defineProps<RadioGroupProps>(), { orientation: 'vertical', error: undefined })

const model = defineModel<RadioValue | null>({ default: null })

defineSlots<{ default?: () => unknown, label?: () => unknown }>()

const id = `j-${useId()}`
const descriptionId = `${id}-description`
const errorId = `${id}-error`
const errorMessage = computed(() => (typeof props.error === 'string' ? props.error : ''))

provide(RADIO_GROUP, {
  name: computed(() => props.name ?? id),
  value: computed(() => model.value),
  disabled: computed(() => props.disabled),
  required: computed(() => props.required),
  invalid: computed(() => !!props.error),
  select: (value) => {
    if (!props.disabled) model.value = value
  },
})

const describedBy = computed(() => (errorMessage.value ? errorId : props.description ? descriptionId : undefined))
</script>

<template>
  <fieldset
    class="j-radio-group"
    :class="{ 'is-disabled': disabled, 'is-invalid': !!error }"
    :disabled="disabled"
    :aria-describedby="describedBy"
    :aria-invalid="!!error || undefined"
    :aria-required="required || undefined"
  >
    <legend v-if="label || $slots.label" class="j-radio-group__legend">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="j-field__required" aria-hidden="true">*</span>
    </legend>
    <p v-if="description && !errorMessage" :id="descriptionId" class="j-radio-group__description">
      {{ description }}
    </p>
    <div class="j-radio-group__items" :class="`j-radio-group__items--${orientation}`">
      <slot />
    </div>
    <p v-if="errorMessage" :id="errorId" class="j-radio-group__error">
      {{ errorMessage }}
    </p>
  </fieldset>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-1-5);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  font-family: var(--juxt-font-sans);
}

.j-radio-group__legend {
  display: inline-flex;
  gap: var(--juxt-space-0-5);
  margin-bottom: var(--juxt-space-1-5);
  padding: 0;
  color: var(--juxt-fg);
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
  line-height: var(--juxt-leading-snug);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-radio-group__description,
.j-radio-group__error {
  margin: calc(var(--juxt-space-1) * -1) 0 var(--juxt-space-1-5);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  line-height: var(--juxt-leading-normal);
}

.j-radio-group__error {
  margin: var(--juxt-space-1) 0 0;
  color: var(--juxt-danger-text);
}

.j-radio-group__items {
  display: flex;
}

.j-radio-group__items--vertical {
  flex-direction: column;
  gap: var(--juxt-space-3);
}

.j-radio-group__items--horizontal {
  flex-wrap: wrap;
  gap: var(--juxt-space-3) var(--juxt-space-6);
}
}
</style>
