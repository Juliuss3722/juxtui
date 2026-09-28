<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { IconChevronLeft, IconChevronRight, IconMoreHorizontal } from '../../icons'
import { focusElement } from '../../utils/dom'

export interface PaginationProps {
  /** Total number of pages. */
  total: number
  /** Pages shown on each side of the current page before collapsing to an ellipsis. */
  siblingCount?: number
  /** Accessible name for the nav landmark. */
  label?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

const props = withDefaults(defineProps<PaginationProps>(), {
  siblingCount: 1,
  size: 'md',
})

const model = defineModel<number>({ default: 1 })

const list = ref<HTMLElement | null>(null)

const totalPages = computed(() => Math.max(1, Math.floor(props.total)))
const current = computed(() => Math.min(Math.max(1, model.value), totalPages.value))

type PageItem = number | 'ellipsis'

const pageItems = computed<PageItem[]>(() => {
  const total = totalPages.value
  const siblings = Math.max(0, props.siblingCount)
  const totalSlots = siblings * 2 + 5
  if (total <= totalSlots) return Array.from({ length: total }, (_, i) => i + 1)

  const left = Math.max(current.value - siblings, 1)
  const right = Math.min(current.value + siblings, total)
  const showLeftEllipsis = left > 2
  const showRightEllipsis = right < total - 1

  const items: PageItem[] = [1]
  if (showLeftEllipsis) items.push('ellipsis')
  else for (let p = 2; p < left; p++) items.push(p)
  for (let p = Math.max(left, 2); p <= Math.min(right, total - 1); p++) items.push(p)
  if (showRightEllipsis) items.push('ellipsis')
  else for (let p = right + 1; p < total; p++) items.push(p)
  if (total > 1) items.push(total)
  return items
})

function goTo(page: number, focus = false) {
  if (props.disabled) return
  model.value = Math.min(Math.max(1, page), totalPages.value)
  if (focus) nextTick(() => focusElement(list.value?.querySelector<HTMLElement>('[aria-current="page"]')))
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (!target.classList.contains('j-pagination__page')) return
  if (event.key === 'Home') {
    event.preventDefault()
    goTo(1, true)
  }
  else if (event.key === 'End') {
    event.preventDefault()
    goTo(totalPages.value, true)
  }
}
</script>

<template>
  <nav class="j-pagination" :class="`j-pagination--${size}`" :aria-label="label || 'Pagination'">
    <button
      type="button"
      class="j-pagination__nav j-focusable"
      aria-label="Previous page"
      :disabled="disabled || current === 1"
      @click="goTo(current - 1, true)"
    >
      <IconChevronLeft />
    </button>
    <ul ref="list" class="j-pagination__list" @keydown="onKeydown">
      <li v-for="(item, index) in pageItems" :key="index">
        <span v-if="item === 'ellipsis'" class="j-pagination__ellipsis" aria-hidden="true">
          <IconMoreHorizontal />
        </span>
        <button
          v-else
          type="button"
          class="j-pagination__page j-focusable"
          :class="{ 'is-current': item === current }"
          :aria-current="item === current ? 'page' : undefined"
          :aria-label="`Page ${item}`"
          :disabled="disabled"
          @click="goTo(item)"
        >
          {{ item }}
        </button>
      </li>
    </ul>
    <button
      type="button"
      class="j-pagination__nav j-focusable"
      aria-label="Next page"
      :disabled="disabled || current === totalPages"
      @click="goTo(current + 1, true)"
    >
      <IconChevronRight />
    </button>
  </nav>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-pagination {
  --j-pagination-size: var(--juxt-control-md);

  display: flex;
  align-items: center;
  gap: var(--juxt-space-1);
  font-family: var(--juxt-font-sans);
}

.j-pagination--sm {
  --j-pagination-size: var(--juxt-control-sm);
}

.j-pagination__list {
  display: flex;
  align-items: center;
  gap: var(--juxt-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.j-pagination__nav,
.j-pagination__page {
  display: grid;
  flex: none;
  place-items: center;
  width: var(--j-pagination-size);
  height: var(--j-pagination-size);
  border: 1px solid transparent;
  border-radius: var(--juxt-radius-sm);
  background: transparent;
  color: var(--juxt-fg-secondary);
  font-family: inherit;
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    background-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    border-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    color var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-pagination__nav > svg {
  width: 1rem;
  height: 1rem;
}

.j-pagination__nav:hover:not(:disabled),
.j-pagination__page:hover:not(:disabled) {
  background: var(--juxt-surface-hover);
  color: var(--juxt-fg);
}

.j-pagination__nav:disabled {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-pagination__page.is-current {
  border-color: var(--juxt-border);
  background: var(--juxt-surface-active);
  color: var(--juxt-fg);
}

.j-pagination__page:disabled {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-pagination__ellipsis {
  display: grid;
  place-items: center;
  width: var(--j-pagination-size);
  height: var(--j-pagination-size);
  color: var(--juxt-fg-disabled);
}

.j-pagination__ellipsis > svg {
  width: 1rem;
  height: 1rem;
}
}
</style>
