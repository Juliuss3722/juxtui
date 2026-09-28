import type { ComputedRef, InjectionKey } from 'vue'

export type ToggleGroupType = 'single' | 'multiple'

export interface ToggleGroupContext {
  type: ComputedRef<ToggleGroupType>
  disabled: ComputedRef<boolean>
  isSelected: (value: string) => boolean
  toggle: (value: string) => void
}

export const TOGGLE_GROUP: InjectionKey<ToggleGroupContext> = Symbol('JToggleGroup')
