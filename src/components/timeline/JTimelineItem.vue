<script setup lang="ts">
export type TimelineItemStatus = 'complete' | 'current' | 'upcoming'

export interface TimelineItemProps {
  title?: string
  /** A timestamp or relative time, e.g. "2 hours ago". */
  time?: string
  status?: TimelineItemStatus
}

withDefaults(defineProps<TimelineItemProps>(), { status: 'complete' })

defineSlots<{
  default?: () => unknown
  title?: () => unknown
  /** Replace the default dot marker. */
  marker?: () => unknown
}>()
</script>

<template>
  <li class="j-timeline-item" :class="`j-timeline-item--${status}`">
    <span class="j-timeline-item__rail" aria-hidden="true">
      <span class="j-timeline-item__marker">
        <slot name="marker" />
      </span>
    </span>
    <div class="j-timeline-item__content">
      <div class="j-timeline-item__header">
        <p v-if="title || $slots.title" class="j-timeline-item__title">
          <slot name="title">{{ title }}</slot>
        </p>
        <time v-if="time" class="j-timeline-item__time">{{ time }}</time>
      </div>
      <div v-if="$slots.default" class="j-timeline-item__body">
        <slot />
      </div>
    </div>
  </li>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-timeline-item {
  position: relative;
  display: flex;
  gap: var(--juxt-space-3);
  padding-bottom: var(--juxt-space-5);
}

.j-timeline-item:last-child {
  padding-bottom: 0;
}

.j-timeline-item__rail {
  position: relative;
  display: flex;
  flex: none;
  justify-content: center;
  width: 1rem;
}

.j-timeline-item__rail::before {
  content: '';
  position: absolute;
  top: 1rem;
  bottom: calc(var(--juxt-space-5) * -1);
  width: 1px;
  background: var(--juxt-border);
}

.j-timeline-item:last-child .j-timeline-item__rail::before {
  display: none;
}

.j-timeline-item__marker {
  z-index: 1;
  display: grid;
  place-items: center;
  width: 0.625rem;
  height: 0.625rem;
  margin-top: 0.25rem;
  border: 2px solid var(--juxt-surface);
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-fg-disabled);
  box-shadow: 0 0 0 1px var(--juxt-border);
}

.j-timeline-item--complete .j-timeline-item__marker {
  background: var(--juxt-accent);
  box-shadow: none;
}

.j-timeline-item--current .j-timeline-item__marker {
  background: var(--juxt-surface);
  box-shadow: 0 0 0 2px var(--juxt-accent);
}

.j-timeline-item__content {
  flex: 1;
  min-width: 0;
  padding-bottom: var(--juxt-space-0-5);
}

.j-timeline-item__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--juxt-space-2);
}

.j-timeline-item__title {
  margin: 0;
  color: var(--juxt-fg);
  font-size: var(--juxt-text-md);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: var(--juxt-tracking-tight);
}

.j-timeline-item--upcoming .j-timeline-item__title {
  color: var(--juxt-fg-muted);
}

.j-timeline-item__time {
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  font-variant-numeric: tabular-nums;
}

.j-timeline-item__body {
  margin-top: var(--juxt-space-0-5);
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-sm);
  line-height: var(--juxt-leading-normal);
}
}
</style>
