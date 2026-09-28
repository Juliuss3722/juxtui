<script setup lang="ts">
import { ref, useId } from 'vue'
import { FIELD_SELECTOR, useModal } from '../../composables/useModal'
import { IconX } from '../../icons'
import JPortal from '../primitives/JPortal.vue'

export interface DialogProps {
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  /** Close when the backdrop is clicked. Defaults to true. */
  closeOnOverlay?: boolean
  /** Close when Escape is pressed. Defaults to true. */
  closeOnEscape?: boolean
  /** Hide the close button in the corner. */
  hideClose?: boolean
  /** Accessible label when there is no visible title. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<DialogProps>(), {
  size: 'md',
  closeOnOverlay: true,
  closeOnEscape: true,
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** Fired after the leave transition finishes | a good moment to reset form state. */
  afterClose: []
}>()

defineSlots<{
  default?: (props: { close: () => void }) => unknown
  /** Custom header. Put `titleId` on your heading so the dialog stays labelled. */
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
  focusSelector: `.j-dialog__body ${FIELD_SELECTOR}`,
})

defineExpose({ close })
</script>

<template>
  <JPortal>
    <Transition name="j-dialog-overlay">
      <div v-if="open" class="j-dialog__overlay" aria-hidden="true" />
    </Transition>
    <Transition name="j-dialog" :duration="{ enter: 240, leave: 150 }" @after-leave="emit('afterClose')">
      <div v-if="open" class="j-dialog__positioner" @pointerdown="onBackdropPointerDown" @click="onBackdropClick">
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="j-dialog__panel"
          :class="[`j-dialog__panel--${size}`, { 'is-nudging': nudging }]"
          :aria-labelledby="title || $slots.header ? titleId : undefined"
          :aria-label="ariaLabel"
          :aria-describedby="description ? descriptionId : undefined"
          @animationend="nudging = false"
        >
          <header v-if="title || description || $slots.header" class="j-dialog__header">
            <slot name="header" :title-id="titleId" :description-id="descriptionId">
              <h2 :id="titleId" class="j-dialog__title">
                {{ title }}
              </h2>
              <p v-if="description" :id="descriptionId" class="j-dialog__description">
                {{ description }}
              </p>
            </slot>
          </header>
          <div v-if="$slots.default" class="j-dialog__body">
            <slot :close="close" />
          </div>
          <footer v-if="$slots.footer" class="j-dialog__footer">
            <slot name="footer" :close="close" />
          </footer>
          <button
            v-if="!hideClose"
            type="button"
            class="j-dialog__close j-focusable"
            aria-label="Close"
            @click="close"
          >
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
.j-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--juxt-z-overlay);
  background: var(--juxt-overlay);
}

.j-dialog__positioner {
  --j-dialog-shift: calc(var(--juxt-motion-shift) * 2);

  position: fixed;
  inset: 0;
  z-index: var(--juxt-z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--juxt-space-4);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.j-dialog__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100dvh - var(--juxt-space-8));
  border: 1px solid var(--juxt-border);
  border-radius: var(--juxt-radius-lg);
  background: var(--juxt-surface-raised);
  box-shadow: var(--juxt-shadow-lg);
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
  outline: none;
}

.j-dialog__panel--sm {
  max-width: 25rem;
}

.j-dialog__panel--md {
  max-width: 30rem;
}

.j-dialog__panel--lg {
  max-width: 40rem;
}

.j-dialog__header {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-1-5);
  padding: var(--juxt-space-5) var(--juxt-space-12) 0 var(--juxt-space-5);
}

.j-dialog__title {
  margin: 0;
  font-size: var(--juxt-text-lg);
  font-weight: var(--juxt-weight-semibold);
  line-height: var(--juxt-leading-snug);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-dialog__description {
  margin: 0;
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-normal);
}

.j-dialog__body {
  flex: 1;
  min-height: 0;
  padding: var(--juxt-space-4) var(--juxt-space-5) 0;
  overflow-y: auto;
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-normal);
}

.j-dialog__header + .j-dialog__footer {
  margin-top: var(--juxt-space-1);
}

.j-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--juxt-space-2);
  padding: var(--juxt-space-5);
}

.j-dialog__body:last-child {
  padding-bottom: var(--juxt-space-5);
}

.j-dialog__close {
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

.j-dialog__close:hover {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
}

.j-dialog__close > svg {
  width: 1rem;
  height: 1rem;
}

/* Motion: the backdrop fades; the panel fades, lifts and settles. */
.j-dialog-overlay-enter-active {
  transition: opacity var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-dialog-overlay-leave-active {
  transition: opacity var(--juxt-duration-fast) var(--juxt-ease-in);
}

.j-dialog-overlay-enter-from,
.j-dialog-overlay-leave-to {
  opacity: 0;
}

.j-dialog-enter-active .j-dialog__panel {
  transition:
    opacity var(--juxt-duration-normal) var(--juxt-ease-out),
    transform var(--juxt-duration-slow) var(--juxt-ease-out);
}

.j-dialog-leave-active .j-dialog__panel {
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-in),
    transform var(--juxt-duration-fast) var(--juxt-ease-in);
}

.j-dialog-enter-from .j-dialog__panel,
.j-dialog-leave-to .j-dialog__panel {
  opacity: 0;
  transform: translateY(var(--j-dialog-shift)) scale(var(--juxt-motion-scale));
}

.j-dialog__panel.is-nudging {
  animation: j-dialog-nudge 220ms var(--juxt-ease-out);
}

@keyframes j-dialog-nudge {
  40% {
    transform: scale(1.012);
  }
}

/* Small screens: a sheet anchored to the bottom, within thumb reach. */
@media (max-width: 639px) {
  .j-dialog__positioner {
    --j-dialog-shift: calc(var(--juxt-motion-shift) * 6);

    align-items: flex-end;
    padding: var(--juxt-space-2);
    padding-bottom: max(var(--juxt-space-2), env(safe-area-inset-bottom));
  }

  .j-dialog__panel {
    max-width: none;
    max-height: calc(100dvh - var(--juxt-space-12));
  }

  .j-dialog-enter-from .j-dialog__panel,
  .j-dialog-leave-to .j-dialog__panel {
    transform: translateY(var(--j-dialog-shift));
  }

  .j-dialog__footer {
    flex-direction: column-reverse;
  }

  .j-dialog__footer > * {
    width: 100%;
  }
}
}
</style>
