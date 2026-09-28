import type { FunctionalComponent, SVGAttributes } from 'vue'
import { h } from 'vue'

/*
 * The handful of glyphs Juxt needs internally. Drawn on a 16px grid with a
 * 1.5px stroke so they sit at the same optical weight as 13–14px text.
 */

type Icon = FunctionalComponent<SVGAttributes>

function icon(name: string, children: () => ReturnType<typeof h>[], viewBox = '0 0 16 16'): Icon {
  const component: Icon = (props) =>
    h(
      'svg',
      {
        'xmlns': 'http://www.w3.org/2000/svg',
        viewBox,
        'width': 16,
        'height': 16,
        'fill': 'none',
        'stroke': 'currentColor',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
        'focusable': 'false',
        ...props,
      },
      children(),
    )
  component.displayName = name
  return component
}

export const IconCheck = icon('IconCheck', () => [h('path', { d: 'M3.5 8.5l3 3 6-7' })])
export const IconChevronDown = icon('IconChevronDown', () => [h('path', { d: 'M4.5 6.25L8 9.75l3.5-3.5' })])
export const IconChevronUpDown = icon('IconChevronUpDown', () => [h('path', { d: 'M5.25 6L8 3.25 10.75 6M5.25 10L8 12.75 10.75 10' })])
export const IconChevronRight = icon('IconChevronRight', () => [h('path', { d: 'M6.25 4.5L9.75 8l-3.5 3.5' })])
export const IconX = icon('IconX', () => [h('path', { d: 'M4.5 4.5l7 7M11.5 4.5l-7 7' })])
export const IconSearch = icon('IconSearch', () => [h('circle', { cx: 7, cy: 7, r: 4.25 }), h('path', { d: 'M10.25 10.25L13 13' })])
export const IconCircleCheck = icon('IconCircleCheck', () => [h('circle', { cx: 8, cy: 8, r: 6.25 }), h('path', { d: 'M5.5 8.25l1.75 1.75L10.5 6.5' })])
export const IconCircleX = icon('IconCircleX', () => [h('circle', { cx: 8, cy: 8, r: 6.25 }), h('path', { d: 'M6.25 6.25l3.5 3.5M9.75 6.25l-3.5 3.5' })])
export const IconAlert = icon('IconAlert', () => [
  h('path', { d: 'M7.13 2.75a1 1 0 0 1 1.74 0l5.15 9a1 1 0 0 1-.87 1.5H2.85a1 1 0 0 1-.87-1.5z' }),
  h('path', { d: 'M8 6.5v2.5' }),
  h('path', { 'd': 'M8 11.1v.01', 'stroke-width': 1.75 }),
])
export const IconInfo = icon('IconInfo', () => [
  h('circle', { cx: 8, cy: 8, r: 6.25 }),
  h('path', { d: 'M8 7.5v3.25' }),
  h('path', { 'd': 'M8 5.25v.01', 'stroke-width': 1.75 }),
])
export const IconCornerDownLeft = icon('IconCornerDownLeft', () => [h('path', { d: 'M12.5 3.5v4.25a2 2 0 0 1-2 2h-7' }), h('path', { d: 'M6 7l-2.5 2.75L6 12.5' })])
export const IconChevronLeft = icon('IconChevronLeft', () => [h('path', { d: 'M9.75 4.5L6.25 8l3.5 3.5' })])
export const IconMoreHorizontal = icon('IconMoreHorizontal', () => [
  h('circle', { cx: 3.5, cy: 8, r: 1, 'fill': 'currentColor', 'stroke': 'none' }),
  h('circle', { cx: 8, cy: 8, r: 1, 'fill': 'currentColor', 'stroke': 'none' }),
  h('circle', { cx: 12.5, cy: 8, r: 1, 'fill': 'currentColor', 'stroke': 'none' }),
])
export const IconArrowUpRight = icon('IconArrowUpRight', () => [h('path', { d: 'M5 11L11 5M5.5 5h5.5v5.5' })])
export const IconArrowDownRight = icon('IconArrowDownRight', () => [h('path', { d: 'M5 5l6 6M10.5 11H5V5.5' })])

/** The loading spinner used across Juxt. A quarter arc over a faint track. */
export const Spinner: FunctionalComponent<{ size?: number }> = (props) => {
  const size = props.size ?? 16
  return h(
    'svg',
    { 'class': 'j-spinner', 'viewBox': '0 0 16 16', 'width': size, 'height': size, 'aria-hidden': 'true', 'focusable': 'false' },
    [
      h('circle', { 'class': 'j-spinner__track', 'cx': 8, 'cy': 8, 'r': 6, 'stroke-width': 1.75 }),
      h('circle', { 'cx': 8, 'cy': 8, 'r': 6, 'stroke-width': 1.75, 'stroke-dasharray': '9.5 28', 'stroke-dashoffset': 0 }),
    ],
  )
}
Spinner.displayName = 'JSpinner'
