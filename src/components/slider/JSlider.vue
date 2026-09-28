<script setup lang="ts">
import { computed, ref } from 'vue'

export interface SliderProps {
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** Accessible name for the thumb(s) when no visible label is associated. */
  label?: string
  size?: 'sm' | 'md'
  /** Show the current value in a floating bubble above the active thumb. */
  showValue?: boolean
  /** Format the displayed and announced value. */
  format?: (value: number) => string
}

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  size: 'md',
})

/** A single value, or a `[low, high]` tuple for a range slider. */
const model = defineModel<number | [number, number]>({ default: 0 })

const track = ref<HTMLElement | null>(null)
const activeThumb = ref<number | null>(null)

const isRange = computed(() => Array.isArray(model.value))
const values = computed<number[]>(() => (Array.isArray(model.value) ? model.value : [model.value as number]))

function clamp(value: number) {
  const stepped = Math.round((value - props.min) / props.step) * props.step + props.min
  const rounded = Number(stepped.toFixed(6))
  return Math.min(props.max, Math.max(props.min, rounded))
}

function setValue(index: number, raw: number) {
  if (props.disabled) return
  const next = [...values.value]
  let value = clamp(raw)
  if (isRange.value) {
    const lower = index === 0 ? props.min : next[index - 1]!
    const upper = index === next.length - 1 ? props.max : next[index + 1]!
    value = Math.min(upper, Math.max(lower, value))
  }
  next[index] = value
  model.value = isRange.value ? ([next[0]!, next[1]!] as [number, number]) : next[0]!
}

function percent(value: number) {
  if (props.max === props.min) return 0
  return ((value - props.min) / (props.max - props.min)) * 100
}

function valueFromClientX(clientX: number): number {
  const rect = track.value!.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  return props.min + ratio * (props.max - props.min)
}

function nearestThumb(value: number) {
  let nearest = 0
  let best = Infinity
  values.value.forEach((v, i) => {
    const dist = Math.abs(v - value)
    if (dist < best) {
      best = dist
      nearest = i
    }
  })
  return nearest
}

function onPointerMove(event: PointerEvent) {
  if (activeThumb.value === null) return
  setValue(activeThumb.value, valueFromClientX(event.clientX))
}

function onPointerUp() {
  activeThumb.value = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

function startDrag(index: number) {
  activeThumb.value = index
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onTrackPointerDown(event: PointerEvent) {
  if (props.disabled) return
  const value = valueFromClientX(event.clientX)
  const index = nearestThumb(value)
  setValue(index, value)
  startDrag(index)
}

function onThumbPointerDown(index: number, event: PointerEvent) {
  if (props.disabled) return
  event.stopPropagation()
  ;(event.currentTarget as HTMLElement).focus()
  startDrag(index)
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (props.disabled) return
  const big = props.step * 10 || (props.max - props.min) / 10
  const current = values.value[index]!
  let next: number | undefined
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = current + props.step
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = current - props.step
  else if (event.key === 'PageUp') next = current + big
  else if (event.key === 'PageDown') next = current - big
  else if (event.key === 'Home') next = props.min
  else if (event.key === 'End') next = props.max
  if (next === undefined) return
  event.preventDefault()
  setValue(index, next)
}

function display(value: number) {
  return props.format ? props.format(value) : String(Math.round(value * 100) / 100)
}

const fillStyle = computed(() => {
  if (isRange.value) {
    const [a, b] = values.value
    return { left: `${percent(a!)}%`, width: `${Math.max(0, percent(b!) - percent(a!))}%` }
  }
  return { left: '0%', width: `${percent(values.value[0]!)}%` }
})
</script>

<template>
  <div class="j-slider" :class="[`j-slider--${size}`, { 'is-disabled': disabled }]">
    <div ref="track" class="j-slider__track" @pointerdown="onTrackPointerDown">
      <span class="j-slider__range" :style="fillStyle" />
      <span
        v-for="(value, index) in values"
        :key="index"
        class="j-slider__thumb j-focusable"
        :class="{ 'is-dragging': activeThumb === index }"
        role="slider"
        :tabindex="disabled ? -1 : 0"
        :aria-label="label"
        :aria-orientation="'horizontal'"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="value"
        :aria-valuetext="display(value)"
        :aria-disabled="disabled || undefined"
        :style="{ left: `${percent(value)}%` }"
        @pointerdown="onThumbPointerDown(index, $event)"
        @keydown="onKeydown(index, $event)"
      >
        <span v-if="showValue" class="j-slider__bubble">{{ display(value) }}</span>
      </span>
    </div>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-slider {
  --j-slider-track: 0.25rem;
  --j-slider-thumb: 1rem;

  display: flex;
  align-items: center;
  width: 100%;
  padding: calc(var(--j-slider-thumb) / 2) 0;
  font-family: var(--juxt-font-sans);
  touch-action: none;
}

.j-slider--sm {
  --j-slider-track: 0.1875rem;
  --j-slider-thumb: 0.875rem;
}

.j-slider__track {
  position: relative;
  width: 100%;
  height: var(--j-slider-track);
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-surface-active);
  cursor: pointer;
}

.j-slider.is-disabled .j-slider__track {
  cursor: not-allowed;
  opacity: 0.5;
}

.j-slider__range {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-accent);
}

.j-slider__thumb {
  position: absolute;
  top: 50%;
  width: var(--j-slider-thumb);
  height: var(--j-slider-thumb);
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-surface);
  box-shadow: 0 0 0 1px var(--juxt-border-strong), var(--juxt-shadow-sm);
  cursor: grab;
  transform: translate(-50%, -50%);
  transition:
    box-shadow var(--juxt-duration-fast) var(--juxt-ease-out),
    left var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-slider__thumb.is-dragging {
  cursor: grabbing;
  transition: none;
}

.j-slider__thumb:hover {
  box-shadow: 0 0 0 1px var(--juxt-accent), var(--juxt-shadow-sm);
}

.j-slider__thumb:focus-visible {
  outline-color: var(--juxt-ring);
  outline-offset: 3px;
}

.j-slider.is-disabled .j-slider__thumb {
  cursor: not-allowed;
}

.j-slider__bubble {
  position: absolute;
  bottom: calc(100% + var(--juxt-space-2));
  left: 50%;
  padding: var(--juxt-space-0-5) var(--juxt-space-1-5);
  border-radius: var(--juxt-radius-xs);
  background: var(--juxt-tooltip-bg);
  color: var(--juxt-tooltip-fg);
  font-size: var(--juxt-text-2xs);
  font-weight: var(--juxt-weight-medium);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: none;
  transform: translateX(-50%);
}

@media (prefers-reduced-motion: reduce) {
  .j-slider__thumb {
    transition: none;
  }
}
}
</style>
