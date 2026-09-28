<script setup lang="ts">
import type { FieldProps } from '../field/useField'
import { nextTick, onMounted, ref, watch } from 'vue'
import JFieldShell from '../field/JFieldShell.vue'
import { useField } from '../field/useField'

export interface TextareaProps extends FieldProps {
  placeholder?: string
  rows?: number
  /** Grow with the content, up to `maxRows`. */
  autoresize?: boolean
  maxRows?: number
  readonly?: boolean
  name?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TextareaProps>(), {
  rows: 3,
  maxRows: 12,
  error: undefined,
})

const model = defineModel<string | null>({ default: '' })

defineSlots<{ label?: () => unknown }>()

const field = useField(props)
const textarea = ref<HTMLTextAreaElement | null>(null)

function resize() {
  const el = textarea.value
  if (!props.autoresize || !el) return
  const style = getComputedStyle(el)
  const line = Number.parseFloat(style.lineHeight) || 20
  const chrome = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
  el.style.height = 'auto'
  const max = line * props.maxRows + chrome
  const next = Math.min(el.scrollHeight, max)
  el.style.height = `${next}px`
  el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
}

onMounted(resize)
watch(model, () => nextTick(resize))
watch(() => props.autoresize, (value) => {
  if (value) return nextTick(resize)
  if (textarea.value) textarea.value.style.height = ''
})

defineExpose({
  textarea,
  focus: () => textarea.value?.focus(),
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
      class="j-control j-textarea"
      :class="{ 'is-invalid': field.invalid.value, 'is-disabled': disabled, 'is-readonly': readonly }"
    >
      <textarea
        :id="field.id.value"
        ref="textarea"
        v-model="model"
        v-bind="{ ...$attrs, class: undefined, style: undefined }"
        class="j-textarea__native"
        :class="{ 'is-autoresize': autoresize }"
        :rows="rows"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="field.invalid.value || undefined"
        :aria-describedby="field.describedBy.value"
      />
    </div>
  </JFieldShell>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-textarea {
  align-items: stretch;
  padding: 0;
  cursor: auto;
}

.j-textarea__native {
  display: block;
  width: 100%;
  min-height: calc(var(--juxt-control-md) * 2);
  padding: var(--juxt-space-2) var(--juxt-space-2-5);
  border: 0;
  border-radius: inherit;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: var(--juxt-leading-normal);
  letter-spacing: var(--juxt-tracking-tight);
  resize: vertical;
}

.j-textarea__native.is-autoresize {
  resize: none;
  overflow-y: hidden;
}

.j-textarea__native::placeholder {
  color: var(--juxt-fg-muted);
  opacity: 1;
}

.j-textarea__native:disabled {
  cursor: not-allowed;
  resize: none;
}
}
</style>
