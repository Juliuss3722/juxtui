<script setup lang="ts">
import { computed, ref, useId } from 'vue'

export interface SwitchProps {
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md'
  /** Submits `value` under `name` in a form when on. */
  name?: string
  value?: string
  id?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SwitchProps>(), { size: 'md', value: 'on' })
const model = defineModel<boolean>({ default: false })

defineSlots<{ default?: () => unknown, description?: () => unknown }>()

const generated = useId()
const id = computed(() => props.id ?? `j-${generated}`)
const labelId = computed(() => `${id.value}-label`)
const descriptionId = computed(() => `${id.value}-description`)
const button = ref<HTMLButtonElement | null>(null)

function toggle() {
  if (props.disabled) return
  model.value = !model.value
}

defineExpose({ focus: () => button.value?.focus() })
</script>

<template>
  <div
    class="j-switch"
    :class="[$attrs.class, `j-switch--${size}`, { 'is-disabled': disabled }]"
    :style="$attrs.style as any"
    :data-state="model ? 'on' : 'off'"
  >
    <button
      :id="id"
      ref="button"
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      type="button"
      role="switch"
      class="j-switch__track"
      :aria-checked="model"
      :aria-labelledby="label || $slots.default ? labelId : undefined"
      :aria-describedby="description || $slots.description ? descriptionId : undefined"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="j-switch__thumb" />
    </button>
    <input v-if="name && model" type="hidden" :name="name" :value="value" />
    <span v-if="label || $slots.default || description || $slots.description" class="j-switch__text">
      <label v-if="label || $slots.default" :id="labelId" :for="id" class="j-switch__label">
        <slot>{{ label }}</slot>
      </label>
      <span v-if="description || $slots.description" :id="descriptionId" class="j-switch__description">
        <slot name="description">{{ description }}</slot>
      </span>
    </span>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-switch {
  --j-switch-w: 2rem;
  --j-switch-h: 1.125rem;
  --j-switch-pad: 2px;
  --j-switch-thumb: calc(var(--j-switch-h) - var(--j-switch-pad) * 2);

  display: inline-flex;
  align-items: flex-start;
  gap: var(--juxt-space-2-5);
  font-family: var(--juxt-font-sans);
}

.j-switch--sm {
  --j-switch-w: 1.625rem;
  --j-switch-h: 0.9375rem;
}

.j-switch__track {
  position: relative;
  flex: none;
  width: var(--j-switch-w);
  height: var(--j-switch-h);
  margin: calc((var(--juxt-text-md) * var(--juxt-leading-snug) - var(--j-switch-h)) / 2) 0 0;
  padding: 0;
  border: 0;
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-border-strong);
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.08);
  cursor: pointer;
  outline: 2px solid transparent;
  outline-offset: 0;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--juxt-duration-normal) var(--juxt-ease-standard),
    outline-color var(--juxt-duration-fast) var(--juxt-ease-out),
    outline-offset var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-switch__track:hover:not(:disabled) {
  background: var(--juxt-fg-disabled);
}

.j-switch__track:focus-visible {
  outline-color: var(--juxt-ring);
  outline-offset: 2px;
}

.j-switch[data-state='on'] .j-switch__track {
  background: var(--juxt-accent);
}

.j-switch[data-state='on'] .j-switch__track:hover:not(:disabled) {
  background: var(--juxt-accent-hover);
}

.j-switch__thumb {
  position: absolute;
  top: var(--j-switch-pad);
  left: var(--j-switch-pad);
  width: var(--j-switch-thumb);
  height: var(--j-switch-thumb);
  border-radius: var(--juxt-radius-full);
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.2), 0 0 0 0.5px rgb(0 0 0 / 0.04);
  transition:
    transform var(--juxt-duration-normal) var(--juxt-ease-out),
    width var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-switch[data-state='on'] .j-switch__thumb {
  transform: translateX(calc(var(--j-switch-w) - var(--j-switch-thumb) - var(--j-switch-pad) * 2));
}

/* A whisper of stretch while pressed, so the thumb feels held. */
.j-switch__track:active:not(:disabled) .j-switch__thumb {
  width: calc(var(--j-switch-thumb) + 3px);
}

.j-switch[data-state='on'] .j-switch__track:active:not(:disabled) .j-switch__thumb {
  transform: translateX(calc(var(--j-switch-w) - var(--j-switch-thumb) - var(--j-switch-pad) * 2 - 3px));
}

@media (prefers-reduced-motion: reduce) {
  .j-switch__track:active:not(:disabled) .j-switch__thumb {
    width: var(--j-switch-thumb);
  }

  .j-switch[data-state='on'] .j-switch__track:active:not(:disabled) .j-switch__thumb {
    transform: translateX(calc(var(--j-switch-w) - var(--j-switch-thumb) - var(--j-switch-pad) * 2));
  }
}

.j-switch__text {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-0-5);
  min-width: 0;
}

.j-switch__label {
  color: var(--juxt-fg);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-snug);
  letter-spacing: var(--juxt-tracking-tight);
  cursor: pointer;
  user-select: none;
}

.j-switch__description {
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-normal);
}

.j-switch.is-disabled .j-switch__track {
  cursor: not-allowed;
  opacity: 0.5;
}

.j-switch.is-disabled .j-switch__label {
  color: var(--juxt-fg-muted);
  cursor: not-allowed;
}
}
</style>
