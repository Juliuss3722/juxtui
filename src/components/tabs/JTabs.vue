<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { focusElement } from '../../utils/dom'

export interface TabItem {
  value: string
  label: string
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  /** `line` for page sections, `pill` for compact view switches. */
  variant?: 'line' | 'pill'
  size?: 'sm' | 'md'
  /** Accessible name for the tab list. */
  label?: string
  /** Stretch tabs to fill the width. */
  fill?: boolean
}

const props = withDefaults(defineProps<TabsProps>(), { variant: 'line', size: 'md' })

const model = defineModel<string>()

defineSlots<{
  /** Custom tab label. */
  tab?: (props: { item: TabItem, selected: boolean }) => unknown
  /** Panels are named after each item's `value`. */
  [value: string]: ((props: { item: TabItem, selected: boolean }) => unknown) | undefined
}>()

const id = `j-${useId()}`
const tabId = (value: string) => `${id}-tab-${value}`
const panelId = (value: string) => `${id}-panel-${value}`

const selected = computed(() => model.value ?? props.items.find(item => !item.disabled)?.value)

const list = ref<HTMLElement | null>(null)
const indicator = ref({ x: 0, width: 0, ready: false })
// The indicator glides only for deliberate changes, never for layout shifts.
const animated = ref(false)

function measure() {
  const el = list.value?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
  indicator.value = el ? { x: el.offsetLeft, width: el.offsetWidth, ready: true } : { ...indicator.value, ready: false }
}

function measureWithoutMotion() {
  animated.value = false
  measure()
  requestAnimationFrame(() => requestAnimationFrame(() => (animated.value = true)))
}

let observer: ResizeObserver | undefined
onMounted(() => {
  measureWithoutMotion()
  observer = new ResizeObserver(measureWithoutMotion)
  if (list.value) observer.observe(list.value)
  // Web fonts change tab widths once they arrive.
  document.fonts?.ready.then(measureWithoutMotion)
})
onBeforeUnmount(() => observer?.disconnect())

watch(selected, () => nextTick(measure), { flush: 'post' })
watch(() => props.items, () => nextTick(measure), { deep: true, flush: 'post' })

function select(item: TabItem) {
  if (item.disabled) return
  model.value = item.value
}

function onKeydown(event: KeyboardEvent) {
  const enabled = props.items.filter(item => !item.disabled)
  if (!enabled.length) return
  const current = enabled.findIndex(item => item.value === selected.value)
  let next: number | undefined
  if (event.key === 'ArrowRight') next = (current + 1) % enabled.length
  else if (event.key === 'ArrowLeft') next = (current - 1 + enabled.length) % enabled.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = enabled.length - 1
  if (next === undefined) return
  event.preventDefault()
  const item = enabled[next]!
  select(item)
  nextTick(() => focusElement(document.getElementById(tabId(item.value))))
}

const indicatorStyle = computed(() => ({
  transform: `translateX(${indicator.value.x}px)`,
  width: `${indicator.value.width}px`,
}))
</script>

<template>
  <div class="j-tabs" :class="[`j-tabs--${variant}`, `j-tabs--${size}`, { 'j-tabs--fill': fill }]">
    <div
      ref="list"
      role="tablist"
      aria-orientation="horizontal"
      :aria-label="label"
      class="j-tabs__list"
      @keydown="onKeydown"
    >
      <span
        class="j-tabs__indicator"
        :class="{ 'is-ready': indicator.ready, 'is-animated': animated }"
        :style="indicatorStyle"
        aria-hidden="true"
      />
      <button
        v-for="item in items"
        :id="tabId(item.value)"
        :key="item.value"
        type="button"
        role="tab"
        class="j-tabs__tab"
        :aria-selected="item.value === selected"
        :aria-controls="panelId(item.value)"
        :tabindex="item.value === selected ? 0 : -1"
        :disabled="item.disabled"
        @click="select(item)"
      >
        <slot name="tab" :item="item" :selected="item.value === selected">
          {{ item.label }}
        </slot>
      </button>
    </div>
    <template v-for="item in items" :key="item.value">
      <div
        v-if="$slots[item.value]"
        :id="panelId(item.value)"
        role="tabpanel"
        class="j-tabs__panel"
        :aria-labelledby="tabId(item.value)"
        :hidden="item.value !== selected"
        tabindex="0"
      >
        <slot :name="item.value" :item="item" :selected="item.value === selected" />
      </div>
    </template>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-tabs {
  --j-tab-height: var(--juxt-control-md);
  --j-tab-font: var(--juxt-text-md);

  display: flex;
  flex-direction: column;
  min-width: 0;
  font-family: var(--juxt-font-sans);
}

