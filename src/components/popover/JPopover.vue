<script setup lang="ts">
import type { Placement } from '../../composables/useFloating'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useFloating } from '../../composables/useFloating'
import { useLayer } from '../../composables/useLayer'
import { focusElement, getFocusableElements, unrefElement } from '../../utils/dom'
import JPortal from '../primitives/JPortal.vue'
import { JSlot } from '../primitives/JSlot'

export interface PopoverProps {
  placement?: Placement
  /** Distance from the trigger in px. */
  offset?: number
  /** Accessible name of the popover content. */
  ariaLabel?: string
  /** Close when focus or a click leaves the popover. Defaults to true. */
  closeOnOutside?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<PopoverProps>(), {
  placement: 'bottom',
  offset: 8,
  closeOnOutside: true,
})

const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  trigger?: (props: { open: boolean }) => unknown
  default?: (props: { close: () => void }) => unknown
}>()

const id = `j-${useId()}-popover`
const triggerRef = ref()
const triggerEl = computed(() => unrefElement(triggerRef.value))
const content = ref<HTMLElement | null>(null)

const { styles } = useFloating(triggerEl, content, () => ({ placement: props.placement, offset: props.offset }))

function close(restoreFocus = false) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) nextTick(() => focusElement(triggerEl.value))
}

useLayer({
  active: open,
  elements: () => [triggerEl.value, content.value],
  onEscape: () => close(true),
  onPointerDownOutside: () => props.closeOnOutside && close(false),
})

// Moving focus in makes the content reachable without a trap: this is a
// non-modal surface, so Tab is allowed to leave (and that closes it).
watch(open, async (value) => {
  if (!value) return
  await nextTick()
  const el = content.value
  if (!el) return
  focusElement(el.querySelector<HTMLElement>('[autofocus], [data-autofocus]') ?? getFocusableElements(el)[0] ?? el)
}, { flush: 'post' })

function onFocusOut(event: FocusEvent) {
  if (!props.closeOnOutside) return
  const next = event.relatedTarget as Node | null
  if (!next) return
  if (content.value?.contains(next) || triggerEl.value?.contains(next)) return
  close(false)
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

const triggerProps = computed(() => ({
  'aria-haspopup': 'dialog',
  'aria-expanded': open.value,
  'aria-controls': open.value ? id : undefined,
  'data-state': open.value ? 'open' : 'closed',
  'onClick': toggle,
}))

defineExpose({ close: () => close(true) })
</script>

<template>
  <JSlot ref="triggerRef" v-bind="triggerProps">
    <slot name="trigger" :open="open" />
  </JSlot>
  <JPortal>
    <Transition name="j-pop">
      <div
        v-if="open"
        :id="id"
        ref="content"
        role="dialog"
        tabindex="-1"
        class="j-popover j-popover-surface"
        :style="styles"
        :aria-label="ariaLabel"
        @focusout="onFocusOut"
      >
        <slot :close="() => close(true)" />
      </div>
    </Transition>
  </JPortal>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-popover {
  z-index: var(--juxt-z-popover);
  box-sizing: border-box;
  max-width: calc(100vw - 16px);
  max-height: var(--j-available-height, 32rem);
  padding: var(--juxt-space-4);
  overflow: auto;
  outline: none;
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-normal);
}
}
</style>
