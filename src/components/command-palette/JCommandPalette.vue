<script setup lang="ts">
import type { Component } from 'vue'
import type { MatchRange } from './search'
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { useFocusTrap } from '../../composables/useFocusTrap'
import { formatHotkey, useHotkey } from '../../composables/useHotkey'
import { useLayer } from '../../composables/useLayer'
import { useScrollLock } from '../../composables/useScrollLock'
import { IconSearch, Spinner } from '../../icons'
import { matchText, splitByRanges } from './search'
import JPortal from '../primitives/JPortal.vue'

export interface CommandItem {
  id: string
  label: string
  description?: string
  /** An icon component, rendered at 16px. */
  icon?: Component
  /** Shortcut to display, in hotkey syntax: `mod+shift+p`. Display only. */
  shortcut?: string
  /** Extra terms that should find this item. */
  keywords?: string[]
  disabled?: boolean
  /** Called when the item is chosen, before `select` is emitted. */
  onSelect?: (item: CommandItem) => void
}

export interface CommandGroup {
  id: string
  label?: string
  items: CommandItem[]
}

export interface CommandPaletteProps {
  groups: CommandGroup[]
  /** Shown as a "Recent" group while the search is empty. */
  recent?: CommandItem[]
  placeholder?: string
  /** Show a loading indicator | for async results. */
  loading?: boolean
  /**
   * Built-in ranking and filtering. Set to `false` when you filter yourself
   * (e.g. server-side search driven by `v-model:search`).
   */
  filter?: boolean
  /** Global shortcut that toggles the palette. `false` to disable. */
  hotkey?: string | false
  /** Accessible name of the dialog. */
  label?: string
  emptyText?: string
}

const props = withDefaults(defineProps<CommandPaletteProps>(), {
  placeholder: 'Type a command or search…',
  filter: true,
  hotkey: 'mod+k',
  label: 'Command palette',
  emptyText: 'No results',
})

const open = defineModel<boolean>('open', { default: false })
const search = defineModel<string>('search', { default: '' })

const emit = defineEmits<{
  select: [item: CommandItem]
}>()

defineSlots<{
  item?: (props: { item: CommandItem, active: boolean }) => unknown
  empty?: (props: { search: string }) => unknown
  footer?: () => unknown
}>()

const id = `j-${useId()}`
const listboxId = `${id}-listbox`
// Keys contain group and item ids; keep the DOM id selector-safe.
const optionId = (key: string) => `${id}-option-${key.replace(/[^\w-]/g, '_')}`

// --- Results ---------------------------------------------------------------
interface Row {
  key: string
  item: CommandItem
  ranges: MatchRange[]
  score: number
}

interface Section {
  id: string
  label?: string
  rows: Row[]
}

const sections = computed<Section[]>(() => {
  const query = search.value.trim()
  const toKey = (groupId: string, item: CommandItem) => `${groupId}:${item.id}`

  if (!query || !props.filter) {
    const base: Section[] = []
    if (!query && props.recent?.length)
      base.push({ id: 'recent', label: 'Recent', rows: props.recent.map(item => ({ key: toKey('recent', item), item, ranges: [], score: 1 })) })
    for (const group of props.groups) {
      if (group.items.length)
        base.push({ id: group.id, label: group.label, rows: group.items.map(item => ({ key: toKey(group.id, item), item, ranges: [], score: 1 })) })
    }
    return base
  }

  const ranked: Section[] = []
  for (const group of props.groups) {
    const rows: Row[] = []
    for (const item of group.items) {
      const label = matchText(query, item.label)
      let score = label.score
      if (item.keywords) {
        for (const keyword of item.keywords) score = Math.max(score, matchText(query, keyword).score * 0.9)
      }
      if (item.description) score = Math.max(score, matchText(query, item.description).score * 0.5)
      if (score > 0) rows.push({ key: toKey(group.id, item), item, ranges: label.ranges, score })
    }
    if (rows.length) {
      rows.sort((a, b) => b.score - a.score)
      ranked.push({ id: group.id, label: group.label, rows })
    }
  }
  // The group holding the best match comes first.
  return ranked.sort((a, b) => b.rows[0]!.score - a.rows[0]!.score)
})

const rows = computed(() => sections.value.flatMap(section => section.rows))
const rowIndex = computed(() => new Map(rows.value.map((row, index) => [row.key, index])))

const activeIndex = ref(0)
const activeRow = computed(() => rows.value[activeIndex.value])

function firstEnabled(from = 0, delta: 1 | -1 = 1): number {
  const count = rows.value.length
  for (let i = 0; i < count; i++) {
    const index = (from + i * delta + count * 2) % count
    if (!rows.value[index]!.item.disabled) return index
  }
  return -1
}

