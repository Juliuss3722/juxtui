<script lang="ts">
// Shared across every tooltip: once one has been shown, neighbours open
// instantly for a moment. Scanning a toolbar shouldn't mean waiting at each icon.
let warmUntil = 0
const WARM_WINDOW = 400
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import { useFloating } from '../../composables/useFloating'
import { useLayer } from '../../composables/useLayer'
import { unrefElement } from '../../utils/dom'
import { JSlot } from '../primitives/JSlot'
import JPortal from '../primitives/JPortal.vue'

export interface TooltipProps {
  /** Tooltip text. Use the `content` slot for richer content. */
  content?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  /** Hover delay before opening, in ms. Keyboard focus opens immediately. */
  delay?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<TooltipProps>(), {
  side: 'top',
  align: 'center',
  delay: 450,
})

defineSlots<{
  default?: () => unknown
  content?: () => unknown
}>()

const id = `j-${useId()}-tooltip`
const open = ref(false)
const triggerRef = ref()
const triggerEl = computed(() => unrefElement(triggerRef.value))
const floating = ref<HTMLElement | null>(null)

const placement = computed(() => (props.align === 'center' ? props.side : `${props.side}-${props.align}` as const))
const { styles } = useFloating(triggerEl, floating, () => ({ placement: placement.value, offset: 6 }))

useLayer({
  active: open,
  elements: () => [triggerEl.value, floating.value],
  onEscape: () => hide(true),
})

let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined
// After a click, stay quiet until the pointer leaves | the user is acting, not reading.
let suppressed = false

function show(immediate = false) {
  if (props.disabled || suppressed) return
  clearTimeout(closeTimer)
  if (open.value) return
  clearTimeout(openTimer)
  if (immediate || Date.now() < warmUntil) open.value = true
  else openTimer = setTimeout(() => (open.value = true), props.delay)
}

function hide(immediate = false) {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  const close = () => {
    if (open.value) warmUntil = Date.now() + WARM_WINDOW
    open.value = false
  }
  if (immediate) close()
  // A short grace period lets the pointer travel onto the tooltip itself.
  else closeTimer = setTimeout(close, 80)
}

onBeforeUnmount(() => {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
})

const triggerProps = computed(() => ({
  'aria-describedby': props.disabled ? undefined : id,
  'onPointerenter': (event: PointerEvent) => event.pointerType === 'mouse' && show(),
  'onPointerleave': (event: PointerEvent) => {
    suppressed = false
    if (event.pointerType === 'mouse') hide()
  },
  'onPointerdown': () => {
    suppressed = true
    hide(true)
  },
  'onFocus': (event: FocusEvent) => {
    const target = event.target as HTMLElement
    if (target.matches(':focus-visible')) show(true)
  },
  'onBlur': () => hide(true),
}))
</script>

<template>
  <JSlot ref="triggerRef" v-bind="triggerProps">
    <slot />
  </JSlot>
  <span v-if="!disabled" :id="id" class="j-sr-only">
    <slot name="content">{{ content }}</slot>
  </span>
  <JPortal>
    <Transition name="j-tooltip">
      <div
        v-if="open"
        ref="floating"
        class="j-tooltip"
        :style="styles"
        aria-hidden="true"
        data-juxt-layer-ignore
        @pointerenter="show(true)"
        @pointerleave="hide()"
      >
        <slot name="content">
          {{ content }}
        </slot>
      </div>
    </Transition>
  </JPortal>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-tooltip {
  z-index: var(--juxt-z-tooltip);
  box-sizing: border-box;
  max-width: min(17.5rem, calc(100vw - 16px));
  padding: var(--juxt-space-1) var(--juxt-space-2);
  border: 1px solid var(--juxt-tooltip-border);
  border-radius: var(--juxt-radius-sm);
  background: var(--juxt-tooltip-bg);
  box-shadow: var(--juxt-shadow-sm);
  color: var(--juxt-tooltip-fg);
  font-family: var(--juxt-font-sans);
  font-size: var(--juxt-text-xs);
  font-weight: var(--juxt-weight-medium);
  line-height: var(--juxt-leading-snug);
  letter-spacing: 0;
  overflow-wrap: break-word;
  pointer-events: auto;
}

.j-tooltip .j-kbd {
  height: 1rem;
  min-width: 1rem;
  margin-left: var(--juxt-space-1);
  border-color: rgb(255 255 255 / 0.14);
  background: rgb(255 255 255 / 0.08);
  color: rgb(255 255 255 / 0.72);
}

.j-tooltip-enter-active {
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-out),
    transform var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-tooltip-leave-active {
  transition: opacity var(--juxt-duration-instant) var(--juxt-ease-in);
}

.j-tooltip-enter-from,
.j-tooltip-leave-to {
  opacity: 0;
}

.j-tooltip-enter-from {
  transform: translate(
    calc(var(--juxt-motion-shift) * 0.5 * var(--j-pop-x, 0)),
    calc(var(--juxt-motion-shift) * 0.5 * var(--j-pop-dir, 0))
  );
}
}
</style>
