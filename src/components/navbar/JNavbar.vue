<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useLayer } from '../../composables/useLayer'
import { focusElement } from '../../utils/dom'
import JBurger from '../burger/JBurger.vue'

export interface NavbarProps {
  /** Stick to the top of the viewport while scrolling. */
  sticky?: boolean
  /** Hairline under the bar. */
  bordered?: boolean
  /** Accessible name of the navigation landmark. */
  label?: string
  /** Width below which links collapse behind the burger. `never` keeps them inline. */
  collapse?: 'sm' | 'md' | 'lg' | 'never'
  /** Maximum content width; any CSS length. `none` spans the full width. */
  maxWidth?: string
}

const props = withDefaults(defineProps<NavbarProps>(), {
  sticky: true,
  bordered: true,
  label: 'Main',
  collapse: 'md',
  maxWidth: '72rem',
})

/** Mobile menu state. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** Logo or product name, usually a link home. */
  brand?: () => unknown
  /** Navigation links, typically `JNavbarLink`s. Shown inline, or in the mobile menu. */
  default?: () => unknown
  /** Always visible on the right: search, theme switch, avatar. */
  actions?: () => unknown
  /** Extra content at the bottom of the mobile menu, e.g. sign-in buttons. */
  'menu-footer'?: () => unknown
}>()

const menuId = `j-${useId()}-menu`
const root = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)

const breakpoints = { sm: 640, md: 768, lg: 1024 }

function close(returnFocus = false) {
  if (!open.value) return
  open.value = false
  if (returnFocus) nextTick(() => focusElement(root.value?.querySelector<HTMLElement>('.j-burger')))
}

useLayer({
  active: open,
  elements: () => [root.value],
  onEscape: () => close(true),
  onPointerDownOutside: () => close(),
})

// Choosing a destination closes the menu; opening a nested disclosure doesn't.
function onMenuClick(event: MouseEvent) {
  const target = (event.target as HTMLElement).closest('a, button')
  if (target && !target.hasAttribute('aria-expanded')) close()
}

// Growing past the breakpoint makes the menu irrelevant, so drop it.
let media: MediaQueryList | undefined
const onMediaChange = (event: MediaQueryListEvent) => event.matches && close()
onMounted(() => {
  if (props.collapse === 'never') return
  media = window.matchMedia(`(min-width: ${breakpoints[props.collapse]}px)`)
  media.addEventListener('change', onMediaChange)
})
onBeforeUnmount(() => media?.removeEventListener('change', onMediaChange))

watch(open, async (value) => {
  if (!value) return
  await nextTick()
  const first = menu.value?.querySelector<HTMLElement>('a, button')
  first?.focus({ preventScroll: true })
})

const style = computed(() => ({ '--j-navbar-max': props.maxWidth === 'none' ? 'none' : props.maxWidth }))
</script>

<template>
  <header
    ref="root"
    class="j-navbar"
    :class="[`j-navbar--collapse-${collapse}`, { 'is-sticky': sticky, 'is-bordered': bordered, 'is-open': open }]"
    :style="style"
  >
    <div class="j-navbar__bar">
      <div v-if="$slots.brand" class="j-navbar__brand">
        <slot name="brand" />
      </div>
      <nav v-if="$slots.default" class="j-navbar__links" :aria-label="label">
        <slot />
      </nav>
      <div class="j-navbar__end">
        <div v-if="$slots.actions" class="j-navbar__actions">
          <slot name="actions" />
        </div>
        <JBurger
          v-if="collapse !== 'never' && ($slots.default || $slots['menu-footer'])"
          v-model="open"
          class="j-navbar__burger"
          :controls="menuId"
        />
      </div>
    </div>
    <Transition name="j-navbar-menu">
      <div v-show="open" :id="menuId" ref="menu" class="j-navbar__menu" @click="onMenuClick">
        <nav v-if="$slots.default" class="j-navbar__menu-links" :aria-label="label">
          <slot />
        </nav>
        <div v-if="$slots['menu-footer']" class="j-navbar__menu-footer">
          <slot name="menu-footer" />
        </div>
      </div>
    </Transition>
  </header>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-navbar {
  --j-navbar-height: 3.5rem;

  position: relative;
  z-index: var(--juxt-z-sticky);
  background: var(--juxt-bg);
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
}

