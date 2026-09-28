<script setup lang="ts">
import { computed, ref } from 'vue'

export interface RatingProps {
  /** Number of stars. */
  max?: number
  /** Static display mode | no interaction, ideal for showing an average. */
  readonly?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Accessible name for the group, e.g. "Rate this product". */
  label?: string
  /** Allow half-star precision. Only applies in `readonly` mode. */
  allowHalf?: boolean
}

const props = withDefaults(defineProps<RatingProps>(), { max: 5, size: 'md' })

const model = defineModel<number>({ default: 0 })

const hovered = ref<number | null>(null)
const stars = computed(() => Array.from({ length: props.max }, (_, i) => i + 1))
const display = computed(() => hovered.value ?? model.value)

function fillFor(star: number) {
  const value = display.value
  if (value >= star) return 1
  if (props.readonly && props.allowHalf && value >= star - 0.5) return 0.5
  return 0
}

function select(star: number) {
  if (props.readonly || props.disabled) return
  model.value = star
}

function onKeydown(event: KeyboardEvent) {
  if (props.readonly || props.disabled) return
  let next: number | undefined
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(props.max, model.value + 1)
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(0, model.value - 1)
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = props.max
  if (next === undefined) return
  event.preventDefault()
  model.value = next
}

const groupLabel = computed(() => props.label ?? (props.readonly ? `${model.value} out of ${props.max} stars` : 'Rating'))
</script>

<template>
  <div
    class="j-rating"
    :class="[`j-rating--${size}`, { 'is-readonly': readonly, 'is-disabled': disabled }]"
    :role="readonly ? 'img' : 'radiogroup'"
    :aria-label="groupLabel"
    :aria-disabled="disabled || undefined"
    @mouseleave="hovered = null"
  >
    <template v-if="readonly">
      <span v-for="star in stars" :key="star" class="j-rating__star" aria-hidden="true">
        <svg viewBox="0 0 16 16" class="j-rating__star-bg"><path d="M8 1.5l1.98 4.01 4.42.64-3.2 3.12.76 4.4L8 11.6l-3.96 2.08.76-4.4-3.2-3.12 4.42-.64z" /></svg>
        <span class="j-rating__star-fill" :style="{ width: `${fillFor(star) * 100}%` }">
          <svg viewBox="0 0 16 16"><path d="M8 1.5l1.98 4.01 4.42.64-3.2 3.12.76 4.4L8 11.6l-3.96 2.08.76-4.4-3.2-3.12 4.42-.64z" /></svg>
        </span>
      </span>
    </template>
    <template v-else>
      <button
        v-for="star in stars"
        :key="star"
        type="button"
        role="radio"
        class="j-rating__button j-focusable"
        :aria-checked="model === star"
        :aria-label="`${star} ${star === 1 ? 'star' : 'stars'}`"
        :tabindex="disabled ? -1 : (model === star || (model === 0 && star === 1)) ? 0 : -1"
        :disabled="disabled"
        @click="select(star)"
        @mouseenter="hovered = star"
        @focus="hovered = star"
        @blur="hovered = null"
        @keydown="onKeydown"
      >
        <svg viewBox="0 0 16 16" class="j-rating__star-bg"><path d="M8 1.5l1.98 4.01 4.42.64-3.2 3.12.76 4.4L8 11.6l-3.96 2.08.76-4.4-3.2-3.12 4.42-.64z" /></svg>
        <span class="j-rating__star-fill" :style="{ width: `${fillFor(star) * 100}%` }">
          <svg viewBox="0 0 16 16"><path d="M8 1.5l1.98 4.01 4.42.64-3.2 3.12.76 4.4L8 11.6l-3.96 2.08.76-4.4-3.2-3.12 4.42-.64z" /></svg>
        </span>
      </button>
    </template>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-rating {
  --j-rating-size: 1.25rem;

  display: inline-flex;
  align-items: center;
  gap: var(--juxt-space-0-5);
  font-family: var(--juxt-font-sans);
}

.j-rating--sm {
  --j-rating-size: 1rem;
}

.j-rating--lg {
  --j-rating-size: 1.5rem;
}

.j-rating__star,
.j-rating__button {
  position: relative;
  display: inline-flex;
  flex: none;
  width: var(--j-rating-size);
  height: var(--j-rating-size);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--juxt-fg-disabled);
  cursor: default;
}

.j-rating__button {
  border-radius: var(--juxt-radius-xs);
  cursor: pointer;
  transition: transform var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-rating__button:hover:not(:disabled) {
  transform: scale(1.1);
}

.j-rating__button:disabled {
  cursor: not-allowed;
}

.j-rating.is-disabled .j-rating__button {
  opacity: 0.5;
}

.j-rating__star-bg,
.j-rating__star-fill > svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: currentColor;
  stroke: none;
}

.j-rating__star-fill {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: var(--juxt-warning);
  transition: width var(--juxt-duration-fast) var(--juxt-ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .j-rating__button:hover:not(:disabled) {
    transform: none;
  }

  .j-rating__star-fill {
    transition: none;
  }
}
}
</style>
