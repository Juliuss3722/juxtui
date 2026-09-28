<script setup lang="ts">
import { computed, ref, useId, watchEffect } from 'vue'

export interface CheckboxProps {
  label?: string
  description?: string
  disabled?: boolean
  required?: boolean
  /** Shows a dash. Typically used for "select all" when only some items are selected. */
  indeterminate?: boolean
  name?: string
  value?: string
  id?: string
}

defineOptions({ inheritAttrs: false })

const props = defineProps<CheckboxProps>()
const model = defineModel<boolean>({ default: false })

defineSlots<{ default?: () => unknown, description?: () => unknown }>()

const generated = useId()
const id = computed(() => props.id ?? `j-${generated}`)
const descriptionId = computed(() => `${id.value}-description`)
const input = ref<HTMLInputElement | null>(null)

// `indeterminate` is a DOM property, not an attribute.
watchEffect(() => {
  if (input.value) input.value.indeterminate = !!props.indeterminate
})

const state = computed(() => (props.indeterminate ? 'indeterminate' : model.value ? 'checked' : 'unchecked'))

function onChange(event: Event) {
  model.value = (event.target as HTMLInputElement).checked
}

defineExpose({ input, focus: () => input.value?.focus() })
</script>

<template>
  <div
    class="j-checkbox"
    :class="[$attrs.class, { 'is-disabled': disabled }]"
    :style="$attrs.style as any"
    :data-state="state"
  >
    <span class="j-checkbox__control">
      <input
        :id="id"
        ref="input"
        v-bind="{ ...$attrs, class: undefined, style: undefined }"
        type="checkbox"
        class="j-checkbox__input"
        :checked="model"
        :disabled="disabled"
        :required="required"
        :name="name"
        :value="value"
        :aria-describedby="description || $slots.description ? descriptionId : undefined"
        @change="onChange"
      />
      <span class="j-checkbox__box" aria-hidden="true">
        <svg class="j-checkbox__check" viewBox="0 0 16 16" fill="none">
          <path d="M4 8.25l2.75 2.75L12 5.5" pathLength="1" />
        </svg>
        <svg class="j-checkbox__dash" viewBox="0 0 16 16" fill="none">
          <path d="M4.5 8h7" />
        </svg>
      </span>
    </span>
    <span v-if="label || $slots.default || description || $slots.description" class="j-checkbox__text">
      <label v-if="label || $slots.default" :for="id" class="j-checkbox__label">
        <slot>{{ label }}</slot>
      </label>
      <span v-if="description || $slots.description" :id="descriptionId" class="j-checkbox__description">
        <slot name="description">{{ description }}</slot>
      </span>
    </span>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-checkbox {
  --j-checkbox-size: 1rem;

  display: inline-flex;
  align-items: flex-start;
  gap: var(--juxt-space-2-5);
  font-family: var(--juxt-font-sans);
}

.j-checkbox__control {
  position: relative;
  display: inline-flex;
  flex: none;
  /* Align the box with the first line of the label. */
  margin-top: calc((var(--juxt-text-md) * var(--juxt-leading-snug) - var(--j-checkbox-size)) / 2);
}

.j-checkbox__input {
  position: absolute;
  inset: -4px;
  z-index: 1;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.j-checkbox__input:disabled {
  cursor: not-allowed;
}

.j-checkbox__box {
  display: grid;
  place-items: center;
  width: var(--j-checkbox-size);
  height: var(--j-checkbox-size);
  border: 1px solid var(--juxt-border-strong);
  border-radius: var(--juxt-radius-xs);
  background: var(--juxt-surface);
  box-shadow: var(--juxt-shadow-xs);
  color: var(--juxt-accent-fg);
  outline: 2px solid transparent;
  outline-offset: 0;
  transition:
    background-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    border-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    transform var(--juxt-duration-fast) var(--juxt-ease-out),
    outline-color var(--juxt-duration-fast) var(--juxt-ease-out),
    outline-offset var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-checkbox__box > svg {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.j-checkbox__input:hover:not(:disabled) + .j-checkbox__box {
  border-color: var(--juxt-fg-muted);
}

.j-checkbox__input:active:not(:disabled) + .j-checkbox__box {
  transform: scale(0.9);
}

.j-checkbox__input:focus-visible + .j-checkbox__box {
  outline-color: var(--juxt-ring);
  outline-offset: 2px;
}

.j-checkbox[data-state='checked'] .j-checkbox__box,
.j-checkbox[data-state='indeterminate'] .j-checkbox__box {
  border-color: var(--juxt-accent);
  background: var(--juxt-accent);
}

.j-checkbox[data-state='checked'] .j-checkbox__input:hover:not(:disabled) + .j-checkbox__box,
.j-checkbox[data-state='indeterminate'] .j-checkbox__input:hover:not(:disabled) + .j-checkbox__box {
  border-color: var(--juxt-accent-hover);
  background: var(--juxt-accent-hover);
}

/* The check draws itself in, just after the fill lands. */
.j-checkbox__check path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset var(--juxt-duration-fast) var(--juxt-ease-in);
}

.j-checkbox[data-state='checked'] .j-checkbox__check path {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--juxt-duration-normal) var(--juxt-ease-out) 40ms;
}

.j-checkbox__dash {
  opacity: 0;
  transform: scaleX(0.4);
  transition:
    opacity var(--juxt-duration-instant) var(--juxt-ease-standard),
    transform var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-checkbox[data-state='indeterminate'] .j-checkbox__dash {
  opacity: 1;
  transform: none;
}

.j-checkbox[data-state='indeterminate'] .j-checkbox__check {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .j-checkbox__check path,
  .j-checkbox[data-state='checked'] .j-checkbox__check path {
    transition-duration: 0ms;
  }

  .j-checkbox__input:active:not(:disabled) + .j-checkbox__box {
    transform: none;
  }
}

.j-checkbox__text {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-0-5);
  min-width: 0;
}

.j-checkbox__label {
  color: var(--juxt-fg);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-snug);
  letter-spacing: var(--juxt-tracking-tight);
  cursor: pointer;
  user-select: none;
}

.j-checkbox__description {
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-normal);
}

.j-checkbox.is-disabled .j-checkbox__box {
  opacity: 0.5;
  box-shadow: none;
}

.j-checkbox.is-disabled .j-checkbox__label {
  color: var(--juxt-fg-muted);
  cursor: not-allowed;
}
}
</style>