// Every keystroke puts the best match under the cursor.
watch(rows, () => (activeIndex.value = Math.max(0, firstEnabled())))

// --- Opening & closing -----------------------------------------------------
const panel = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)

useHotkey(() => props.hotkey, () => (open.value = !open.value))
useLayer({ active: open, elements: () => [panel.value], onEscape: () => close() })
useFocusTrap(panel, open, { initialFocus: () => input.value })
useScrollLock(open)

watch(open, (value) => {
  if (!value) return
  search.value = ''
  activeIndex.value = Math.max(0, firstEnabled())
  nextTick(() => list.value?.scrollTo({ top: 0 }))
})

function close() {
  open.value = false
}

let pressedOutside = false
function onPointerDown(event: PointerEvent) {
  pressedOutside = event.target === event.currentTarget
}
function onClick(event: MouseEvent) {
  if (pressedOutside && event.target === event.currentTarget) close()
  pressedOutside = false
}

// --- Selection & navigation ------------------------------------------------
function choose(row: Row | undefined) {
  if (!row || row.item.disabled) return
  row.item.onSelect?.(row.item)
  emit('select', row.item)
  close()
}

function setActive(index: number) {
  if (index < 0) return
  activeIndex.value = index
  const row = rows.value[index]
  if (!row) return
  nextTick(() => {
    const el = document.getElementById(optionId(row.key))
    // Keep a little context around the active row at the list edges.
    if (index === 0) list.value?.scrollTo({ top: 0 })
    else el?.scrollIntoView({ block: 'nearest' })
  })
}

function move(delta: 1 | -1, distance = 1) {
  const count = rows.value.length
  if (!count) return
  let index = activeIndex.value
  for (let step = 0; step < distance; step++) {
    const next = firstEnabled((index + delta + count) % count, delta)
    if (next === -1) return
    // Page jumps stop at the ends instead of wrapping.
    if (distance > 1 && ((delta === 1 && next < index) || (delta === -1 && next > index))) break
    index = next
  }
  setActive(index)
}

function onKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  // Emacs-style Ctrl+N / Ctrl+P for people who never leave the home row.
  const ctrl = event.ctrlKey && !event.metaKey && !event.altKey
  const key = event.key
  if (key === 'ArrowDown' || (ctrl && key === 'n')) move(1)
  else if (key === 'ArrowUp' || (ctrl && key === 'p')) move(-1)
  else if (key === 'PageDown') move(1, 5)
  else if (key === 'PageUp') move(-1, 5)
  else if (key === 'Enter') choose(activeRow.value)
  else return
  event.preventDefault()
}

// Hover follows the pointer only when it moves | scrolling with the keyboard
// under a resting cursor must not steal the selection.
function onRowPointerMove(index: number) {
  if (activeIndex.value !== index && !rows.value[index]?.item.disabled) activeIndex.value = index
}

// --- Announcements ---------------------------------------------------------
const announcement = ref('')
let announceTimer: ReturnType<typeof setTimeout> | undefined
watch([rows, () => props.loading], () => {
  clearTimeout(announceTimer)
  announceTimer = setTimeout(() => {
    if (!open.value) return
    if (props.loading) announcement.value = 'Loading results'
    else announcement.value = rows.value.length === 1 ? '1 result' : `${rows.value.length} results`
  }, 350)
})

// Shortcut glyphs depend on the platform | resolve them on the client only.
const mounted = ref(false)
onMounted(() => (mounted.value = true))
const keys = (hotkey: string) => (mounted.value ? formatHotkey(hotkey) : [])

defineExpose({ close, focus: () => input.value?.focus() })
</script>

