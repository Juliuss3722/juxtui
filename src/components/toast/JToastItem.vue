<script setup lang="ts">
/** Internal: one toast. Owns its timer, swipe gesture and keyboard dismissal. */
import type { Toast } from '../../composables/useToast'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { IconAlert, IconCircleCheck, IconCircleX, IconInfo, IconX, Spinner } from '../../icons'

const props = defineProps<{
  toast: Toast
  paused: boolean
}>()

const emit = defineEmits<{ dismiss: [id: string] }>()

const el = ref<HTMLElement | null>(null)
const timed = computed(() => Number.isFinite(props.toast.duration) && props.toast.duration > 0)

// --- Timer -----------------------------------------------------------------
let timer: ReturnType<typeof setTimeout> | undefined
let remaining = 0
let startedAt = 0

function start() {
  clearTimeout(timer)
  if (!timed.value || props.paused) return
  startedAt = Date.now()
  timer = setTimeout(() => emit('dismiss', props.toast.id), remaining)
}

function pause() {
  if (!timer) return
  clearTimeout(timer)
  timer = undefined
  remaining -= Date.now() - startedAt
}

function reset() {
  remaining = props.toast.duration
  start()
}

onMounted(reset)
onBeforeUnmount(() => clearTimeout(timer))
watch(() => props.toast.version, reset)
watch(() => props.paused, value => (value ? pause() : start()))

// --- Swipe to dismiss ------------------------------------------------------
const offset = ref(0)
const swiping = ref(false)
const leaving = ref<0 | 1 | -1>(0)
let origin: { x: number, y: number, id: number } | null = null

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 || (event.target as HTMLElement).closest('button, a')) return
  origin = { x: event.clientX, y: event.clientY, id: event.pointerId }
}

function onPointerMove(event: PointerEvent) {
  if (!origin || event.pointerId !== origin.id) return
  const dx = event.clientX - origin.x
  if (!swiping.value) {
    // Commit to a swipe only once the gesture is clearly horizontal.
    if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(event.clientY - origin.y)) return
    swiping.value = true
    el.value?.setPointerCapture(event.pointerId)
  }
  offset.value = dx
}

function onPointerUp() {
  if (!origin) return
  origin = null
  if (!swiping.value) return
  swiping.value = false
  if (Math.abs(offset.value) > 64 && props.toast.dismissible) {
    leaving.value = offset.value > 0 ? 1 : -1
    emit('dismiss', props.toast.id)
  } else {
    offset.value = 0
  }
}

const style = computed(() => {
  if (!offset.value) return undefined
  return {
    '--j-toast-swipe': `${offset.value}px`,
    '--j-toast-swipe-opacity': String(Math.max(0, 1 - Math.abs(offset.value) / 200)),
  }
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.toast.dismissible) {
    event.preventDefault()
    event.stopPropagation()
    const next = (el.value?.nextElementSibling ?? el.value?.previousElementSibling) as HTMLElement | null
    emit('dismiss', props.toast.id)
    next?.focus()
  }
}

function runAction() {
  props.toast.action?.onClick()
  emit('dismiss', props.toast.id)
}

const icons = {
  success: IconCircleCheck,
  error: IconCircleX,
  warning: IconAlert,
  info: IconInfo,
}
</script>

<template>
  <li
    ref="el"
    class="j-toast"
    :class="[`j-toast--${toast.type}`, { 'is-swiping': swiping, 'is-swiped': leaving !== 0 }]"
    :style="style"
    :data-swipe-direction="leaving"
    :role="toast.type === 'error' ? 'alert' : undefined"
    tabindex="0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown="onKeydown"
  >
    <span v-if="toast.type !== 'default'" class="j-toast__icon" aria-hidden="true">
      <Transition name="j-toast-icon" mode="out-in">
        <Spinner v-if="toast.type === 'loading'" :size="16" />
        <component :is="icons[toast.type]" v-else :key="toast.type" />
      </Transition>
    </span>
    <div class="j-toast__body">
      <p class="j-toast__title">
        {{ toast.title }}
      </p>
      <p v-if="toast.description" class="j-toast__description">
        {{ toast.description }}
      </p>
      <div v-if="toast.action" class="j-toast__actions">
        <button type="button" class="j-toast__action j-focusable" @click="runAction">
          {{ toast.action.label }}
        </button>
      </div>
    </div>
    <button
      v-if="toast.dismissible"
      type="button"
      class="j-toast__close j-focusable"
      aria-label="Dismiss notification"
      @click="emit('dismiss', toast.id)"
    >
      <IconX />
    </button>
    <span
      v-if="timed"
      :key="toast.version"
      class="j-toast__progress"
      :class="{ 'is-paused': paused }"
      :style="{ animationDuration: `${toast.duration}ms` }"
      aria-hidden="true"
    />
  </li>
</template>
