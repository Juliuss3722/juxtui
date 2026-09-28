<script setup lang="ts">
import { useId } from 'vue'
import { IconChevronDown } from '../../icons'

export interface CollapsibleProps {
  /** Visible summary text; use the `trigger` slot for custom content instead. */
  label?: string
  disabled?: boolean
}

defineProps<CollapsibleProps>()

/** A single disclosure primitive | for a group of them, use `JAccordion`. */
const model = defineModel<boolean>({ default: false })

defineSlots<{
  default?: () => unknown
  trigger?: () => unknown
}>()

const id = `j-${useId()}`
const triggerId = `${id}-trigger`
const panelId = `${id}-panel`

function toggle() {
  model.value = !model.value
}
</script>

<template>
  <div class="j-collapsible" :data-state="model ? 'open' : 'closed'">
    <button
      :id="triggerId"
      type="button"
      class="j-collapsible__trigger j-focusable"
      :aria-expanded="model"
      :aria-controls="panelId"
      :disabled="disabled"
      @click="toggle"
    >
      <IconChevronDown class="j-collapsible__chevron" />
      <span class="j-collapsible__label"><slot name="trigger">{{ label }}</slot></span>
    </button>
    <div
      :id="panelId"
      role="region"
      class="j-collapsible__panel"
      :aria-labelledby="triggerId"
      :inert="!model"
    >
      <div class="j-collapsible__panel-inner">
        <div class="j-collapsible__content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-collapsible {
  font-family: var(--juxt-font-sans);
}

.j-collapsible__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--juxt-space-1-5);
  padding: var(--juxt-space-1) 0;
  border: 0;
  border-radius: var(--juxt-radius-xs);
  background: transparent;
  color: var(--juxt-fg);
  font: inherit;
  font-size: var(--juxt-text-md);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
  cursor: pointer;
  outline: 2px solid transparent;
  outline-offset: 2px;
  -webkit-tap-highlight-color: transparent;
  transition:
    color var(--juxt-duration-fast) var(--juxt-ease-standard),
    outline-color var(--juxt-duration-fast) var(--juxt-ease-out);
}

.j-collapsible__trigger:disabled {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-collapsible__chevron {
  flex: none;
  width: 1rem;
  height: 1rem;
  color: var(--juxt-fg-muted);
  transition: transform var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-collapsible[data-state='open'] .j-collapsible__chevron {
  transform: rotate(180deg);
}

.j-collapsible__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--juxt-duration-slow) var(--juxt-ease-out);
}

.j-collapsible[data-state='open'] .j-collapsible__panel {
  grid-template-rows: 1fr;
}

.j-collapsible__panel-inner {
  min-height: 0;
  overflow: hidden;
}

.j-collapsible__content {
  padding-top: var(--juxt-space-2);
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-md);
  line-height: var(--juxt-leading-normal);
  opacity: 0;
  transition: opacity var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-collapsible[data-state='open'] .j-collapsible__content {
  opacity: 1;
  transition-delay: 60ms;
}

@media (prefers-reduced-motion: reduce) {
  .j-collapsible__panel,
  .j-collapsible__chevron {
    transition: none;
  }
}
}
</style>
