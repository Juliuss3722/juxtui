<script setup lang="ts">
import { ref, useId } from 'vue'
import { FIELD_SELECTOR, useModal } from '../../composables/useModal'
import { IconX } from '../../icons'
import JPortal from '../primitives/JPortal.vue'

export interface SheetProps {
  title?: string
  description?: string
  /** Edge the sheet slides in from. */
  side?: 'right' | 'left' | 'bottom'
  /** Width (or height for `bottom`): 320, 400 or 560px. */
  size?: 'sm' | 'md' | 'lg'
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  hideClose?: boolean
  /** Accessible label when there is no visible title. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<SheetProps>(), {
  side: 'right',
  size: 'md',
  closeOnOverlay: true,
  closeOnEscape: true,
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** After the leave transition finishes. */
  afterClose: []
}>()

defineSlots<{
  default?: (props: { close: () => void }) => unknown
  header?: (props: { titleId: string, descriptionId: string }) => unknown
  footer?: (props: { close: () => void }) => unknown
}>()

const id = useId()
const titleId = `j-${id}-title`
const descriptionId = `j-${id}-description`
const panel = ref<HTMLElement | null>(null)

function close() {
  open.value = false
}

const { nudging, onBackdropPointerDown, onBackdropClick } = useModal(panel, open, {
  closeOnEscape: () => props.closeOnEscape,
  closeOnOverlay: () => props.closeOnOverlay,
  close,
  focusSelector: `.j-sheet__body ${FIELD_SELECTOR}`,
})

defineExpose({ close })
</script>

<template>
  <JPortal>
    <Transition name="j-sheet-overlay">
      <div v-if="open" class="j-sheet__overlay" aria-hidden="true" />
    </Transition>
    <Transition name="j-sheet" :duration="{ enter: 280, leave: 180 }" @after-leave="emit('afterClose')">
      <div
        v-if="open"
        class="j-sheet__positioner"
        :class="`j-sheet__positioner--${side}`"
        @pointerdown="onBackdropPointerDown"
        @click="onBackdropClick"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="j-sheet"
          :class="[`j-sheet--${side}`, `j-sheet--${size}`, { 'is-nudging': nudging }]"
          :aria-labelledby="title || $slots.header ? titleId : undefined"
          :aria-label="ariaLabel"
          :aria-describedby="description ? descriptionId : undefined"
          @animationend="nudging = false"
        >
          <header v-if="title || description || $slots.header" class="j-sheet__header">
            <slot name="header" :title-id="titleId" :description-id="descriptionId">
              <h2 :id="titleId" class="j-sheet__title">
                {{ title }}
              </h2>
              <p v-if="description" :id="descriptionId" class="j-sheet__description">
                {{ description }}
              </p>
            </slot>
          </header>
          <div class="j-sheet__body">
            <slot :close="close" />
          </div>
          <footer v-if="$slots.footer" class="j-sheet__footer">
            <slot name="footer" :close="close" />
          </footer>
          <button v-if="!hideClose" type="button" class="j-sheet__close j-focusable" aria-label="Close" @click="close">
            <IconX />
          </button>
        </div>
      </div>
    </Transition>
  </JPortal>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-sheet__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--juxt-z-overlay);
  background: var(--juxt-overlay);
}

.j-sheet__positioner {
  position: fixed;
  inset: 0;
  z-index: var(--juxt-z-modal);
  display: flex;
  padding: var(--juxt-space-2);
}

.j-sheet__positioner--right {
  justify-content: flex-end;
}

.j-sheet__positioner--left {
  justify-content: flex-start;
}

.j-sheet__positioner--bottom {
  align-items: flex-end;
  padding-bottom: max(var(--juxt-space-2), env(safe-area-inset-bottom));
}

/* A floating panel with a small inset from the edges | calmer than edge-to-edge. */
.j-sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--juxt-border);
  border-radius: var(--juxt-radius-lg);
  background: var(--juxt-surface-raised);
  box-shadow: var(--juxt-shadow-lg);
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
  outline: none;
}

.j-sheet--right,
.j-sheet--left {
  height: 100%;
}

.j-sheet--right.j-sheet--sm,
.j-sheet--left.j-sheet--sm {
  max-width: 20rem;
}

