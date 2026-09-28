<script setup lang="ts">
import { useId } from 'vue'

export interface FooterColumnProps {
  title: string
}

defineProps<FooterColumnProps>()

defineSlots<{ default?: () => unknown }>()

const titleId = `j-${useId()}-title`
</script>

<template>
  <nav class="j-footer-column" :aria-labelledby="titleId">
    <p :id="titleId" class="j-footer-column__title">
      {{ title }}
    </p>
    <div class="j-footer-column__links">
      <slot />
    </div>
  </nav>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-footer-column {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-3);
  min-width: 0;
}

.j-footer-column__title {
  margin: 0;
  color: var(--juxt-fg);
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-footer-column__links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--juxt-space-2);
}

.j-footer-column__links a {
  border-radius: var(--juxt-radius-xs);
  color: var(--juxt-fg-muted);
  text-decoration: none;
  outline: 2px solid transparent;
  outline-offset: 0;
  transition:
    color var(--juxt-duration-fast) var(--juxt-ease-standard),
    outline-color var(--juxt-duration-fast) var(--juxt-ease-out),
    outline-offset var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-footer-column__links a:hover {
  color: var(--juxt-fg);
}

.j-footer-column__links a:focus-visible {
  outline-color: var(--juxt-ring);
  outline-offset: 2px;
}
}
</style>
