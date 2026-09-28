import { reactive, readonly } from 'vue'

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /** Reuse an id to replace an existing toast instead of stacking a new one. */
  id?: string
  description?: string
  type?: ToastType
  /** Time on screen in ms. `Infinity` keeps it until dismissed. Loading toasts never expire. */
  duration?: number
  action?: ToastAction
  /** Show the close button. Defaults to true. */
  dismissible?: boolean
  onDismiss?: () => void
}

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration: number
  action?: ToastAction
  dismissible: boolean
  onDismiss?: () => void
  /** Bumps whenever the toast changes, restarting its timer. */
  version: number
}

export const DEFAULT_TOAST_DURATION = 5000

const state = reactive<{ toasts: Toast[] }>({ toasts: [] })
let counter = 0

function resolveDuration(type: ToastType, duration?: number) {
  if (duration !== undefined) return duration
  if (type === 'loading') return Number.POSITIVE_INFINITY
  // Errors deserve a little longer to be read.
  if (type === 'error') return DEFAULT_TOAST_DURATION + 2000
  return DEFAULT_TOAST_DURATION
}

function create(title: string, options: ToastOptions = {}): string {
  const type = options.type ?? 'default'
  const existing = options.id ? state.toasts.find(t => t.id === options.id) : undefined
  if (existing) {
    update(existing.id, { title, ...options })
    return existing.id
  }
  const id = options.id ?? `toast-${++counter}`
  state.toasts.push({
    id,
    title,
    description: options.description,
    type,
    duration: resolveDuration(type, options.duration),
    action: options.action,
    dismissible: options.dismissible ?? true,
    onDismiss: options.onDismiss,
    version: 0,
  })
  return id
}

function update(id: string, patch: Partial<ToastOptions> & { title?: string }) {
  const item = state.toasts.find(t => t.id === id)
  if (!item) return
  const type = patch.type ?? item.type
  Object.assign(item, {
    ...patch,
    type,
    duration: patch.duration !== undefined || patch.type ? resolveDuration(type, patch.duration) : item.duration,
    version: item.version + 1,
  })
}

function dismiss(id?: string) {
  if (id === undefined) {
    const all = state.toasts.splice(0)
    all.forEach(t => t.onDismiss?.())
    return
  }
  const index = state.toasts.findIndex(t => t.id === id)
  if (index === -1) return
  const [removed] = state.toasts.splice(index, 1)
  removed?.onDismiss?.()
}

type Message<T> = string | ((value: T) => string)

interface PromiseMessages<T> {
  loading: string
  success: Message<T>
  error: Message<unknown>
  description?: string
}

function promise<T>(input: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>): Promise<T> {
  const id = create(messages.loading, { type: 'loading', description: messages.description })
  const run = typeof input === 'function' ? input() : input
  run.then(
    (value) => {
      const title = typeof messages.success === 'function' ? messages.success(value) : messages.success
      update(id, { title, type: 'success', description: undefined })
    },
    (error: unknown) => {
      const title = typeof messages.error === 'function' ? messages.error(error) : messages.error
      update(id, { title, type: 'error', description: undefined })
    },
  )
  return run
}

type Shortcut = (title: string, options?: Omit<ToastOptions, 'type'>) => string
const typed = (type: ToastType): Shortcut => (title, options) => create(title, { ...options, type })

export interface ToastFn {
  (title: string, options?: ToastOptions): string
  success: Shortcut
  error: Shortcut
  warning: Shortcut
  info: Shortcut
  loading: Shortcut
  promise: typeof promise
  update: typeof update
  dismiss: typeof dismiss
}

/** Show a toast. Works anywhere | inside or outside components. */
export const toast: ToastFn = Object.assign(create, {
  success: typed('success'),
  error: typed('error'),
  warning: typed('warning'),
  info: typed('info'),
  loading: typed('loading'),
  promise,
  update,
  dismiss,
})

export function useToast() {
  return {
    toast,
    dismiss,
    update,
    toasts: readonly(state).toasts,
  }
}

/** @internal Mutable access for JToaster and tests. */
export const toastState = state
