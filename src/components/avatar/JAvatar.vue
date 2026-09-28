<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline'

export interface AvatarProps {
  src?: string
  /** Image alt text. Defaults to `name`. */
  alt?: string
  /** Full name | used for initials and as the accessible name. */
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  status?: AvatarStatus
}

const props = withDefaults(defineProps<AvatarProps>(), { size: 'md', shape: 'circle' })

defineSlots<{ fallback?: () => unknown }>()

const state = ref<'loading' | 'loaded' | 'error'>(props.src ? 'loading' : 'error')
const img = ref<HTMLImageElement | null>(null)

watch(() => props.src, (src) => {
  state.value = src ? 'loading' : 'error'
})

// An image cached before hydration may have finished loading already.
onMounted(() => {
  if (img.value?.complete && img.value.naturalWidth > 0) state.value = 'loaded'
})

const initials = computed(() => {
  const parts = (props.name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0]!
  const last = parts.length > 1 ? parts[parts.length - 1]! : ''
  return (first[0]! + (last[0] ?? '')).toUpperCase()
})

const statusLabel: Record<AvatarStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
}

const label = computed(() => {
  const who = props.alt ?? props.name
  if (!who) return undefined
  return props.status ? `${who} (${statusLabel[props.status]})` : who
})
</script>

<template>
  <span
    class="j-avatar"
    :class="[`j-avatar--${size}`, `j-avatar--${shape}`]"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :data-state="state"
  >
    <span class="j-avatar__frame">
      <img
        v-if="src && state !== 'error'"
        ref="img"
        class="j-avatar__image"
        :src="src"
        alt=""
        @load="state = 'loaded'"
        @error="state = 'error'"
      />
      <span v-if="state !== 'loaded'" class="j-avatar__fallback" aria-hidden="true">
        <slot name="fallback">
          <template v-if="initials">{{ initials }}</template>
          <svg v-else viewBox="0 0 16 16" fill="currentColor" class="j-avatar__glyph">
            <circle cx="8" cy="6" r="2.75" />
            <path d="M2.75 14c.6-2.6 2.7-4.25 5.25-4.25S12.65 11.4 13.25 14z" />
          </svg>
        </slot>
      </span>
    </span>
    <span v-if="status" class="j-avatar__status" :class="`j-avatar__status--${status}`" aria-hidden="true" />
  </span>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-avatar {
  --j-avatar-size: 2rem;
  --j-avatar-font: var(--juxt-text-xs);
  --j-avatar-status: 0.5rem;
  --j-avatar-radius: var(--juxt-radius-full);

  position: relative;
  display: inline-flex;
  flex: none;
  width: var(--j-avatar-size);
  height: var(--j-avatar-size);
  font-family: var(--juxt-font-sans);
  vertical-align: middle;
}

.j-avatar--xs {
  --j-avatar-size: 1.25rem;
  --j-avatar-font: 0.5625rem;
  --j-avatar-status: 0.375rem;
}

.j-avatar--sm {
  --j-avatar-size: 1.5rem;
  --j-avatar-font: 0.625rem;
  --j-avatar-status: 0.4375rem;
}

.j-avatar--lg {
  --j-avatar-size: 2.5rem;
  --j-avatar-font: var(--juxt-text-sm);
  --j-avatar-status: 0.625rem;
}

.j-avatar--xl {
  --j-avatar-size: 3.5rem;
  --j-avatar-font: var(--juxt-text-lg);
  --j-avatar-status: 0.75rem;
}

.j-avatar--square {
  --j-avatar-radius: calc(var(--j-avatar-size) * 0.22);
}

.j-avatar__frame {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--j-avatar-radius);
  background: var(--juxt-surface-active);
  /* A hairline keeps light photos from bleeding into light backgrounds. */
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.06);
}

.dark .j-avatar__frame,
[data-theme='dark'] .j-avatar__frame {
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.06);
}

.j-avatar__image,
.j-avatar__fallback {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
}

.j-avatar__image {
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--juxt-duration-normal) var(--juxt-ease-standard);
}

.j-avatar[data-state='loaded'] .j-avatar__image {
  opacity: 1;
}

.j-avatar__fallback {
  display: grid;
  place-items: center;
  color: var(--juxt-fg-secondary);
  font-size: var(--j-avatar-font);
  font-weight: var(--juxt-weight-medium);
  letter-spacing: 0.02em;
  line-height: 1;
  user-select: none;
}

.j-avatar__glyph {
  width: 62%;
  height: 62%;
  margin-top: 18%;
  color: var(--juxt-fg-muted);
}

.j-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: var(--j-avatar-status);
  height: var(--j-avatar-status);
  border-radius: var(--juxt-radius-full);
  background: var(--juxt-fg-muted);
  /* The ring is the page background, so the dot cuts cleanly out of the photo. */
  box-shadow: 0 0 0 2px var(--j-avatar-ring, var(--juxt-bg));
}

.j-avatar--square .j-avatar__status {
  right: -2px;
  bottom: -2px;
}

.j-avatar__status--online {
  background: var(--juxt-accent);
}

.j-avatar__status--away {
  background: var(--juxt-warning);
}

.j-avatar__status--busy {
  background: var(--juxt-danger);
}

.j-avatar__status--offline {
  background: var(--juxt-fg-disabled);
}
}
</style>
