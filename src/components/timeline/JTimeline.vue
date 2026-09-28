<script setup lang="ts">
defineSlots<{ default?: () => unknown }>()
</script>

<template>
  <ol class="j-timeline">
    <slot />
  </ol>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-timeline {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--juxt-font-sans);
}
}
</style>
