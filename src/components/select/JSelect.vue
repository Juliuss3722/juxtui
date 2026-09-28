<script setup lang="ts" generic="T extends string | number = string">
import type { FieldProps } from '../field/useField'
import { computed, nextTick, ref, watch } from 'vue'
import { useFloating } from '../../composables/useFloating'
import { useLayer } from '../../composables/useLayer'
import { useTypeahead } from '../../composables/useTypeahead'
import { IconCheck, IconChevronUpDown } from '../../icons'
import JFieldShell from '../field/JFieldShell.vue'
import { useField } from '../field/useField'
import JPortal from '../primitives/JPortal.vue'

export interface SelectOption<V = string | number> {
  value: V
  label: string
  description?: string
  disabled?: boolean
}

export interface SelectProps<V> extends FieldProps {
  /** Options as objects, or plain strings when value and label are the same. */
  options: Array<SelectOption<V> | V>
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  /** Submits the value under this name in a form. */
  name?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SelectProps<T>>(), {
  placeholder: 'Select…',
  size: 'md',
  error: undefined,
})

const model = defineModel<T | null>({ default: null })

const emit = defineEmits<{
  open: []
  close: []
}>()

defineSlots<{
  option?: (props: { option: SelectOption<T>, selected: boolean, active: boolean }) => unknown
  value?: (props: { option: SelectOption<T> }) => unknown
  label?: () => unknown
}>()

const field = useField(props)
const listboxId = computed(() => `${field.id.value}-listbox`)
const valueId = computed(() => `${field.id.value}-value`)
const optionId = (index: number) => `${field.id.value}-option-${index}`

const normalized = computed<SelectOption<T>[]>(() =>
  props.options.map(option =>
    typeof option === 'object' && option !== null ? option : { value: option as T, label: String(option) },
  ),
)

/*
 * The list the user sees and navigates. Today it's every option; a search
 * input only needs to set `query` for this to become a filtered view.
 */
const query = ref('')
const visibleOptions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return normalized.value
  return normalized.value.filter(option => option.label.toLowerCase().includes(q))
})

const selected = computed(() => normalized.value.find(option => option.value === model.value))

const open = ref(false)
const activeIndex = ref(-1)
const trigger = ref<HTMLButtonElement | null>(null)
const listbox = ref<HTMLElement | null>(null)
const pointerActive = ref(false)

const { styles } = useFloating(trigger, listbox, { placement: 'bottom-start', offset: 4, matchWidth: true })
const typeahead = useTypeahead()

useLayer({
  active: open,
  elements: () => [trigger.value, listbox.value],
  onEscape: () => close(),
  onPointerDownOutside: () => close(),
})

const isEnabled = (index: number) => {
  const option = visibleOptions.value[index]
  return !!option && !option.disabled
}

function step(from: number, delta: 1 | -1): number {
  const count = visibleOptions.value.length
  for (let i = from + delta; i >= 0 && i < count; i += delta) {
    if (isEnabled(i)) return i
  }
  return from
}

const first = () => step(-1, 1)
const last = () => step(visibleOptions.value.length, -1)

function setActive(index: number, scroll = true) {
  activeIndex.value = index
  if (!scroll) return
  nextTick(() => {
    document.getElementById(optionId(index))?.scrollIntoView({ block: 'nearest' })
  })
}

function openList(focus: 'selected' | 'first' | 'last' = 'selected') {
  if (props.disabled || open.value) return
  open.value = true
  emit('open')
  const selectedIndex = visibleOptions.value.findIndex(option => option.value === model.value)
  const target = focus === 'last' ? last() : focus === 'first' ? first() : selectedIndex >= 0 ? selectedIndex : first()
  setActive(target)
}

function close() {
  if (!open.value) return
  open.value = false
  pointerActive.value = false
  emit('close')
}

function commit(index: number) {
  const option = visibleOptions.value[index]
  if (!option || option.disabled) return
  model.value = option.value
  close()
}

function onTriggerClick() {
  if (open.value) close()
  else openList()
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const { key } = event

  if (!open.value) {
    if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
      event.preventDefault()
      openList()
    } else if (key === 'ArrowUp') {
      event.preventDefault()
      openList()
    } else if (key === 'Home') {
      event.preventDefault()
      openList('first')
    } else if (key === 'End') {
      event.preventDefault()
      openList('last')
    } else if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const index = typeahead.search(key, visibleOptions.value, option => option.label, activeIndex.value)
      if (index >= 0) {
        openList()
        setActive(index)
      }
    }
    return
  }

  switch (key) {
    case 'ArrowDown':
      event.preventDefault()
      if (event.altKey) return
      setActive(step(activeIndex.value, 1))
      break
    case 'ArrowUp':
      event.preventDefault()
      if (event.altKey) return commit(activeIndex.value)
      setActive(step(activeIndex.value, -1))
      break
    case 'Home':
      event.preventDefault()
      setActive(first())
      break
    case 'End':
      event.preventDefault()
      setActive(last())
      break
    case 'PageDown':
      event.preventDefault()
      setActive(Math.min(last(), step(Math.min(activeIndex.value + 9, visibleOptions.value.length - 1), 1)))
      break
    case 'PageUp':
      event.preventDefault()
      setActive(Math.max(first(), step(Math.max(activeIndex.value - 9, 0), -1)))
      break
    case 'Enter':
      event.preventDefault()
      commit(activeIndex.value)
      break
    case 'Tab':
      commit(activeIndex.value)
      close()
      break
    case ' ':
      event.preventDefault()
      if (typeahead.isSearching()) typeahead.search(key, visibleOptions.value, option => option.label, activeIndex.value)
      else commit(activeIndex.value)
      break
    default:
      if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const index = typeahead.search(key, visibleOptions.value, option => option.label, activeIndex.value)
        if (index >= 0) setActive(index)
      }
  }
}

