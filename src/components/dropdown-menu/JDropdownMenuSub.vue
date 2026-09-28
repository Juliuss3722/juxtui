<script setup lang="ts">
import { computed, inject, nextTick, ref, useId } from 'vue'
import { IconChevronRight } from '../../icons'
import { focusElement } from '../../utils/dom'
import { getMenuItems, MENU_LEVEL, MENU_ROOT } from './context'
import JMenuContent from './JMenuContent.vue'

export interface DropdownMenuSubProps {
  label: string
  disabled?: boolean
}

const props = defineProps<DropdownMenuSubProps>()

defineSlots<{ default?: () => unknown, leading?: () => unknown }>()

const root = inject(MENU_ROOT)!
const level = inject(MENU_LEVEL)!

const id = useId()
const itemId = `j-${id}-subtrigger`
const menuId = `j-${id}-submenu`
const item = ref<HTMLElement | null>(null)
const sub = ref<InstanceType<typeof JMenuContent> | null>(null)
const initialFocus = ref<'first' | 'none'>('none')
const isOpen = computed(() => level.openSub.value === menuId)

let openTimer: ReturnType<typeof setTimeout> | undefined

function openSub(focus: 'first' | 'none') {
  if (props.disabled) return
  initialFocus.value = focus
  level.setOpenSub(menuId)
}

function closeSub(returnFocus: boolean) {
  if (level.openSub.value === menuId) level.setOpenSub(null)
  if (returnFocus) nextTick(() => focusElement(item.value))
}

function onPointerMove() {
  level.cancelSubClose()
  if (props.disabled) return
  if (document.activeElement !== item.value) focusElement(item.value)
  if (isOpen.value) return
  clearTimeout(openTimer)
  openTimer = setTimeout(() => openSub('none'), 90)
}

function onPointerLeave() {
  clearTimeout(openTimer)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    event.stopPropagation()
    if (isOpen.value) focusElement(getMenuItems(sub.value?.content ?? null)[0])
    else openSub('first')
  }
}

function onClick() {
  openSub('first')
}

// A press outside the submenu either lands back in the parent (close just the
// submenu) or somewhere else entirely (close the whole menu).
function onOutside(event: PointerEvent) {
  const target = event.target as Node
  if (level.content.value?.contains(target)) closeSub(false)
  else root.close(false)
}
</script>

<template>
  <div
    :id="itemId"
    ref="item"
    role="menuitem"
    tabindex="-1"
    class="j-menu__item"
    aria-haspopup="menu"
    :aria-expanded="isOpen"
    :aria-controls="isOpen ? menuId : undefined"
    :aria-disabled="disabled || undefined"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @keydown="onKeydown"
    @click="onClick"
  >
    <span v-if="$slots.leading" class="j-menu__icon"><slot name="leading" /></span>
    <span class="j-menu__text">{{ label }}</span>
    <IconChevronRight class="j-menu__chevron" />
  </div>
  <JMenuContent
    :id="menuId"
    ref="sub"
    :open="isOpen"
    :reference="item"
    :labelledby="itemId"
    placement="right-start"
    :offset="{ mainAxis: 2, crossAxis: -5 }"
    :initial-focus="initialFocus"
    is-sub
    @escape="closeSub(true)"
    @back="closeSub(true)"
    @outside="onOutside"
    @pointerenter="level.cancelSubClose()"
  >
    <slot />
  </JMenuContent>
</template>
