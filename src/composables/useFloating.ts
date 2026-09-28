import type { Placement } from '@floating-ui/dom'
import type { CSSProperties, Ref } from 'vue'
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'

export type { Placement }

export interface FloatingOptions {
  placement?: Placement
  /** Gap between reference and floating element, in px. */
  offset?: number | { mainAxis?: number, crossAxis?: number }
  /** Make the floating element at least as wide as the reference. */
  matchWidth?: boolean
  /** Padding kept from the viewport edge, in px. */
  padding?: number
}

const ORIGIN: Record<string, string> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

/**
 * Position a floating element next to a reference element and keep it there
 * through scroll and resize. Coordinates are written to `left`/`top` so
 * `transform` stays free for enter/leave motion.
 */
export function useFloating(
  reference: Ref<HTMLElement | null>,
  floating: Ref<HTMLElement | null>,
  options: FloatingOptions | (() => FloatingOptions) = {},
) {
  const read = () => (typeof options === 'function' ? options() : options)
  const x = ref(0)
  const y = ref(0)
  const placement = ref<Placement>(read().placement ?? 'bottom-start')
  const availableHeight = ref<number>()
  const referenceWidth = ref<number>()
  const stop = shallowRef<() => void>()

  async function update() {
    const referenceEl = reference.value
    const floatingEl = floating.value
    if (!referenceEl || !floatingEl) return
    const opts = read()
    const padding = opts.padding ?? 8
    const result = await computePosition(referenceEl, floatingEl, {
      strategy: 'fixed',
      placement: opts.placement ?? 'bottom-start',
      middleware: [
        offset(opts.offset ?? 6),
        flip({ padding }),
        shift({ padding }),
        size({
          padding,
          apply({ availableHeight: height, rects }) {
            availableHeight.value = Math.max(120, Math.floor(height))
            referenceWidth.value = rects.reference.width
          },
        }),
      ],
    })
    x.value = Math.round(result.x)
    y.value = Math.round(result.y)
    placement.value = result.placement
  }

  watch(
    [reference, floating],
    ([referenceEl, floatingEl]) => {
      stop.value?.()
      stop.value = undefined
      if (referenceEl && floatingEl) stop.value = autoUpdate(referenceEl, floatingEl, update)
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => stop.value?.())

  const side = computed(() => placement.value.split('-')[0] as 'top' | 'bottom' | 'left' | 'right')

  const styles = computed<CSSProperties>(() => {
    const align = placement.value.split('-')[1]
    const cross = side.value === 'top' || side.value === 'bottom'
      ? (align === 'start' ? 'left' : align === 'end' ? 'right' : 'center')
      : (align === 'start' ? 'top' : align === 'end' ? 'bottom' : 'center')
    const origin = side.value === 'top' || side.value === 'bottom'
      ? `${cross} ${ORIGIN[side.value]}`
      : `${ORIGIN[side.value]} ${cross}`
    const dir = side.value === 'top' ? 1 : side.value === 'bottom' ? -1 : 0
    return {
      'position': 'fixed',
      'left': `${x.value}px`,
      'top': `${y.value}px`,
      'transformOrigin': origin,
      'minWidth': read().matchWidth && referenceWidth.value ? `${referenceWidth.value}px` : undefined,
      '--j-available-height': availableHeight.value ? `${availableHeight.value}px` : undefined,
      '--j-pop-dir': String(dir),
      '--j-pop-x': String(side.value === 'left' ? 1 : side.value === 'right' ? -1 : 0),
    } as CSSProperties
  })

  return { x, y, placement, side, styles, update }
}
