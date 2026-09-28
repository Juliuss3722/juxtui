<script setup lang="ts">
/**
 * Internal: teleports its content to `<body>`, but only once mounted.
 *
 * Server-rendered teleports to `body` never make it into the HTML, so a plain
 * `<Teleport>` hydrates against nothing and warns. Rendering nothing until
 * mount keeps server and client output identical | and overlays are closed on
 * first paint anyway.
 */
import { onMounted, ref } from 'vue'

withDefaults(defineProps<{ to?: string }>(), { to: 'body' })
defineSlots<{ default?: () => unknown }>()

const mounted = ref(false)
onMounted(() => (mounted.value = true))
</script>

<template>
  <Teleport v-if="mounted" :to="to">
    <slot />
  </Teleport>
</template>