.j-tabs--sm {
  --j-tab-height: var(--juxt-control-sm);
  --j-tab-font: var(--juxt-text-sm);
}

.j-tabs__list {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.j-tabs__list::-webkit-scrollbar {
  display: none;
}

.j-tabs__tab {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: var(--juxt-space-1-5);
  height: var(--j-tab-height);
  padding: 0 var(--juxt-space-3);
  border: 0;
  background: transparent;
  color: var(--juxt-fg-muted);
  font: inherit;
  font-size: var(--j-tab-font);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
  white-space: nowrap;
  cursor: pointer;
  outline: 2px solid transparent;
  outline-offset: -2px;
  -webkit-tap-highlight-color: transparent;
  transition:
    color var(--juxt-duration-fast) var(--juxt-ease-standard),
    outline-color var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-tabs__tab:hover:not(:disabled) {
  color: var(--juxt-fg-secondary);
}

.j-tabs__tab[aria-selected='true'] {
  color: var(--juxt-fg);
}

.j-tabs__tab:focus-visible {
  outline-color: var(--juxt-ring);
}

.j-tabs__tab:disabled {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-tabs--fill .j-tabs__tab {
  flex: 1;
}

.j-tabs__indicator {
  position: absolute;
  left: 0;
  opacity: 0;
  pointer-events: none;
}

.j-tabs__indicator.is-ready {
  opacity: 1;
}

.j-tabs__indicator.is-animated {
  transition:
    transform var(--juxt-duration-slow) var(--juxt-ease-out),
    width var(--juxt-duration-slow) var(--juxt-ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .j-tabs__indicator.is-animated {
    transition: none;
  }
}

/* Line */
.j-tabs--line .j-tabs__list {
  gap: var(--juxt-space-1);
  box-shadow: inset 0 -1px 0 var(--juxt-border);
}

.j-tabs--line .j-tabs__tab {
  padding: 0 var(--juxt-space-2);
  border-radius: var(--juxt-radius-sm) var(--juxt-radius-sm) 0 0;
}

.j-tabs--line .j-tabs__indicator {
  bottom: 0;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--juxt-fg);
}

/* Pill */
.j-tabs--pill .j-tabs__list {
  align-self: flex-start;
  padding: 3px;
  border-radius: var(--juxt-radius-md);
  background: var(--juxt-surface-sunken);
  box-shadow: inset 0 0 0 1px var(--juxt-border-subtle);
}

.j-tabs--pill.j-tabs--fill .j-tabs__list {
  align-self: stretch;
}

.j-tabs--pill .j-tabs__tab {
  --j-tab-height: calc(var(--juxt-control-md) - 6px);

  border-radius: var(--juxt-radius-sm);
}

.j-tabs--pill.j-tabs--sm .j-tabs__tab {
  --j-tab-height: calc(var(--juxt-control-sm) - 6px);

  padding: 0 var(--juxt-space-2-5);
}

.j-tabs--pill .j-tabs__indicator {
  top: 3px;
  bottom: 3px;
  border-radius: var(--juxt-radius-sm);
  background: var(--juxt-surface);
  box-shadow: var(--juxt-shadow-sm);
}

.dark .j-tabs--pill .j-tabs__indicator,
[data-theme='dark'] .j-tabs--pill .j-tabs__indicator {
  background: var(--juxt-surface-active);
}

/* Panels */
.j-tabs__panel {
  padding-top: var(--juxt-space-4);
  border-radius: var(--juxt-radius-sm);
  outline: 2px solid transparent;
  outline-offset: 2px;
  animation: j-tabs-panel-in var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-tabs__panel:focus-visible {
  outline-color: var(--juxt-ring);
}

@keyframes j-tabs-panel-in {
  from {
    opacity: 0;
  }
}
}
</style>
