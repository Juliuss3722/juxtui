<script setup lang="ts">
/**
 * Internal: lays out label, control, description and error for form fields.
 * Not exported | every field component composes it.
 */
defineProps<{
  id: string
  labelId: string
  descriptionId: string
  errorId: string
  label?: string
  description?: string
  errorMessage?: string
  showDescription?: boolean
  required?: boolean
  disabled?: boolean
  /** Render the label as a plain element when the control isn't labelable (e.g. a button). */
  labelFor?: string | null
}>()
</script>

<template>
  <div class="j-field" :class="{ 'is-disabled': disabled }">
    <component
      :is="labelFor === null ? 'span' : 'label'"
      v-if="label || $slots.label"
      :id="labelId"
      class="j-field__label"
      :for="labelFor === null ? undefined : labelFor ?? id"
    >
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="j-field__required" aria-hidden="true">*</span>
    </component>
    <slot />
    <div class="j-field__messages">
      <Transition name="j-field-message" mode="out-in">
        <p v-if="errorMessage" :id="errorId" :key="errorMessage" class="j-field__error">
          {{ errorMessage }}
        </p>
        <p v-else-if="showDescription" :id="descriptionId" class="j-field__description">
          {{ description }}
        </p>
      </Transition>
    </div>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-field {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-1-5);
  min-width: 0;
  font-family: var(--juxt-font-sans);
}

.j-field__label {
  display: inline-flex;
  align-items: baseline;
  gap: var(--juxt-space-0-5);
  width: fit-content;
  color: var(--juxt-fg);
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
  line-height: var(--juxt-leading-snug);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-field.is-disabled .j-field__label {
  color: var(--juxt-fg-muted);
}

.j-field__required {
  color: var(--juxt-fg-muted);
  font-weight: var(--juxt-weight-regular);
}

.j-field__messages:empty {
  display: none;
}

.j-field__description,
.j-field__error {
  margin: 0;
  font-size: var(--juxt-text-xs);
  line-height: var(--juxt-leading-normal);
}

.j-field__description {
  color: var(--juxt-fg-muted);
}

.j-field__error {
  color: var(--juxt-danger-text);
}

.j-field-message-enter-active {
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-out),
    transform var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-field-message-leave-active {
  transition: opacity var(--juxt-duration-instant) var(--juxt-ease-in);
}

.j-field-message-enter-from {
  opacity: 0;
  transform: translateY(calc(var(--juxt-motion-shift) * -0.5));
}

.j-field-message-leave-to {
  opacity: 0;
}
}
</style>
