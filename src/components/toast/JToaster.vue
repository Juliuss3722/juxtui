<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatHotkey, useHotkey } from '../../composables/useHotkey'
import { toastState } from '../../composables/useToast'
import { focusElement, unrefElement } from '../../utils/dom'
import JToastItem from './JToastItem.vue'
import JPortal from '../primitives/JPortal.vue'

export type ToasterPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface ToasterProps {
  position?: ToasterPosition
  /** How many toasts are visible at once. Extra toasts wait their turn. */
  max?: number
  /** Shortcut that moves focus to the newest toast. */
  hotkey?: string
  /** Accessible name for the notification region. */
  label?: string
}

const props = withDefaults(defineProps<ToasterProps>(), {
  position: 'bottom-right',
  max: 4,
  hotkey: 'alt+t',
  label: 'Notifications',
})

const list = ref()
const hovered = ref(false)
const focused = ref(false)
const hidden = ref(false)
const paused = computed(() => hovered.value || focused.value || hidden.value)

const isTop = computed(() => props.position.startsWith('top'))

// Oldest first in the store; show the newest `max`, nearest the screen edge.
const visible = computed(() => {
  const items = toastState.toasts.slice(-props.max)
  return isTop.value ? items.reverse() : items
})

function dismiss(id: string) {
  const index = toastState.toasts.findIndex(t => t.id === id)
  if (index === -1) return
  const [removed] = toastState.toasts.splice(index, 1)
  removed?.onDismiss?.()
}

const hotkeyLabel = ref('')
onMounted(() => (hotkeyLabel.value = formatHotkey(props.hotkey).join('+')))

useHotkey(() => props.hotkey, () => {
  const items = unrefElement(list.value)?.querySelectorAll<HTMLElement>('.j-toast')
  if (!items?.length) return
  focusElement(isTop.value ? items[0] : items[items.length - 1])
})

function onVisibility() {
  hidden.value = document.visibilityState === 'hidden'
}
onMounted(() => document.addEventListener('visibilitychange', onVisibility))
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisibility))

function onFocusOut(event: FocusEvent) {
  const current = event.currentTarget as HTMLElement
  if (!current.contains(event.relatedTarget as Node | null)) focused.value = false
}
</script>

<template>
  <JPortal>
    <section
      class="j-toaster"
      :class="`j-toaster--${position}`"
      :aria-label="hotkeyLabel ? `${label} (${hotkeyLabel})` : label"
      data-juxt-layer-ignore
    >
      <TransitionGroup
        ref="list"
        tag="ol"
        name="j-toast"
        class="j-toaster__list"
        aria-live="polite"
        aria-relevant="additions text"
        @pointerenter="hovered = true"
        @pointerleave="hovered = false"
        @focusin="focused = true"
        @focusout="onFocusOut"
      >
        <JToastItem
          v-for="item in visible"
          :key="item.id"
          :toast="item"
          :paused="paused"
          @dismiss="dismiss"
        />
      </TransitionGroup>
    </section>
  </JPortal>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-toaster {
  --j-toast-width: 22.5rem;
  --j-toast-edge: var(--juxt-space-4);

  position: fixed;
  z-index: var(--juxt-z-toast);
  width: var(--j-toast-width);
  max-width: calc(100vw - var(--j-toast-edge) * 2);
  pointer-events: none;
}

.j-toaster--top-left,
.j-toaster--top-center,
.j-toaster--top-right {
  top: max(var(--j-toast-edge), env(safe-area-inset-top));
}

.j-toaster--bottom-left,
.j-toaster--bottom-center,
.j-toaster--bottom-right {
  bottom: max(var(--j-toast-edge), env(safe-area-inset-bottom));
}

.j-toaster--top-left,
.j-toaster--bottom-left {
  left: var(--j-toast-edge);
}

.j-toaster--top-right,
.j-toaster--bottom-right {
  right: calc(var(--j-toast-edge) + var(--juxt-scrollbar-width, 0px));
}

.j-toaster--top-center,
.j-toaster--bottom-center {
  left: 50%;
  transform: translateX(-50%);
}

