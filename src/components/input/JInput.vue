<script setup lang="ts">
import type { FieldProps } from '../field/useField'
import { ref } from 'vue'
import JFieldShell from '../field/JFieldShell.vue'
import { useField } from '../field/useField'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends FieldProps {
  type?: string
  placeholder?: string
  size?: InputSize
  readonly?: boolean
  name?: string
  autocomplete?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
  error: undefined,
})

const model = defineModel<string | number | null>({ default: '' })

defineSlots<{
  leading?: () => unknown
  trailing?: () => unknown
  label?: () => unknown
}>()

const field = useField(props)
const input = ref<HTMLInputElement | null>(null)

// Clicking the frame (padding, icons) focuses the input without a blur flicker.
function onFramePointerDown(event: PointerEvent) {
  if (event.target === input.value || props.disabled) return
  if ((event.target as HTMLElement).closest('button, a, input, select, textarea, [tabindex]')) return
  event.preventDefault()
  input.value?.focus()
}

defineExpose({
  /** The underlying `<input>` element. */
  input,
  focus: () => input.value?.focus(),
  select: () => input.value?.select(),
})
</script>

<template>
  <JFieldShell
    :id="field.id.value"
    :class="$attrs.class"
    :style="$attrs.style"
    :label-id="field.labelId.value"
    :description-id="field.descriptionId.value"
    :error-id="field.errorId.value"
    :label="label"
    :description="description"
    :error-message="field.errorMessage.value"
    :show-description="field.showDescription.value"
    :required="required"
    :disabled="disabled"
  >
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
    <div
      class="j-control j-input"
      :class="[`j-control--${size}`, { 'is-invalid': field.invalid.value, 'is-disabled': disabled, 'is-readonly': readonly }]"
      @pointerdown="onFramePointerDown"
    >
      <span v-if="$slots.leading" class="j-control__adornment j-control__adornment--leading">
        <slot name="leading" />
      </span>
      <input
        :id="field.id.value"
        ref="input"
        v-model="model"
        v-bind="{ ...$attrs, class: undefined, style: undefined }"
        class="j-input__native"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :aria-invalid="field.invalid.value || undefined"
        :aria-describedby="field.describedBy.value"
      />
      <span v-if="$slots.trailing" class="j-control__adornment j-control__adornment--trailing">
        <slot name="trailing" />
      </span>
    </div>
  </JFieldShell>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-input__native {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: calc(var(--j-control-height) - 2px);
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: var(--juxt-tracking-tight);
}

.j-input__native::placeholder {
  color: var(--juxt-fg-muted);
  opacity: 1;
}

.j-input__native:disabled {
  cursor: not-allowed;
}

.j-input__native::-webkit-search-cancel-button {
  display: none;
}
}
</style>