.j-navbar.is-sticky {
  position: sticky;
  top: 0;
}

.j-navbar.is-bordered {
  box-shadow: inset 0 -1px 0 var(--juxt-border-subtle);
}

.dark .j-navbar.is-bordered,
[data-theme='dark'] .j-navbar.is-bordered {
  box-shadow: inset 0 -1px 0 var(--juxt-border);
}

.j-navbar__bar {
  display: flex;
  align-items: center;
  gap: var(--juxt-space-6);
  max-width: var(--j-navbar-max);
  height: var(--j-navbar-height);
  margin: 0 auto;
  padding: 0 var(--juxt-space-4);
}

.j-navbar__brand {
  display: flex;
  flex: none;
  align-items: center;
}

.j-navbar__links {
  display: flex;
  align-items: center;
  gap: var(--juxt-space-1);
  min-width: 0;
}

.j-navbar__end {
  display: flex;
  align-items: center;
  gap: var(--juxt-space-2);
  margin-left: auto;
}

.j-navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--juxt-space-2);
}

.j-navbar__burger {
  display: none;
  margin-right: calc(var(--juxt-space-2) * -1);
}

/* Mobile menu: a panel that drops from the bar, links stacked with big targets. */
.j-navbar__menu {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-4);
  max-height: calc(100dvh - var(--j-navbar-height));
  padding: var(--juxt-space-3) var(--juxt-space-4) var(--juxt-space-5);
  overflow-y: auto;
  border-bottom: 1px solid var(--juxt-border);
  background: var(--juxt-bg);
  box-shadow: var(--juxt-shadow-md);
}

.j-navbar__menu-links {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-0-5);
}

.j-navbar__menu-links .j-navbar-link {
  justify-content: flex-start;
  height: 2.75rem;
  padding: 0 var(--juxt-space-3);
  font-size: var(--juxt-text-lg);
}

.j-navbar__menu-footer {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-2);
  padding-top: var(--juxt-space-4);
  border-top: 1px solid var(--juxt-border-subtle);
}

.j-navbar__menu-footer > * {
  width: 100%;
}

.j-navbar-menu-enter-active {
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-out),
    transform var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-navbar-menu-leave-active {
  transition:
    opacity var(--juxt-duration-instant) var(--juxt-ease-in),
    transform var(--juxt-duration-instant) var(--juxt-ease-in);
}

.j-navbar-menu-enter-from,
.j-navbar-menu-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--juxt-motion-shift) * -1));
}

/* Collapse points. Above them the menu never shows, below them the links hide. */
.j-navbar--collapse-never .j-navbar__menu {
  display: none !important;
}

@media (max-width: 639.98px) {
  .j-navbar--collapse-sm .j-navbar__links { display: none; }
  .j-navbar--collapse-sm .j-navbar__burger { display: inline-grid; }
}

@media (min-width: 640px) {
  .j-navbar--collapse-sm .j-navbar__menu { display: none !important; }
}

@media (max-width: 767.98px) {
  .j-navbar--collapse-md .j-navbar__links { display: none; }
  .j-navbar--collapse-md .j-navbar__burger { display: inline-grid; }
}

@media (min-width: 768px) {
  .j-navbar--collapse-md .j-navbar__menu { display: none !important; }
}

@media (max-width: 1023.98px) {
  .j-navbar--collapse-lg .j-navbar__links { display: none; }
  .j-navbar--collapse-lg .j-navbar__burger { display: inline-grid; }
}

@media (min-width: 1024px) {
  .j-navbar--collapse-lg .j-navbar__menu { display: none !important; }
}
}
</style>