.j-sheet--right.j-sheet--md,
.j-sheet--left.j-sheet--md {
  max-width: 25rem;
}

.j-sheet--right.j-sheet--lg,
.j-sheet--left.j-sheet--lg {
  max-width: 35rem;
}

.j-sheet--bottom.j-sheet--sm {
  max-height: 20rem;
}

.j-sheet--bottom.j-sheet--md {
  max-height: 25rem;
}

.j-sheet--bottom.j-sheet--lg {
  max-height: min(35rem, calc(100dvh - var(--juxt-space-12)));
}

.j-sheet__header {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-1-5);
  padding: var(--juxt-space-5) var(--juxt-space-12) var(--juxt-space-4) var(--juxt-space-5);
  border-bottom: 1px solid var(--juxt-border-subtle);
}

.dark .j-sheet__header,
[data-theme='dark'] .j-sheet__header {
  border-bottom-color: var(--juxt-border);
}

.j-sheet__title {
  margin: 0;
  font-size: var(--juxt-text-lg);
  font-weight: var(--juxt-weight-semibold);
  line-height: var(--juxt-leading-snug);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-sheet__description {
  margin: 0;
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-normal);
}

.j-sheet__body {
  flex: 1;
  min-height: 0;
  padding: var(--juxt-space-5);
  overflow-y: auto;
  overscroll-behavior: contain;
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-normal);
}

.j-sheet__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--juxt-space-2);
  padding: var(--juxt-space-4) var(--juxt-space-5);
  border-top: 1px solid var(--juxt-border-subtle);
}

.dark .j-sheet__footer,
[data-theme='dark'] .j-sheet__footer {
  border-top-color: var(--juxt-border);
}

.j-sheet__close {
  position: absolute;
  top: var(--juxt-space-3);
  right: var(--juxt-space-3);
  display: grid;
  place-items: center;
  width: var(--juxt-control-sm);
  height: var(--juxt-control-sm);
  padding: 0;
  border: 0;
  border-radius: var(--juxt-radius-sm);
  background: transparent;
  color: var(--juxt-fg-muted);
  cursor: pointer;
  transition-property: background-color, color, outline-color, outline-offset;
}

.j-sheet__close:hover {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
}

.j-sheet__close > svg {
  width: 1rem;
  height: 1rem;
}

.j-sheet.is-nudging {
  animation: j-sheet-nudge 220ms var(--juxt-ease-out);
}

@keyframes j-sheet-nudge {
  40% {
    transform: scale(1.006);
  }
}

/* Motion: the backdrop fades; the sheet slides in from its edge. */
.j-sheet-overlay-enter-active {
  transition: opacity var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-sheet-overlay-leave-active {
  transition: opacity var(--juxt-duration-fast) var(--juxt-ease-in);
}

.j-sheet-overlay-enter-from,
.j-sheet-overlay-leave-to {
  opacity: 0;
}

.j-sheet-enter-active .j-sheet {
  transition: transform 280ms var(--juxt-ease-out);
}

.j-sheet-leave-active .j-sheet {
  transition: transform var(--juxt-duration-normal) var(--juxt-ease-in);
}

.j-sheet-enter-from .j-sheet--right,
.j-sheet-leave-to .j-sheet--right {
  transform: translateX(calc(100% + var(--juxt-space-4)));
}

.j-sheet-enter-from .j-sheet--left,
.j-sheet-leave-to .j-sheet--left {
  transform: translateX(calc(-100% - var(--juxt-space-4)));
}

.j-sheet-enter-from .j-sheet--bottom,
.j-sheet-leave-to .j-sheet--bottom {
  transform: translateY(calc(100% + var(--juxt-space-4)));
}

/* Reduced motion: the sheet fades in place instead of travelling. */
@media (prefers-reduced-motion: reduce) {
  .j-sheet-enter-active .j-sheet,
  .j-sheet-leave-active .j-sheet {
    transition: opacity var(--juxt-duration-normal) var(--juxt-ease-standard);
  }

  .j-sheet-enter-from .j-sheet,
  .j-sheet-leave-to .j-sheet {
    opacity: 0;
    transform: none !important;
  }
}
}
</style>
