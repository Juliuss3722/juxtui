<script setup lang="ts">
import { computed } from 'vue'

export interface AspectRatioProps {
  /** Width/height ratio, e.g. `16 / 9` or `1`. */
  ratio?: number
}

const props = withDefaults(defineProps<AspectRatioProps>(), { ratio: 16 / 9 })

defineSlots<{ default?: () => unknown }>()

const style = computed(() => ({ '--j-aspect-ratio': String(props.ratio) }))
</script>

<template>
  <div class="j-aspect-ratio" :style="style">
    <div class="j-aspect-ratio__content">
      <slot />
    </div>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-aspect-ratio {
  position: relative;
  width: 100%;
  aspect-ratio: var(--j-aspect-ratio, 16 / 9);
}

.j-aspect-ratio__content {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.j-aspect-ratio__content > :where(img, video, iframe, canvas) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
}
</style>
