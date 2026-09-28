<script setup lang="ts">
import { useId } from 'vue'
import { IconChevronDown } from '../../icons'

export interface SidebarGroupProps {
  title?: string
  /** Let the title fold the group away. */
  collapsible?: boolean
}

withDefaults(defineProps<SidebarGroupProps>(), { collapsible: true })

/** Whether the group is expanded. Open by default. */
const open = defineModel<boolean>('open', { default: true })

defineSlots<{ default?: () => unknown }>()

const id = `j-${useId()}`
const titleId = `${id}-title`
const listId = `${id}-list`
</script>

<template>
  <div class="j-sidebar-group" :data-state="open ? 'open' : 'closed'">
    <button
      v-if="title && collapsible"
      :id="titleId"
      type="button"
      class="j-sidebar-group__title j-sidebar-group__toggle j-focusable"
      :aria-expanded="open"
      :aria-controls="listId"
      @click="open = !open"
    >
      <span>{{ title }}</span>
      <IconChevronDown class="j-sidebar-group__chevron" />
    </button>
    <p v-else-if="title" :id="titleId" class="j-sidebar-group__title">
      {{ title }}
    </p>
    <div
      :id="listId"
      class="j-sidebar-group__panel"
      role="group"
      :aria-labelledby="title ? titleId : undefined"
      :inert="!open"
    >
      <div class="j-sidebar-group__panel-inner">
        <div class="j-sidebar-group__items">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-sidebar-group {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-0-5);
}

.j-sidebar-group__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--juxt-space-2);
  margin: 0;
  padding: var(--juxt-space-1) var(--juxt-space-2);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  font-weight: var(--juxt-weight-medium);
  line-height: var(--juxt-leading-snug);
}

.j-sidebar-group__toggle {
  width: 100%;
  border: 0;
  border-radius: var(--juxt-radius-xs);
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition-property: color, outline-color, outline-offset;
}

.j-sidebar-group__toggle:hover {
  color: var(--juxt-fg-secondary);
}

.j-sidebar-group__chevron {
  flex: none;
  width: 0.75rem;
  height: 0.75rem;
  opacity: 0;
  transform: rotate(-90deg);
  transition:
    transform var(--juxt-duration-normal) var(--juxt-ease-out),
    opacity var(--juxt-duration-fast) var(--juxt-ease-standard);
}

/* The chevron only appears on hover or focus, or while the group is folded. */
.j-sidebar-group__toggle:hover .j-sidebar-group__chevron,
.j-sidebar-group__toggle:focus-visible .j-sidebar-group__chevron,
.j-sidebar-group[data-state='closed'] .j-sidebar-group__chevron {
  opacity: 1;
}

.j-sidebar-group[data-state='open'] .j-sidebar-group__chevron {
  transform: none;
}

.j-sidebar-group__panel {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-sidebar-group[data-state='closed'] .j-sidebar-group__panel {
  grid-template-rows: 0fr;
}

.j-sidebar-group__panel-inner {
  min-height: 0;
  overflow: hidden;
}

.j-sidebar-group__items {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-0-5);
}

@media (prefers-reduced-motion: reduce) {
  .j-sidebar-group__panel,
  .j-sidebar-group__chevron {
    transition: none;
  }
}
}
</style>