<template>
  <JPortal>
    <Transition name="j-command-overlay">
      <div v-if="open" class="j-command__overlay" aria-hidden="true" />
    </Transition>
    <Transition name="j-command" :duration="{ enter: 180, leave: 110 }">
      <div v-if="open" class="j-command__positioner" @pointerdown="onPointerDown" @click="onClick">
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          class="j-command"
        >
          <div class="j-command__search">
            <IconSearch class="j-command__search-icon" />
            <input
              ref="input"
              v-model="search"
              class="j-command__input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              :aria-controls="listboxId"
              :aria-activedescendant="activeRow ? optionId(activeRow.key) : undefined"
              :aria-label="label"
              :placeholder="placeholder"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              enterkeyhint="go"
              @keydown="onKeydown"
            />
            <button type="button" class="j-command__esc j-kbd" tabindex="-1" aria-label="Close" @click="close">
              Esc
            </button>
            <span v-if="loading" class="j-command__progress" aria-hidden="true" />
          </div>

          <div
            :id="listboxId"
            ref="list"
            role="listbox"
            :aria-label="label"
            class="j-command__list"
            @pointerdown.prevent
          >
            <div
              v-for="section in sections"
              :key="section.id"
              role="group"
              class="j-command__group"
              :aria-labelledby="section.label ? `${id}-group-${section.id}` : undefined"
            >
              <div v-if="section.label" :id="`${id}-group-${section.id}`" class="j-command__group-label" role="presentation">
                {{ section.label }}
              </div>
              <div
                v-for="row in section.rows"
                :id="optionId(row.key)"
                :key="row.key"
                role="option"
                class="j-command__item"
                :class="{ 'is-active': row.key === activeRow?.key }"
                :aria-selected="row.key === activeRow?.key"
                :aria-disabled="row.item.disabled || undefined"
                @pointermove="onRowPointerMove(rowIndex.get(row.key)!)"
                @click="choose(row)"
              >
                <slot name="item" :item="row.item" :active="row.key === activeRow?.key">
                  <span v-if="row.item.icon" class="j-command__item-icon">
                    <component :is="row.item.icon" />
                  </span>
                  <span class="j-command__item-text">
                    <span class="j-command__item-label" :class="{ 'is-searching': row.ranges.length }">
                      <template v-for="(part, i) in splitByRanges(row.item.label, row.ranges)" :key="i">
                        <mark v-if="part.match">{{ part.text }}</mark>
                        <template v-else>{{ part.text }}</template>
                      </template>
                    </span>
                    <span v-if="row.item.description" class="j-command__item-description">{{ row.item.description }}</span>
                  </span>
                  <span v-if="row.item.shortcut" class="j-command__item-shortcut" aria-hidden="true">
                    <kbd v-for="key in keys(row.item.shortcut)" :key="key" class="j-kbd">{{ key }}</kbd>
                  </span>
                </slot>
              </div>
            </div>

            <div v-if="!rows.length" class="j-command__empty" role="presentation">
              <template v-if="loading">
                <Spinner :size="16" />
                <span>Searching…</span>
              </template>
              <slot v-else name="empty" :search="search">
                <span class="j-command__empty-title">{{ emptyText }}</span>
                <span v-if="search" class="j-command__empty-hint">Nothing matches “{{ search }}”. Try fewer words.</span>
              </slot>
            </div>
          </div>

          <div class="j-command__footer">
            <slot name="footer">
              <span class="j-command__hint"><kbd class="j-kbd">↑</kbd><kbd class="j-kbd">↓</kbd> Navigate</span>
              <span class="j-command__hint"><kbd class="j-kbd">↵</kbd> Select</span>
              <span class="j-command__hint"><kbd class="j-kbd">Esc</kbd> Close</span>
            </slot>
          </div>

          <span class="j-sr-only" aria-live="polite" aria-atomic="true">{{ announcement }}</span>
        </div>
      </div>
    </Transition>
  </JPortal>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-command__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--juxt-z-overlay);
  background: var(--juxt-overlay);
}

.j-command__positioner {
  position: fixed;
  inset: 0;
  z-index: var(--juxt-z-modal);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: max(12vh, var(--juxt-space-4)) var(--juxt-space-4) var(--juxt-space-4);
}

.j-command {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 40rem;
  max-height: min(34rem, calc(100dvh - 12vh - var(--juxt-space-8)));
  overflow: hidden;
  border: 1px solid var(--juxt-border);
  border-radius: var(--juxt-radius-lg);
  background: var(--juxt-surface-raised);
  box-shadow: var(--juxt-shadow-lg);
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
}

/* Search */
.j-command__search {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--juxt-space-3);
  height: 3.25rem;
  padding: 0 var(--juxt-space-3) 0 var(--juxt-space-4);
  border-bottom: 1px solid var(--juxt-border-subtle);
}

.dark .j-command__search,
[data-theme='dark'] .j-command__search {
  border-bottom-color: var(--juxt-border);
}

.j-command__search-icon {
  flex: none;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--juxt-fg-muted);
}

.j-command__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--juxt-fg);
  font: inherit;
  font-size: var(--juxt-text-lg);
  letter-spacing: var(--juxt-tracking-tight);
  caret-color: var(--juxt-accent);
}

.j-command__input::placeholder {
  color: var(--juxt-fg-muted);
}

.j-command__esc {
  height: 1.375rem;
  padding: 0 var(--juxt-space-1-5);
  cursor: pointer;
}

.j-command__esc:hover {
  color: var(--juxt-fg-secondary);
}

/* An indeterminate hairline: present, never loud. */
.j-command__progress {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 1px;
  overflow: hidden;
}

.j-command__progress::after {
  content: '';
  position: absolute;
  inset: 0;
  width: 40%;
  background: linear-gradient(90deg, transparent, var(--juxt-accent), transparent);
  animation: j-command-progress 1.1s var(--juxt-ease-standard) infinite;
}

