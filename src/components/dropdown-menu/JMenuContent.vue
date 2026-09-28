<script setup lang="ts">
/**
 * Internal: the floating list shared by the root menu and submenus.
 * Owns positioning, keyboard navigation, typeahead and the layer.
 */
import type { Placement } from '../../composables/useFloating'
import type { MenuLevelContext } from './context'
import { inject, nextTick, provide, ref, toRef, watch } from 'vue'
import { useFloating } from '../../composables/useFloating'
import { useLayer } from '../../composables/useLayer'
import { useTypeahead } from '../../composables/useTypeahead'
import { focusElement } from '../../utils/dom'
import JPortal from '../primitives/JPortal.vue'
import { getMenuItems, MENU_LEVEL, MENU_ROOT } from './context'

const props = defineProps<{
  open: boolean
  reference: HTMLElement | null
  id: string
  labelledby?: string
  placement: Placement
  offset: number | { mainAxis?: number, crossAxis?: number }
  /** What to focus once open. */
  initialFocus: 'first' | 'last' | 'content' | 'none'
  isSub?: boolean
}>()

const emit = defineEmits<{
  escape: []
  outside: [event: PointerEvent]
  /** Submenus only: ArrowLeft asks to go back to the parent. */
  back: []
  pointerenter: []
}>()

const root = inject(MENU_ROOT)!
const content = ref<HTMLElement | null>(null)
const reference = toRef(props, 'reference')

const { styles } = useFloating(reference, content, () => ({ placement: props.placement, offset: props.offset }))
const typeahead = useTypeahead()

useLayer({
  active: toRef(props, 'open'),
  elements: () => [content.value, props.reference],
  onEscape: () => emit('escape'),
  onPointerDownOutside: event => emit('outside', event),
})

// Level context for the items inside this list.
const openSub = ref<string | null>(null)
let subTimer: ReturnType<typeof setTimeout> | undefined
const level: MenuLevelContext = {
  content,
  openSub,
  setOpenSub: (id) => {
    clearTimeout(subTimer)
    openSub.value = id
  },
  scheduleSubClose: () => {
    if (!openSub.value) return
    clearTimeout(subTimer)
    subTimer = setTimeout(() => (openSub.value = null), 180)
  },
  cancelSubClose: () => clearTimeout(subTimer),
}
provide(MENU_LEVEL, level)

watch(
  () => props.open,
  async (value) => {
    if (!value) {
      openSub.value = null
      return
    }
    if (props.initialFocus === 'none') return
    await nextTick()
    const items = getMenuItems(content.value)
    if (props.initialFocus === 'first') focusElement(items[0] ?? content.value)
    else if (props.initialFocus === 'last') focusElement(items[items.length - 1] ?? content.value)
    else focusElement(content.value)
  },
  { flush: 'post' },
)

function move(delta: 1 | -1 | 'first' | 'last') {
  const items = getMenuItems(content.value)
  if (items.length === 0) return
  const current = items.indexOf(document.activeElement as HTMLElement)
  let next: number
  if (delta === 'first') next = 0
  else if (delta === 'last') next = items.length - 1
  else if (current === -1) next = delta === 1 ? 0 : items.length - 1
  else next = (current + delta + items.length) % items.length
  focusElement(items[next])
}

function onKeydown(event: KeyboardEvent) {
  const { key } = event
  switch (key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      break
    case 'Home':
    case 'PageUp':
      event.preventDefault()
      move('first')
      break
    case 'End':
    case 'PageDown':
      event.preventDefault()
      move('last')
      break
    case 'ArrowLeft':
      if (props.isSub) {
        event.preventDefault()
        emit('back')
      }
      break
    case 'Tab':
      event.preventDefault()
      root.close(true)
      break
    case 'Enter':
    case ' ': {
      const active = document.activeElement as HTMLElement | null
      if (active && active !== content.value && content.value?.contains(active)) {
        event.preventDefault()
        active.click()
      }
      break
    }
    default:
      if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const items = getMenuItems(content.value)
        const index = typeahead.search(key, items, item => item.textContent ?? '', items.indexOf(document.activeElement as HTMLElement))
        if (index >= 0) focusElement(items[index])
      }
  }
}

defineExpose({ content })
</script>

<template>
  <JPortal>
    <Transition name="j-pop">
      <div
        v-if="open"
        :id="id"
        ref="content"
        role="menu"
        tabindex="-1"
        class="j-menu j-popover-surface"
        :class="{ 'j-menu--sub': isSub }"
        :style="styles"
        :aria-labelledby="labelledby"
        aria-orientation="vertical"
        @keydown="onKeydown"
        @pointerenter="emit('pointerenter')"
      >
        <slot />
      </div>
    </Transition>
  </JPortal>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-menu {
  z-index: var(--juxt-z-popover);
  box-sizing: border-box;
  min-width: 11rem;
  max-width: calc(100vw - 16px);
  max-height: var(--j-available-height, 24rem);
  padding: var(--juxt-space-1);
  overflow-y: auto;
  overscroll-behavior: contain;
  outline: none;
}

.j-menu__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--juxt-space-2);
  min-height: var(--juxt-control-sm);
  padding: 0 var(--juxt-space-2);
  border-radius: var(--juxt-radius-xs);
  color: var(--juxt-fg);
  font-size: var(--juxt-text-md);
  letter-spacing: var(--juxt-tracking-tight);
  text-decoration: none;
  cursor: pointer;
  outline: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.j-menu__item:focus,
.j-menu__item[aria-expanded='true'] {
  background: var(--juxt-surface-hover);
}

.j-menu__item[aria-disabled='true'] {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-menu__item--destructive {
  color: var(--juxt-danger-text);
}

.j-menu__item--destructive:focus {
  background: var(--juxt-danger-soft);
}

.j-menu__icon {
  display: inline-flex;
  flex: none;
  color: var(--juxt-fg-muted);
}

.j-menu__icon > svg {
  width: 1rem;
  height: 1rem;
}

.j-menu__item:focus .j-menu__icon {
  color: var(--juxt-fg-secondary);
}

.j-menu__item--destructive .j-menu__icon {
  color: inherit;
}

.j-menu__text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.j-menu__shortcut {
  margin-left: var(--juxt-space-4);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  letter-spacing: 0.04em;
}

.j-menu__check {
  flex: none;
  width: 0.875rem;
  height: 0.875rem;
  margin-left: var(--juxt-space-4);
  color: var(--juxt-accent-text);
  opacity: 0;
}

.j-menu__check.is-checked {
  opacity: 1;
}

.j-menu__chevron {
  width: 0.875rem;
  height: 0.875rem;
  margin-right: -0.125rem;
  color: var(--juxt-fg-muted);
}

.j-menu__separator {
  height: 1px;
  margin: var(--juxt-space-1) calc(var(--juxt-space-1) * -1);
  background: var(--juxt-border-subtle);
}

.dark .j-menu__separator,
[data-theme='dark'] .j-menu__separator {
  background: var(--juxt-border);
}

.j-menu__label {
  padding: var(--juxt-space-1-5) var(--juxt-space-2) var(--juxt-space-1);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  font-weight: var(--juxt-weight-medium);
}
}
</style>