.j-toaster__list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.j-toast {
  --j-toast-enter: calc(var(--juxt-motion-shift) * 3);

  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--juxt-space-2-5);
  box-sizing: border-box;
  width: 100%;
  padding: var(--juxt-space-3) var(--juxt-space-10) var(--juxt-space-3) var(--juxt-space-3);
  overflow: hidden;
  border: 1px solid var(--juxt-border);
  border-radius: var(--juxt-radius-md);
  background: var(--juxt-surface-raised);
  box-shadow: var(--juxt-shadow-md);
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
  pointer-events: auto;
  opacity: var(--j-toast-swipe-opacity, 1);
  transform: translateX(var(--j-toast-swipe, 0));
  outline: 2px solid transparent;
  outline-offset: 0;
  touch-action: pan-y;
  transition:
    transform var(--juxt-duration-slow) var(--juxt-ease-out),
    opacity var(--juxt-duration-normal) var(--juxt-ease-out),
    outline-color var(--juxt-duration-fast) var(--juxt-ease-out),
    outline-offset var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-toaster--top-left .j-toast,
.j-toaster--top-center .j-toast,
.j-toaster--top-right .j-toast {
  --j-toast-enter: calc(var(--juxt-motion-shift) * -3);
}

.j-toast.is-swiping {
  transition: none;
  user-select: none;
}

.j-toast:focus-visible {
  outline-color: var(--juxt-ring);
  outline-offset: 2px;
}

.j-toast__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 1rem;
  height: 1.25rem;
}

.j-toast__icon > svg {
  width: 1rem;
  height: 1rem;
}

.j-toast--success .j-toast__icon {
  color: var(--juxt-success-text);
}

.j-toast--error .j-toast__icon {
  color: var(--juxt-danger-text);
}

.j-toast--warning .j-toast__icon {
  color: var(--juxt-warning-text);
}

.j-toast--info .j-toast__icon {
  color: var(--juxt-info-text);
}

.j-toast--loading .j-toast__icon {
  color: var(--juxt-fg-muted);
}

.j-toast__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--juxt-space-0-5);
  min-width: 0;
}

.j-toast__title {
  margin: 0;
  font-size: var(--juxt-text-md);
  font-weight: var(--juxt-weight-medium);
  line-height: 1.25rem;
  letter-spacing: var(--juxt-tracking-tight);
}

.j-toast__description {
  margin: 0;
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-normal);
}

.j-toast__actions {
  display: flex;
  gap: var(--juxt-space-2);
  margin-top: var(--juxt-space-2);
}

.j-toast__action {
  height: var(--juxt-control-xs);
  padding: 0 var(--juxt-space-2);
  border: 1px solid var(--juxt-border);
  border-radius: var(--juxt-radius-xs);
  background: var(--juxt-surface);
  color: var(--juxt-fg);
  font: inherit;
  font-size: var(--juxt-text-xs);
  font-weight: var(--juxt-weight-medium);
  cursor: pointer;
  transition-property: background-color, border-color, outline-color, outline-offset;
}

.j-toast__action:hover {
  border-color: var(--juxt-border-strong);
  background: var(--juxt-surface-hover);
}

.j-toast__close {
  position: absolute;
  top: var(--juxt-space-2-5);
  right: var(--juxt-space-2-5);
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: 0;
  border-radius: var(--juxt-radius-xs);
  background: transparent;
  color: var(--juxt-fg-muted);
  cursor: pointer;
  transition-property: background-color, color, outline-color, outline-offset;
}

.j-toast__close:hover {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
}

.j-toast__close > svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Remaining time, drawn as a hairline that drains toward the start. */
.j-toast__progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--juxt-border-strong);
  opacity: 0.6;
  transform-origin: left;
  animation: j-toast-progress linear forwards;
}

.j-toast--success .j-toast__progress {
  background: var(--juxt-accent-border);
}

.j-toast__progress.is-paused {
  animation-play-state: paused;
}

@keyframes j-toast-progress {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}

/* List motion */
.j-toast-enter-from {
  opacity: 0;
  transform: translateY(var(--j-toast-enter)) scale(0.98);
}

.j-toast-leave-active {
  position: absolute;
  width: 100%;
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-in),
    transform var(--juxt-duration-normal) var(--juxt-ease-in);
}

.j-toast-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.j-toast-leave-to.is-swiped {
  transform: translateX(calc(var(--j-toast-width) * var(--j-swipe-sign, 1)));
}

.j-toast-leave-to.is-swiped[data-swipe-direction='-1'] {
  --j-swipe-sign: -1;
}

.j-toast-move {
  transition: transform var(--juxt-duration-slow) var(--juxt-ease-out);
}

.j-toast-icon-enter-active,
.j-toast-icon-leave-active {
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-out),
    transform var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-toast-icon-enter-from,
.j-toast-icon-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

@media (max-width: 639px) {
  .j-toaster {
    --j-toast-edge: var(--juxt-space-2);

    right: var(--j-toast-edge);
    left: var(--j-toast-edge);
    width: auto;
    max-width: none;
    transform: none;
  }
}
}
</style>
