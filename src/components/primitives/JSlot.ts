import type { VNode } from 'vue'
import { cloneVNode, Comment, defineComponent, Fragment, h, Text } from 'vue'

function firstElement(nodes: VNode[] | undefined): VNode | undefined {
  if (!nodes) return undefined
  for (const node of nodes) {
    if (node.type === Comment) continue
    if (node.type === Fragment && Array.isArray(node.children)) {
      const found = firstElement(node.children as VNode[])
      if (found) return found
      continue
    }
    if (node.type === Text) {
      if (typeof node.children === 'string' && node.children.trim() === '') continue
      // Bare text can't hold attributes; give it an element.
      return h('span', null, node.children as string)
    }
    return node
  }
  return undefined
}

/**
 * Internal: renders its first child element and merges its own attributes
 * (ARIA, listeners, ids) onto it | no wrapper element.
 */
export const JSlot = defineComponent({
  name: 'JSlot',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => {
      const child = firstElement(slots.default?.())
      if (!child) return null
      // The consumer's own id wins; everything else is merged.
      const { id, ...rest } = attrs
      return cloneVNode(child, child.props?.id ? rest : { id, ...rest }, true)
    }
  },
})
