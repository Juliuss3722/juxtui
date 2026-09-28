<script setup lang="ts">
import { computed } from 'vue'

export interface SkeletonProps {
  /** `text` renders one or more lines; `circle` suits avatars. */
  shape?: 'rect' | 'text' | 'circle'
  /** Number of lines for `text`. The last one is shorter, like a real paragraph. */
  lines?: number
  /** Any CSS length, e.g. `12rem` or `100%`. */
  width?: string
  height?: string
}

const props = withDefaults(defineProps<SkeletonProps>(), { shape: 'rect', lines: 1 })

const style = computed(() => ({ width: props.width, height: props.height }))
</script>

<template>
  <span v-if="shape === 'text'" class="j-skeleton-lines" :style="{ width }" aria-hidden="true">
    <span
      v-for="i in lines"
      :key="i"
      class="j-skeleton j-skeleton--text"
      :style="{ width: i === lines && lines > 1 ? '62%' : undefined, height }"
    />
  </span>
  <span v-else class="j-skeleton" :class="`j-skeleton--${shape}`" :style="style" aria-hidden="true" />
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-skeleton {
  display: block;
  width: 100%;
  height: 1rem;
  border-radius: var(--juxt-radius-sm);
  background: var(--juxt-surface-active);
  animation: j-skeleton-pulse 1.8s var(--juxt-ease-standard) infinite;
}

.j-skeleton--circle {
  width: 2rem;
  height: 2rem;
  border-radius: var(--juxt-radius-full);
}

.j-skeleton--text {
  height: 0.75rem;
  border-radius: var(--juxt-radius-xs);
}

.j-skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-2);
  width: 100%;
}

/* A slow breath, not a shimmer | loading shouldn't compete for attention. */
@keyframes j-skeleton-pulse {
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .j-skeleton {
    animation: none;
  }
}
}
</style>
