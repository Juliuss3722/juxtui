<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { IconChevronDown } from '../../icons'
import { ACCORDION } from './context'

export interface AccordionItemProps {
  /** Identifies the item in the accordion's `v-model`. */
  value: string
  title?: string
  disabled?: boolean
}

const props = defineProps<AccordionItemProps>()

defineSlots<{ default?: () => unknown, title?: () => unknown }>()

const accordion = inject(ACCORDION)!
const id = `j-${useId()}`
const triggerId = `${id}-trigger`
const panelId = `${id}-panel`
const open = computed(() => accordion.isOpen(props.value))
const heading = computed(() => `h${accordion.headingLevel()}`)
</script>

<template>
  <div class="j-accordion__item" :data-state="open ? 'open' : 'closed'" :class="{ 'is-disabled': disabled }">
    <component :is="heading" class="j-accordion__heading">
      <button
        :id="triggerId"
        type="button"
        class="j-accordion__trigger"
        :aria-expanded="open"
        :aria-controls="panelId"
        :disabled="disabled"
        @click="accordion.toggle(value)"
      >
        <span class="j-accordion__title"><slot name="title">{{ title }}</slot></span>
        <IconChevronDown class="j-accordion__chevron" />
      </button>
    </component>
    <div
      :id="panelId"
      role="region"
      class="j-accordion__panel"
      :aria-labelledby="triggerId"
      :inert="!open"
    >
      <div class="j-accordion__panel-inner">
        <div class="j-accordion__content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-accordion__item {
  border-bottom: 1px solid var(--juxt-border-subtle);
}

.dark .j-accordion__item,
[data-theme='dark'] .j-accordion__item {
  border-bottom-color: var(--juxt-border);
}

.j-accordion__heading {
  margin: 0;
  font: inherit;
}

.j-accordion__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--juxt-space-4);
  width: 100%;
  min-height: 3rem;
  padding: var(--juxt-space-3) 0;
  border: 0;
  border-radius: var(--juxt-radius-xs);
  background: transparent;
  color: var(--juxt-fg);
  font: inherit;
  font-size: var(--juxt-text-md);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
  text-align: left;
  cursor: pointer;
  outline: 2px solid transparent;
  outline-offset: 0;
  -webkit-tap-highlight-color: transparent;
  transition:
    color var(--juxt-duration-fast) var(--juxt-ease-standard),
    outline-color var(--juxt-duration-fast) var(--juxt-ease-out),
    outline-offset var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-accordion__trigger:focus-visible {
  outline-color: var(--juxt-ring);
  outline-offset: 2px;
}

.j-accordion__trigger:disabled {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-accordion__chevron {
  flex: none;
  width: 1rem;
  height: 1rem;
  color: var(--juxt-fg-muted);
  transition:
    transform var(--juxt-duration-normal) var(--juxt-ease-out),
    color var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-accordion__trigger:hover:not(:disabled) .j-accordion__chevron {
  color: var(--juxt-fg);
}

.j-accordion__item[data-state='open'] .j-accordion__chevron {
  transform: rotate(180deg);
}

/* Height follows content via grid rows | no measuring, no magic numbers. */
.j-accordion__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--juxt-duration-slow) var(--juxt-ease-out);
}

.j-accordion__item[data-state='open'] .j-accordion__panel {
  grid-template-rows: 1fr;
}

.j-accordion__panel-inner {
  min-height: 0;
  overflow: hidden;
}

.j-accordion__content {
  padding-bottom: var(--juxt-space-4);
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-normal);
  opacity: 0;
  transition: opacity var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-accordion__item[data-state='open'] .j-accordion__content {
  opacity: 1;
  transition-delay: 60ms;
}

@media (prefers-reduced-motion: reduce) {
  .j-accordion__panel,
  .j-accordion__chevron {
    transition: none;
  }
}
}
</style>
