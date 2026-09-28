<script setup lang="ts">
import { computed } from 'vue'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  /** Trail of items, first to last. The last item renders as the current page. */
  items?: BreadcrumbItem[]
  /** Accessible name for the nav landmark. Defaults to "Breadcrumb". */
  label?: string
  /** Collapse middle items behind an ellipsis once the trail is longer than this. */
  maxItems?: number
}

const props = defineProps<BreadcrumbProps>()

/**
 * Provide `items` for the common case, or omit it and pass your own `<li>`
 * elements (with class `j-breadcrumb__item`) into the default slot for full
 * control over each crumb.
 */
defineSlots<{ default?: () => unknown }>()

interface ResolvedItem extends BreadcrumbItem {
  ellipsis?: boolean
}

const visibleItems = computed<ResolvedItem[]>(() => {
  const list = props.items ?? []
  if (!props.maxItems || list.length <= props.maxItems) return list
  const tailCount = Math.max(1, props.maxItems - 2)
  return [list[0]!, { label: '…', ellipsis: true }, ...list.slice(-tailCount)]
})
</script>

<template>
  <nav class="j-breadcrumb" :aria-label="label || 'Breadcrumb'">
    <ol class="j-breadcrumb__list">
      <template v-if="items && items.length">
        <li v-for="(item, index) in visibleItems" :key="`${item.label}-${index}`" class="j-breadcrumb__item">
          <span v-if="item.ellipsis" class="j-breadcrumb__ellipsis" aria-hidden="true">{{ item.label }}</span>
          <a v-else-if="item.href && index !== visibleItems.length - 1" class="j-breadcrumb__link j-focusable" :href="item.href">{{ item.label }}</a>
          <span v-else class="j-breadcrumb__current" :aria-current="index === visibleItems.length - 1 ? 'page' : undefined">{{ item.label }}</span>
        </li>
      </template>
      <slot v-else />
    </ol>
  </nav>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-breadcrumb {
  font-family: var(--juxt-font-sans);
}

.j-breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--juxt-space-1-5);
  margin: 0;
  padding: 0;
  list-style: none;
}

.j-breadcrumb__item {
  display: flex;
  align-items: center;
  gap: var(--juxt-space-1-5);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-snug);
}

.j-breadcrumb__item:not(:first-child)::before {
  content: '';
  display: inline-block;
  width: 0.3125rem;
  height: 0.3125rem;
  margin-right: var(--juxt-space-1-5);
  border-top: 1.5px solid var(--juxt-fg-disabled);
  border-right: 1.5px solid var(--juxt-fg-disabled);
  transform: rotate(45deg);
}

.j-breadcrumb__link {
  border-radius: var(--juxt-radius-xs);
  color: var(--juxt-fg-muted);
  text-decoration: none;
  transition: color var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-breadcrumb__link:hover {
  color: var(--juxt-fg);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.j-breadcrumb__current {
  color: var(--juxt-fg);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-breadcrumb__ellipsis {
  color: var(--juxt-fg-disabled);
  user-select: none;
}
}
</style>
