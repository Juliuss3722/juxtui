<script setup lang="ts">
import type { Placement } from '../../composables/useFloating'
import { computed, nextTick, provide, ref, useId } from 'vue'
import { focusElement, unrefElement } from '../../utils/dom'
import { JSlot } from '../primitives/JSlot'
import { MENU_ROOT } from './context'
import JMenuContent from './JMenuContent.vue'

export interface DropdownMenuProps {
  placement?: Placement
  /** Distance from the trigger, in px. */
  offset?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  placement: 'bottom-start',
  offset: 6,
})

const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** The element that opens the menu | usually a `JButton`. */
  trigger?: (props: { open: boolean }) => unknown
  default?: () => unknown
}>()

const id = useId()
const triggerId = `j-${id}-trigger`
const menuId = `j-${id}-menu`

const triggerRef = ref()
const triggerEl = computed(() => unrefElement(triggerRef.value))
const initialFocus = ref<'first' | 'last' | 'content'>('content')

function show(focus: 'first' | 'last' | 'content') {
  if (props.disabled) return
  initialFocus.value = focus
  open.value = true
}

function close(restoreFocus = true) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) nextTick(() => focusElement(triggerEl.value))
}

provide(MENU_ROOT, { close })

function onClick(event: MouseEvent) {
  if (open.value) return close(false)
  // `detail` is 0 when a click came from the keyboard (Enter / Space).
  show(event.detail === 0 ? 'first' : 'content')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    show(event.key === 'ArrowDown' ? 'first' : 'last')
  }
}

const triggerProps = computed(() => ({
  'id': triggerId,
  'aria-haspopup': 'menu',
  'aria-expanded': open.value,
  'aria-controls': open.value ? menuId : undefined,
  'data-state': open.value ? 'open' : 'closed',
  'onClick': onClick,
  'onKeydown': onKeydown,
}))

defineExpose({ open: () => show('content'), close })
</script>

<template>
  <JSlot ref="triggerRef" v-bind="triggerProps">
    <slot name="trigger" :open="open" />
  </JSlot>
  <JMenuContent
    :id="menuId"
    :open="open"
    :reference="triggerEl"
    :labelledby="triggerEl?.id || triggerId"
    :placement="placement"
    :offset="offset"
    :initial-focus="initialFocus"
    @escape="close(true)"
    @outside="close(false)"
  >
    <slot />
  </JMenuContent>
</template>
