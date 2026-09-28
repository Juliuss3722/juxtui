<script setup lang="ts">
defineSlots<{ default?: () => unknown }>()
</script>

<template>
  <div class="j-menu__label" role="presentation">
    <slot />
  </div>
</template>
