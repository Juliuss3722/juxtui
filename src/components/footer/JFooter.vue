<script setup lang="ts">
import { computed } from 'vue'

export interface FooterProps {
  /** Maximum content width; any CSS length. `none` spans the full width. */
  maxWidth?: string
  /** Hairline above the footer. */
  bordered?: boolean
}

const props = withDefaults(defineProps<FooterProps>(), { maxWidth: '72rem', bordered: true })

defineSlots<{
  /** Logo and a short line about the product. */
  brand?: () => unknown
  /** Link columns, typically `JFooterColumn`s. */
  default?: () => unknown
  /** The last line: copyright, legal links, social icons. */
  bottom?: () => unknown
}>()

const style = computed(() => ({ '--j-footer-max': props.maxWidth === 'none' ? 'none' : props.maxWidth }))
</script>

<template>
  <footer class="j-footer" :class="{ 'is-bordered': bordered }" :style="style">
    <div class="j-footer__inner">
      <div v-if="$slots.brand || $slots.default" class="j-footer__top">
        <div v-if="$slots.brand" class="j-footer__brand">
          <slot name="brand" />
        </div>
        <div v-if="$slots.default" class="j-footer__columns">
          <slot />
        </div>
      </div>
      <div v-if="$slots.bottom" class="j-footer__bottom">
        <slot name="bottom" />
      </div>
    </div>
  </footer>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
.j-footer {
  background: var(--juxt-bg);
  color: var(--juxt-fg-secondary);
  font-family: var(--juxt-font-sans);
  font-size: var(--juxt-text-sm);
}

.j-footer.is-bordered {
  border-top: 1px solid var(--juxt-border-subtle);
}

.dark .j-footer.is-bordered,
[data-theme='dark'] .j-footer.is-bordered {
  border-top-color: var(--juxt-border);
}

.j-footer__inner {
  max-width: var(--j-footer-max);
  margin: 0 auto;
  padding: var(--juxt-space-12) var(--juxt-space-4) var(--juxt-space-8);
}

.j-footer__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--juxt-space-10);
}

.j-footer__brand {
  display: flex;
  flex-direction: column;
  gap: var(--juxt-space-3);
  max-width: 18rem;
  color: var(--juxt-fg-muted);
  line-height: var(--juxt-leading-normal);
}

.j-footer__columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--juxt-space-8) var(--juxt-space-6);
}

@media (min-width: 768px) {
  .j-footer__top {
    grid-template-columns: minmax(12rem, 1fr) minmax(0, 2fr);
  }

  .j-footer__columns {
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  }
}

.j-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--juxt-space-3) var(--juxt-space-6);
  margin-top: var(--juxt-space-12);
  padding-top: var(--juxt-space-6);
  border-top: 1px solid var(--juxt-border-subtle);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
}

.dark .j-footer__bottom,
[data-theme='dark'] .j-footer__bottom {
  border-top-color: var(--juxt-border);
}

.j-footer__bottom a {
  color: inherit;
  text-decoration: none;
  transition: color var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-footer__bottom a:hover {
  color: var(--juxt-fg);
}
}
</style>
