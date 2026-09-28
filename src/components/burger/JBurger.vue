<script setup lang="ts">
export interface BurgerProps {
  /** Accessible name while closed. */
  openLabel?: string
  /** Accessible name while open. */
  closeLabel?: string
  size?: 'sm' | 'md'
  /** Id of the element this button shows and hides. */
  controls?: string
}

withDefaults(defineProps<BurgerProps>(), {
  openLabel: 'Open menu',
  closeLabel: 'Close menu',
  size: 'md',
})

const open = defineModel<boolean>({ default: false })
</script>

<template>
  <button
    type="button"
    class="j-burger j-focusable"
    :class="`j-burger--${size}`"
    :data-state="open ? 'open' : 'closed'"
    :aria-expanded="open"
    :aria-controls="controls"
    :aria-label="open ? closeLabel : openLabel"
    @click="open = !open"
  >
    <span class="j-burger__lines" aria-hidden="true">
      <span class="j-burger__line" />
      <span class="j-burger__line" />
      <span class="j-burger__line" />
    </span>
  </button>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-burger {
  --j-burger-size: var(--juxt-control-md);
  --j-burger-width: 1rem;
  --j-burger-gap: 0.3125rem;

  display: inline-grid;
  place-items: center;
  width: var(--j-burger-size);
  height: var(--j-burger-size);
  padding: 0;
  border: 0;
  border-radius: var(--juxt-radius-sm);
  background: transparent;
  color: var(--juxt-fg);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition-property: background-color, outline-color, outline-offset;
}

.j-burger--sm {
  --j-burger-size: var(--juxt-control-sm);
  --j-burger-width: 0.875rem;
  --j-burger-gap: 0.25rem;
}

.j-burger:hover {
  background: var(--juxt-surface-hover);
}

.j-burger__lines {
  position: relative;
  display: block;
  width: var(--j-burger-width);
  height: calc(var(--j-burger-gap) * 2 + 1.5px);
}

.j-burger__line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1.5px;
  border-radius: 1px;
  background: currentColor;
  transition:
    transform var(--juxt-duration-normal) var(--juxt-ease-out),
    opacity var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-burger__line:nth-child(1) {
  top: 0;
}

.j-burger__line:nth-child(2) {
  top: var(--j-burger-gap);
}

.j-burger__line:nth-child(3) {
  top: calc(var(--j-burger-gap) * 2);
}

/* Outer lines meet in the middle and cross; the middle one fades. */
.j-burger[data-state='open'] .j-burger__line:nth-child(1) {
  transform: translateY(var(--j-burger-gap)) rotate(45deg);
}

.j-burger[data-state='open'] .j-burger__line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0.4);
}

.j-burger[data-state='open'] .j-burger__line:nth-child(3) {
  transform: translateY(calc(var(--j-burger-gap) * -1)) rotate(-45deg);
}

@media (prefers-reduced-motion: reduce) {
  .j-burger__line {
    transition-duration: 0ms;
  }
}
}
</style>
