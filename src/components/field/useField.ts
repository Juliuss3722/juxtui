import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue, useId } from 'vue'

export interface FieldProps {
  /** Visible label. Also used as the accessible name. */
  label?: string
  /** Supporting text under the control. Hidden while an error message is shown. */
  description?: string
  /** An error message, or `true` to mark the field invalid without a message. */
  error?: string | boolean
  required?: boolean
  disabled?: boolean
  /** Id for the control. Generated when omitted. */
  id?: string
}

/** Ids and ARIA wiring shared by every form control. */
export function useField(props: MaybeRefOrGetter<FieldProps>) {
  const generated = useId()
  const p = () => toValue(props)

  const id = computed(() => p().id ?? `j-${generated}`)
  const labelId = computed(() => `${id.value}-label`)
  const descriptionId = computed(() => `${id.value}-description`)
  const errorId = computed(() => `${id.value}-error`)

  const invalid = computed(() => !!p().error)
  const errorMessage = computed(() => (typeof p().error === 'string' ? (p().error as string) : ''))
  const showDescription = computed(() => !!p().description && !errorMessage.value)

  const describedBy = computed(() => {
    const ids: string[] = []
    if (errorMessage.value) ids.push(errorId.value)
    else if (p().description) ids.push(descriptionId.value)
    return ids.length ? ids.join(' ') : undefined
  })

  return { id, labelId, descriptionId, errorId, invalid, errorMessage, showDescription, describedBy }
}