// Only let the pointer steer the active option once it actually moves, so a
// list opening under a resting cursor doesn't hijack the keyboard position.
function onOptionPointerMove(index: number) {
  pointerActive.value = true
  if (activeIndex.value !== index && isEnabled(index)) setActive(index, false)
}

watch(() => props.disabled, value => value && close())

defineExpose({ focus: () => trigger.value?.focus(), open: () => openList(), close })
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
    <button
      :id="field.id.value"
      ref="trigger"
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      type="button"
      role="combobox"
      class="j-control j-select__trigger"
      :class="[`j-control--${size}`, { 'is-open': open, 'is-invalid': field.invalid.value, 'is-disabled': disabled }]"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? listboxId : undefined"
      :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
      :aria-labelledby="label || $slots.label ? `${field.labelId.value} ${valueId}` : undefined"
      :aria-describedby="field.describedBy.value"
      :aria-invalid="field.invalid.value || undefined"
      :aria-required="required || undefined"
      :disabled="disabled"
      @click="onTriggerClick"
      @keydown="onKeydown"
    >
      <span :id="valueId" class="j-select__value" :class="{ 'is-placeholder': !selected }">
        <slot v-if="selected" name="value" :option="selected">{{ selected.label }}</slot>
        <template v-else>{{ placeholder }}</template>
      </span>
      <IconChevronUpDown class="j-select__chevron" />
    </button>
    <input v-if="name" type="hidden" :name="name" :value="model ?? ''" />

    <JPortal>
      <Transition name="j-pop">
        <ul
          v-if="open"
          :id="listboxId"
          ref="listbox"
          role="listbox"
          class="j-select__listbox j-popover-surface"
          :class="{ 'is-pointer': pointerActive }"
          :style="styles"
          :aria-labelledby="label ? field.labelId.value : undefined"
          tabindex="-1"
          @pointerdown.prevent
        >
          <li
            v-for="(option, index) in visibleOptions"
            :id="optionId(index)"
            :key="String(option.value)"
            role="option"
            class="j-select__option"
            :class="{ 'is-active': index === activeIndex, 'is-selected': option.value === model }"
            :aria-selected="option.value === model"
            :aria-disabled="option.disabled || undefined"
            @pointermove="onOptionPointerMove(index)"
            @click="commit(index)"
          >
            <span class="j-select__option-text">
              <slot name="option" :option="option" :selected="option.value === model" :active="index === activeIndex">
                <span class="j-select__option-label">{{ option.label }}</span>
                <span v-if="option.description" class="j-select__option-description">{{ option.description }}</span>
              </slot>
            </span>
            <IconCheck class="j-select__check" />
          </li>
          <li v-if="visibleOptions.length === 0" class="j-select__empty" role="presentation">
            No options
          </li>
        </ul>
      </Transition>
    </JPortal>
  </JFieldShell>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-select__trigger {
  width: 100%;
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.j-select__trigger:focus-visible {
  outline: none;
}

.j-select__trigger:focus-visible:not(.is-invalid) {
  border-color: var(--juxt-accent);
  box-shadow: 0 0 0 3px var(--juxt-ring-soft);
}

.j-select__trigger:disabled {
  cursor: not-allowed;
}

.j-select__value {
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: var(--juxt-tracking-tight);
}

.j-select__value.is-placeholder {
  color: var(--juxt-fg-muted);
}

.j-select__trigger.is-disabled .j-select__value {
  color: var(--juxt-fg-disabled);
}

.j-select__chevron {
  flex: none;
  width: 0.875rem;
  height: 0.875rem;
  margin-right: -0.125rem;
  color: var(--juxt-fg-muted);
}

.j-select__listbox {
  z-index: var(--juxt-z-popover);
  box-sizing: border-box;
  max-width: calc(100vw - 16px);
  max-height: min(18rem, var(--j-available-height, 18rem));
  margin: 0;
  padding: var(--juxt-space-1);
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  outline: none;
  scroll-padding-block: var(--juxt-space-1);
}

.j-select__option {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--juxt-space-2);
  min-height: var(--juxt-control-sm);
  padding: var(--juxt-space-1-5) var(--juxt-space-2);
  border-radius: var(--juxt-radius-xs);
  color: var(--juxt-fg);
  font-size: var(--juxt-text-md);
  letter-spacing: var(--juxt-tracking-tight);
  cursor: pointer;
  user-select: none;
}

.j-select__option.is-active {
  background: var(--juxt-surface-hover);
}

.j-select__option[aria-disabled='true'] {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-select__option-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.j-select__option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.j-select__option-description {
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
}

.j-select__check {
  flex: none;
  width: 0.875rem;
  height: 0.875rem;
  color: var(--juxt-accent-text);
  opacity: 0;
  transform: scale(0.8);
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-out),
    transform var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-select__option.is-selected .j-select__check {
  opacity: 1;
  transform: none;
}

.j-select__empty {
  padding: var(--juxt-space-3) var(--juxt-space-2);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  text-align: center;
}
}
</style>
