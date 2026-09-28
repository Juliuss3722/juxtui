import type { ComputedRef, InjectionKey } from 'vue'

export type RadioValue = string | number

export interface RadioGroupContext {
  name: ComputedRef<string>
  value: ComputedRef<RadioValue | null | undefined>
  disabled: ComputedRef<boolean>
  required: ComputedRef<boolean>
  invalid: ComputedRef<boolean>
  select: (value: RadioValue) => void
}

export const RADIO_GROUP: InjectionKey<RadioGroupContext> = Symbol('JRadioGroup')