@keyframes j-command-progress {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(250%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .j-command__progress::after {
    width: 100%;
    animation: j-command-pulse 1.4s ease-in-out infinite;
  }

  @keyframes j-command-pulse {
    50% {
      opacity: 0.3;
    }
  }
}

/* List */
.j-command__list {
  flex: 1;
  min-height: 0;
  padding: var(--juxt-space-1-5);
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-padding-block: var(--juxt-space-8) var(--juxt-space-1-5);
}

.j-command__group + .j-command__group {
  margin-top: var(--juxt-space-1);
}

.j-command__group-label {
  padding: var(--juxt-space-2) var(--juxt-space-2-5) var(--juxt-space-1-5);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  font-weight: var(--juxt-weight-medium);
  user-select: none;
}

.j-command__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--juxt-space-2-5);
  height: 2.5rem;
  padding: 0 var(--juxt-space-2-5);
  border-radius: var(--juxt-radius-sm);
  color: var(--juxt-fg);
  font-size: var(--juxt-text-md);
  letter-spacing: var(--juxt-tracking-tight);
  cursor: pointer;
  user-select: none;
}

/* The one place the palette uses green: a hairline marking where you are. */
.j-command__item::before {
  content: '';
  position: absolute;
  top: 0.625rem;
  bottom: 0.625rem;
  left: 0;
  width: 2px;
  border-radius: 0 2px 2px 0;
  background: var(--juxt-accent);
  opacity: 0;
  transform: scaleY(0.4);
  transition:
    opacity var(--juxt-duration-instant) var(--juxt-ease-standard),
    transform var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-command__item.is-active {
  background: var(--juxt-surface-hover);
}

.j-command__item.is-active::before {
  opacity: 1;
  transform: none;
}

.j-command__item[aria-disabled='true'] {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-command__item-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--juxt-fg-muted);
}

.j-command__item-icon > svg {
  width: 1rem;
  height: 1rem;
}

.j-command__item.is-active .j-command__item-icon {
  color: var(--juxt-fg);
}

.j-command__item-text {
  display: flex;
  flex: 1;
  align-items: baseline;
  gap: var(--juxt-space-2);
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.j-command__item-label {
  flex: none;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.j-command__item-label.is-searching {
  color: var(--juxt-fg-secondary);
}

.j-command__item-label mark {
  background: none;
  color: var(--juxt-fg);
  font-weight: var(--juxt-weight-medium);
}

.j-command__item-description {
  overflow: hidden;
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  text-overflow: ellipsis;
}

.j-command__item-shortcut {
  display: inline-flex;
  flex: none;
  gap: 3px;
}

.j-command__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--juxt-space-1-5);
  min-height: 8rem;
  padding: var(--juxt-space-6) var(--juxt-space-4);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  text-align: center;
}

.j-command__empty-title {
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-md);
  font-weight: var(--juxt-weight-medium);
}

/* Footer */
.j-command__footer {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--juxt-space-4);
  height: 2.25rem;
  padding: 0 var(--juxt-space-4);
  border-top: 1px solid var(--juxt-border-subtle);
  background: var(--juxt-surface-sunken);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
}

.dark .j-command__footer,
[data-theme='dark'] .j-command__footer {
  border-top-color: var(--juxt-border);
  background: var(--juxt-surface);
}

.j-command__hint {
  display: inline-flex;
  align-items: center;
  gap: var(--juxt-space-1);
}

.j-command__hint .j-kbd + .j-kbd {
  margin-left: -1px;
}

/* Motion: quick in, quicker out. */
.j-command-overlay-enter-active {
  transition: opacity var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-command-overlay-leave-active {
  transition: opacity var(--juxt-duration-instant) var(--juxt-ease-in);
}

.j-command-overlay-enter-from,
.j-command-overlay-leave-to {
  opacity: 0;
}

.j-command-enter-active .j-command {
  transition:
    opacity var(--juxt-duration-fast) var(--juxt-ease-out),
    transform var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-command-leave-active .j-command {
  transition:
    opacity var(--juxt-duration-instant) var(--juxt-ease-in),
    transform var(--juxt-duration-instant) var(--juxt-ease-in);
}

.j-command-enter-from .j-command,
.j-command-leave-to .j-command {
  opacity: 0;
  transform: translateY(calc(var(--juxt-motion-shift) * -1)) scale(0.985);
}

@media (prefers-reduced-motion: reduce) {
  .j-command-enter-from .j-command,
  .j-command-leave-to .j-command {
    transform: none;
  }
}

@media (max-width: 639px) {
  .j-command__positioner {
    padding: var(--juxt-space-2);
  }

  .j-command {
    max-height: calc(100dvh - var(--juxt-space-4));
  }

  .j-command__footer {
    display: none;
  }
}
}
</style>
