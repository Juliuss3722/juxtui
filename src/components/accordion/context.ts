import type { InjectionKey } from 'vue'

export interface AccordionContext {
  isOpen: (value: string) => boolean
  toggle: (value: string) => void
  headingLevel: () => number
}

export const ACCORDION: InjectionKey<AccordionContext> = Symbol('JAccordion')
