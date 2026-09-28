import type { Ref } from 'vue'
import { onBeforeUnmount, watch } from 'vue'
import { isClient } from '../utils/dom'

export interface LayerOptions {
  /** The layer is registered only while this is true. */
  active: Readonly<Ref<boolean>>
  /** Elements that count as "inside" the layer. */
  elements: () => Array<HTMLElement | null | undefined>
  onEscape?: (event: KeyboardEvent) => void
  /** Called when a pointer goes down outside every element of the top-most layer. */
  onPointerDownOutside?: (event: PointerEvent) => void
}

interface Layer {
  options: LayerOptions
}

/*
 * Overlays stack. A select inside a dialog, a submenu inside a menu, a tooltip
 * inside anything: Escape and outside clicks belong to whichever layer is on
 * top, and only to that one.
 */
const layers: Layer[] = []
let listening = false

function top() {
  return layers[layers.length - 1]
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return
  const layer = top()
  if (!layer?.options.onEscape) return
  event.preventDefault()
  event.stopPropagation()
  layer.options.onEscape(event)
}

function onPointerDown(event: PointerEvent) {
  const layer = top()
  if (!layer?.options.onPointerDownOutside) return
  const target = event.target as Node | null
  if (!target) return
  if ((target as HTMLElement).closest?.('[data-juxt-layer-ignore]')) return
  const inside = layer.options.elements().some(el => el?.contains(target))
  if (!inside) layer.options.onPointerDownOutside(event)
}

function listen() {
  if (listening || !isClient) return
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onPointerDown, true)
  listening = true
}

function unlisten() {
  if (!listening || layers.length > 0) return
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown, true)
  listening = false
}

export function useLayer(options: LayerOptions) {
  const layer: Layer = { options }

  const add = () => {
    if (layers.includes(layer)) return
    layers.push(layer)
    listen()
  }

  const remove = () => {
    const index = layers.indexOf(layer)
    if (index === -1) return
    layers.splice(index, 1)
    unlisten()
  }

  if (isClient) {
    watch(options.active, value => (value ? add() : remove()), { immediate: true })
    onBeforeUnmount(remove)
  }

  return {
    isTopLayer: () => top() === layer,
  }
}
