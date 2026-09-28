<script setup lang="ts">
export interface SidebarProps {
  /** Accessible name of the navigation landmark. */
  label?: string
}

withDefaults(defineProps<SidebarProps>(), { label: 'Sidebar' })

defineSlots<{
  /** Top of the sidebar: logo, workspace switcher. */
  header?: () => unknown
  /** Items and groups. */
  default?: () => unknown
  /** Pinned to the bottom: account, settings, help. */
  footer?: () => unknown
}>()
</script>

<template>
  <aside class="j-sidebar">
    <div v-if="$slots.header" class="j-sidebar__header">
      <slot name="header" />
    </div>
    <nav class="j-sidebar__nav" :aria-label="label">
      <slot />
    </nav>
    <div v-if="$slots.footer" class="j-sidebar__footer">
      <slot name="footer" />
    </div>
  </aside>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-sidebar {
  display: flex;
  flex-direction: column;
  width: 100%;
  /*
   * Not `height: 100%`: inside a parent that only has a min-height (e.g. a
   * `min-h-screen` flex row) a percentage height can't resolve, and a set
   * height also stops the flex/grid parent from stretching the sidebar, so it
   * would collapse to its content. Min and max of 100% pin it to a parent with
   * a real height (nav scrolls inside), and leave it `auto` everywhere else, so
   * the parent stretches it to full height and the footer stays at the bottom.
   */
  height: auto;
  min-height: 100%;
  max-height: 100%;
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
}

.j-sidebar__header {
  display: flex;
  align-items: center;
  gap: var(--juxt-space-2);
  padding: var(--juxt-space-3) var(--juxt-space-3) var(--juxt-space-2);
}

.j-sidebar__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--juxt-space-4);
  min-height: 0;
  padding: var(--juxt-space-2);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.j-sidebar__footer {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-0-5);
  padding: var(--juxt-space-2);
  border-top: 1px solid var(--juxt-border-subtle);
}

.dark .j-sidebar__footer,
[data-theme='dark'] .j-sidebar__footer {
  border-top-color: var(--juxt-border);
}
}
</style>
