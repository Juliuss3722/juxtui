<script setup lang="ts">
import { computed } from 'vue'
import JAvatar from '../avatar/JAvatar.vue'

export interface AvatarGroupItem {
  src?: string
  name?: string
}

export interface AvatarGroupProps {
  items: AvatarGroupItem[]
  /** Avatars shown before the rest collapse into a "+N" indicator. */
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  /** Accessible name for the group. Defaults to a plain count, not an assumption about who's in it. */
  label?: string
}

const props = withDefaults(defineProps<AvatarGroupProps>(), { size: 'md', shape: 'circle' })

const visible = computed(() => (props.max ? props.items.slice(0, props.max) : props.items))
const overflow = computed(() => Math.max(0, props.items.length - visible.value.length))
const groupLabel = computed(() => props.label ?? `${props.items.length} ${props.items.length === 1 ? 'avatar' : 'avatars'}`)
</script>

<template>
  <div class="j-avatar-group" :class="`j-avatar-group--${size}`" role="group" :aria-label="groupLabel">
    <span v-for="(item, index) in visible" :key="index" class="j-avatar-group__item">
      <JAvatar :src="item.src" :name="item.name" :size="size" :shape="shape" />
    </span>
    <span
      v-if="overflow > 0"
      class="j-avatar-group__item j-avatar-group__overflow j-focusable"
      :class="{ 'j-avatar-group__overflow--square': shape === 'square' }"
      tabindex="0"
      :aria-label="`${overflow} more`"
    >
      +{{ overflow }}
    </span>
  </div>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-avatar-group {
  --j-avatar-group-overlap: 0.5em;

  display: inline-flex;
  align-items: center;
  font-family: var(--juxt-font-sans);
}

.j-avatar-group__item {
  position: relative;
  display: inline-flex;
  flex: none;
  border-radius: var(--juxt-radius-full);
  box-shadow: 0 0 0 2px var(--juxt-bg);
}

.j-avatar-group__item:not(:first-child) {
  margin-left: calc(var(--j-avatar-group-overlap) * -1);
}

.j-avatar-group__overflow {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  background: var(--juxt-surface-active);
  color: var(--juxt-fg-secondary);
  font-size: var(--juxt-text-xs);
  font-weight: var(--juxt-weight-medium);
  font-variant-numeric: tabular-nums;
}

.j-avatar-group--xs .j-avatar-group__overflow {
  width: 1.25rem;
  height: 1.25rem;
  font-size: var(--juxt-text-2xs);
}

.j-avatar-group--sm .j-avatar-group__overflow {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.625rem;
}

.j-avatar-group--lg .j-avatar-group__overflow {
  width: 2.5rem;
  height: 2.5rem;
  font-size: var(--juxt-text-sm);
}

.j-avatar-group--xl .j-avatar-group__overflow {
  width: 3.5rem;
  height: 3.5rem;
  font-size: var(--juxt-text-lg);
}

.j-avatar-group__overflow--square {
  border-radius: 22%;
}
}
</style>
