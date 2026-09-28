import type { FunctionalComponent, SVGAttributes } from 'vue'
import { h } from 'vue'

/*
 * Editor glyphs, drawn on the same 16px grid and 1.5px stroke as the rest of
 * juxt.ui so the toolbar sits at the weight of 13–14px text.
 */

type Icon = FunctionalComponent<SVGAttributes>

function icon(name: string, children: () => ReturnType<typeof h>[]): Icon {
  const component: Icon = props =>
    h(
      'svg',
      {
        'xmlns': 'http://www.w3.org/2000/svg',
        'viewBox': '0 0 16 16',
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

const p = (d: string) => h('path', { d })

export const IconBold = icon('IconBold', () => [p('M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z')])
export const IconItalic = icon('IconItalic', () => [p('M10 3H6.5M9.5 13H6M9 3 7 13')])
export const IconUnderline = icon('IconUnderline', () => [p('M4.5 2.75V7a3.5 3.5 0 0 0 7 0V2.75M3.5 13.5h9')])
export const IconStrike = icon('IconStrike', () => [p('M11.5 4.25C11 3.2 9.8 2.75 8.2 2.75 6.1 2.75 4.75 3.8 4.75 5.25c0 1 .6 1.7 1.7 2.1M3 8.25h10M11.25 10.25c.1.3.15.6.15.9 0 1.5-1.45 2.6-3.6 2.6-1.8 0-3.1-.6-3.65-1.75')])
export const IconCode = icon('IconCode', () => [p('M6 4.5 2.75 8 6 11.5M10 4.5 13.25 8 10 11.5')])
export const IconLink = icon('IconLink', () => [p('M6.75 9.25a2.75 2.75 0 0 0 3.9 0l2-2a2.75 2.75 0 0 0-3.9-3.9l-.6.6M9.25 6.75a2.75 2.75 0 0 0-3.9 0l-2 2a2.75 2.75 0 0 0 3.9 3.9l.6-.6')])
export const IconUnlink = icon('IconUnlink', () => [p('M9.8 3.95l.6-.6a2.75 2.75 0 0 1 3.9 3.9l-1.2 1.2M6.2 12.05l-.6.6a2.75 2.75 0 0 1-3.9-3.9l1.2-1.2M2.5 2.5l11 11')])
export const IconExternal = icon('IconExternal', () => [p('M9.5 2.75h3.75V6.5M13.25 2.75 7.5 8.5M11.5 9.5v2.75a1 1 0 0 1-1 1h-6.75a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1H6.5')])
export const IconHighlight = icon('IconHighlight', () => [p('M9.75 3.25l3 3-5.5 5.5H4.25v-3zM2.75 13.5h10.5')])
export const IconBulletList = icon('IconBulletList', () => [
  p('M6.5 4h7M6.5 8h7M6.5 12h7'),
  h('circle', { 'cx': 3, 'cy': 4, 'r': 0.6, 'fill': 'currentColor', 'stroke-width': 1 }),
  h('circle', { 'cx': 3, 'cy': 8, 'r': 0.6, 'fill': 'currentColor', 'stroke-width': 1 }),
  h('circle', { 'cx': 3, 'cy': 12, 'r': 0.6, 'fill': 'currentColor', 'stroke-width': 1 }),
])
export const IconOrderedList = icon('IconOrderedList', () => [p('M6.75 4h6.75M6.75 8h6.75M6.75 12h6.75M2.5 3l1-.5v3M2.5 5.5h2M2.5 9.25c0-.5.45-.9 1-.9s1 .35 1 .85c0 .9-2 1.3-2 2.3h2')])
export const IconTaskList = icon('IconTaskList', () => [p('M8 4.25h5.5M8 11.75h5.5M2.5 4.25l1.25 1.25L6 3.25'), h('rect', { x: 2.5, y: 9.75, width: 3.5, height: 3.5, rx: 0.75 })])
export const IconQuote = icon('IconQuote', () => [p('M3 4v8M6 5.5h7M6 8h7M6 10.5h4.5')])
export const IconCodeBlock = icon('IconCodeBlock', () => [h('rect', { x: 2, y: 2.75, width: 12, height: 10.5, rx: 2 }), p('M6.25 6.5 4.75 8l1.5 1.5M9.75 6.5l1.5 1.5-1.5 1.5')])
export const IconDivider = icon('IconDivider', () => [p('M2.5 8h11M5 4.5h6M5 11.5h6')])
export const IconUndo = icon('IconUndo', () => [p('M5.5 3.5 2.75 6.25 5.5 9M3 6.25h6.25a3.75 3.75 0 0 1 0 7.5H7')])
export const IconRedo = icon('IconRedo', () => [p('M10.5 3.5l2.75 2.75L10.5 9M13 6.25H6.75a3.75 3.75 0 0 0 0 7.5H9')])
export const IconText = icon('IconText', () => [p('M3.5 4V3h9v1M8 3v10M6.25 13h3.5')])
export const IconHeading1 = icon('IconHeading1', () => [p('M2.5 3.5v9M8 3.5v9M2.5 8H8M11 6.25l1.75-1.25v7.5')])
export const IconHeading2 = icon('IconHeading2', () => [p('M2.5 3.5v9M7.5 3.5v9M2.5 8h5M10.25 6.5c0-.95.75-1.6 1.6-1.6s1.65.6 1.65 1.55c0 1.95-3.25 2.8-3.25 5.05h3.3')])
export const IconHeading3 = icon('IconHeading3', () => [p('M2.5 3.5v9M7.5 3.5v9M2.5 8h5M10.25 5.25h3.25L11.75 7.7c1 0 1.75.7 1.75 1.75 0 1.2-.9 1.95-1.9 1.95-.7 0-1.2-.3-1.5-.8')])
export const IconChevronDown = icon('IconChevronDown', () => [p('M4.5 6.25 8 9.75l3.5-3.5')])
export const IconCornerDownLeft = icon('IconCornerDownLeft', () => [p('M12.5 3.5v4.25a2 2 0 0 1-2 2h-7M6 7l-2.5 2.75L6 12.5')])
