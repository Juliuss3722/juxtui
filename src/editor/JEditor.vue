<script setup lang="ts">
import type { Editor, JSONContent } from '@tiptap/core'
import type { FieldProps } from '../components/field/useField'
import type { BlockCommand } from './commands'
import type { SlashState } from './slash'
import { Extension } from '@tiptap/core'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Typography } from '@tiptap/extension-typography'
import { CharacterCount, Placeholder } from '@tiptap/extensions'
import { StarterKit } from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import JDropdownMenu from '../components/dropdown-menu/JDropdownMenu.vue'
import JDropdownMenuItem from '../components/dropdown-menu/JDropdownMenuItem.vue'
import JFieldShell from '../components/field/JFieldShell.vue'
import { useField } from '../components/field/useField'
import JPortal from '../components/primitives/JPortal.vue'
import { useFloating } from '../composables/useFloating'
import { useLayer } from '../composables/useLayer'
import { blockCommands } from './commands'
import {
  IconBold,
  IconChevronDown,
  IconCode,
  IconCornerDownLeft,
  IconExternal,
  IconHighlight,
  IconItalic,
  IconLink,
  IconRedo,
  IconStrike,
  IconUnderline,
  IconUndo,
  IconUnlink,
} from './icons'
import JEditorButton from './JEditorButton.vue'
import { createSlashCommands } from './slash'

export type EditorFormat = 'html' | 'json'

export interface EditorProps extends FieldProps {
  placeholder?: string
  /** Shape of `v-model`: an HTML string, or Tiptap/ProseMirror JSON. */
  format?: EditorFormat
  /** `full` shows every tool, `minimal` just the inline marks and lists, `false` hides the toolbar. */
  toolbar?: 'full' | 'minimal' | false
  /** Formatting menu that floats above selected text. */
  bubbleMenu?: boolean
  /** Type `/` for a menu of blocks. */
  slashCommands?: boolean
  /** Maximum number of characters. Shown in the footer and enforced while typing. */
  limit?: number
  /** Show word and character counts. */
  showCount?: boolean
  /** Height of the writing area before it grows. Any CSS length. */
  minHeight?: string
  /** Height after which the writing area scrolls. Any CSS length. */
  maxHeight?: string
  readonly?: boolean
  autofocus?: boolean | 'start' | 'end'
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<EditorProps>(), {
  placeholder: 'Write something, or type / for blocks…',
  format: 'html',
  toolbar: 'full',
  bubbleMenu: true,
  slashCommands: true,
  showCount: false,
  minHeight: '10rem',
  error: undefined,
})

const model = defineModel<string | JSONContent | null>({ default: '' })

const emit = defineEmits<{
  /** The editor instance is ready, for advanced use. */
  ready: [editor: Editor]
  focus: []
  blur: []
}>()

defineSlots<{
  /** Extra controls at the end of the toolbar. */
  'toolbar-end'?: (props: { editor: Editor }) => unknown
  'label'?: () => unknown
}>()

const field = useField(props)
const root = ref<HTMLElement | null>(null)
const slashId = `${field.id.value}-blocks`

// --- Slash menu state -----------------------------------------------------
const slash = reactive<SlashState>({ open: false, query: '', items: [], index: 0, rect: null, select: null })

// --- Editor ----------------------------------------------------------------
let lastEmitted: string | null = null
const serialize = (value: unknown) => (typeof value === 'string' ? value : JSON.stringify(value ?? ''))

function contentFromModel() {
  const value = model.value
  if (!value) return ''
  return value
}

const LinkShortcut = Extension.create({
  name: 'juxtLinkShortcut',
  addKeyboardShortcuts() {
    return {
      'Mod-k': () => {
        openLink()
        return true
      },
    }
  },
})

const editor = useEditor({
  content: contentFromModel(),
  editable: !props.disabled && !props.readonly,
  autofocus: props.autofocus ?? false,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: null },
      },
      codeBlock: { HTMLAttributes: { spellcheck: 'false' } },
      dropcursor: { color: 'var(--juxt-accent)', width: 2 },
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight,
    Typography,
    Placeholder.configure({
      // Empty document: the placeholder. Empty heading: its level. Empty line
      // under the caret: a quiet hint that blocks are a slash away.
      placeholder: ({ editor: instance, node }) => {
        if (node.type.name === 'heading') return `Heading ${node.attrs.level}`
        if (instance.isEmpty) return props.placeholder
        return props.slashCommands ? 'Type / for blocks' : ''
      },
    }),
    CharacterCount.configure({ limit: props.limit ?? null }),
    LinkShortcut,
    ...(props.slashCommands ? [createSlashCommands(slash)] : []),
  ],
  editorProps: {
    attributes: editorAttributes(),
  },
  onCreate: ({ editor: instance }) => emit('ready', instance),
  onFocus: () => emit('focus'),
  onBlur: () => emit('blur'),
  onUpdate: ({ editor: instance }) => {
    const value = props.format === 'json' ? instance.getJSON() : instance.isEmpty ? '' : instance.getHTML()
    lastEmitted = serialize(value)
    model.value = value
  },
})

function editorAttributes(): Record<string, string> {
  const attrs: Record<string, string> = {
    'role': 'textbox',
    'aria-multiline': 'true',
    'class': 'j-editor__prose',
  }
  if (props.label || props.id) attrs['aria-labelledby'] = field.labelId.value
  if (field.describedBy.value) attrs['aria-describedby'] = field.describedBy.value
  if (field.invalid.value) attrs['aria-invalid'] = 'true'
  if (props.required) attrs['aria-required'] = 'true'
  if (props.disabled || props.readonly) attrs['aria-readonly'] = 'true'
  if (slash.open) {
    attrs['aria-controls'] = slashId
    attrs['aria-expanded'] = 'true'
    const active = slash.items[slash.index]
    if (active) attrs['aria-activedescendant'] = `${slashId}-${active.id}`
  }
  return attrs
}

// Keep ARIA on the editable element in sync with the field and the slash menu.
watch(
  [() => field.describedBy.value, () => field.invalid.value, () => props.disabled, () => props.readonly, () => slash.open, () => slash.index, () => slash.items],
  () => editor.value?.setOptions({ editorProps: { attributes: editorAttributes() } }),
)

// Outside changes to v-model replace the content; our own echoes don't.
watch(model, (value) => {
  const instance = editor.value
  if (!instance || serialize(value) === lastEmitted) return
  instance.commands.setContent(value || '', { emitUpdate: false })
  lastEmitted = serialize(value)
})

watch(() => [props.disabled, props.readonly], () => editor.value?.setEditable(!props.disabled && !props.readonly))

// --- Toolbar state -----------------------------------------------------------
const currentBlock = computed<BlockCommand>(() => {
  const instance = editor.value
  const fallback = blockCommands[0]!
  if (!instance) return fallback
  return blockCommands.find(command => command.convertible && command.id !== 'text' && command.isActive?.(instance)) ?? fallback
})

const can = computed(() => ({
  undo: !!editor.value?.can().undo(),
  redo: !!editor.value?.can().redo(),
}))

const editable = computed(() => !!editor.value && !props.disabled && !props.readonly)

function run(fn: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) {
  const instance = editor.value
  if (!instance) return
  fn(instance.chain().focus()).run()
}

// Arrow keys move along the toolbar; Tab moves past it (roving tabindex).
function onToolbarKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return
  const toolbar = event.currentTarget as HTMLElement
  const items = Array.from(toolbar.querySelectorAll<HTMLElement>('[data-editor-control]:not(:disabled)'))
  const index = items.indexOf(document.activeElement as HTMLElement)
  if (index === -1) return
  event.preventDefault()
  let next = index
  if (event.key === 'ArrowRight') next = (index + 1) % items.length
  else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
  else if (event.key === 'Home') next = 0
  else next = items.length - 1
  items.forEach((item, i) => (item.tabIndex = i === next ? 0 : -1))
  items[next]!.focus()
}

function initRovingTabindex(el: unknown) {
  const toolbar = el as HTMLElement | null
  if (!toolbar) return
  nextTick(() => {
    const items = Array.from(toolbar.querySelectorAll<HTMLElement>('[data-editor-control]'))
    if (items.some(item => item.tabIndex === 0)) return
    items.forEach((item, i) => (item.tabIndex = i === 0 ? 0 : -1))
  })
}

// --- Floating panels positioned at the text -------------------------------
function virtualAt(getRect: () => DOMRect | null) {
  return {
    getBoundingClientRect: () => getRect() ?? new DOMRect(),
    get contextElement() {
      return editor.value?.view.dom
    },
  } as unknown as HTMLElement
}

// Slash menu
const slashEl = ref<HTMLElement | null>(null)
const slashRef = shallowRef<HTMLElement | null>(virtualAt(() => slash.rect))
const { styles: slashStyles, update: updateSlash } = useFloating(slashRef, slashEl, { placement: 'bottom-start', offset: 6 })
watch(() => slash.rect, () => nextTick(updateSlash))
watch(() => slash.index, () => nextTick(() => document.getElementById(`${slashId}-${slash.items[slash.index]?.id}`)?.scrollIntoView({ block: 'nearest' })))

// Link editor
const link = reactive({ open: false, url: '', rect: null as DOMRect | null, active: false })
const linkEl = ref<HTMLElement | null>(null)
const linkInput = ref<HTMLInputElement | null>(null)
const linkRef = shallowRef<HTMLElement | null>(virtualAt(() => link.rect))
const { styles: linkStyles, update: updateLink } = useFloating(linkRef, linkEl, { placement: 'bottom-start', offset: 8 })

function selectionRect(instance: Editor): DOMRect {
  const { from, to } = instance.state.selection
  const start = instance.view.coordsAtPos(from)
  const end = instance.view.coordsAtPos(to)
  const left = Math.min(start.left, end.left)
  const right = Math.max(start.right, end.right)
  return new DOMRect(left, start.top, Math.max(1, right - left), end.bottom - start.top)
}

function openLink() {
  const instance = editor.value
  if (!instance || !editable.value) return
  if (instance.isActive('link')) instance.chain().extendMarkRange('link').run()
  link.active = instance.isActive('link')
  link.url = (instance.getAttributes('link').href as string | undefined) ?? ''
  link.rect = selectionRect(instance)
  link.open = true
  nextTick(() => {
    updateLink()
    linkInput.value?.focus()
    linkInput.value?.select()
  })
}

function closeLink(refocus = true) {
  link.open = false
  if (refocus) editor.value?.commands.focus()
}

function normalizeUrl(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null
  if (/^(?:javascript|data|vbscript):/i.test(value)) return null
  if (/^(?:https?:|mailto:|tel:|\/|#)/i.test(value)) return value
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`
  return `https://${value}`
}

function applyLink() {
  const instance = editor.value
  if (!instance) return
  const href = normalizeUrl(link.url)
  if (!href) {
    removeLink()
    return
  }
  if (instance.state.selection.empty && !instance.isActive('link')) {
    instance.chain().focus().insertContent({ type: 'text', text: link.url.trim(), marks: [{ type: 'link', attrs: { href } }] }).run()
  } else {
    instance.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }
  closeLink(false)
}

function removeLink() {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  closeLink(false)
}

useLayer({
  active: computed(() => link.open),
  elements: () => [linkEl.value],
  onEscape: () => closeLink(),
  onPointerDownOutside: () => closeLink(false),
})

// --- Bubble menu -------------------------------------------------------------
function shouldShowBubble({ editor: instance, from, to }: { editor: Editor, from: number, to: number }) {
  if (!props.bubbleMenu || !instance.isEditable || link.open || slash.open) return false
  if (from === to || instance.isActive('codeBlock')) return false
  return instance.state.doc.textBetween(from, to).trim().length > 0
}

// --- Counts ------------------------------------------------------------------
const counts = computed(() => {
  const storage = editor.value?.storage.characterCount as { characters: () => number, words: () => number } | undefined
  return { characters: storage?.characters() ?? 0, words: storage?.words() ?? 0 }
})
const nearLimit = computed(() => !!props.limit && counts.value.characters >= props.limit * 0.9)
const atLimit = computed(() => !!props.limit && counts.value.characters >= props.limit)

function focusEditor(event: MouseEvent) {
  // Clicking the empty space under the text puts the caret at the end.
  if (event.target === event.currentTarget && editable.value) editor.value?.commands.focus('end')
}

onBeforeUnmount(() => editor.value?.destroy())

defineExpose({
  /** The underlying Tiptap editor. */
  editor,
  focus: (position?: 'start' | 'end') => editor.value?.commands.focus(position ?? null),
  clear: () => editor.value?.commands.clearContent(true),
})
</script>

<template>
  <JFieldShell
    :id="field.id.value"
    :class="$attrs.class"
    :style="$attrs.style"
    :label-id="field.labelId.value"
    :description-id="field.descriptionId.value"
    :error-id="field.errorId.value"
    :label="label"
    :description="description"
    :error-message="field.errorMessage.value"
    :show-description="field.showDescription.value"
    :required="required"
    :disabled="disabled"
    :label-for="null"
  >
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>

    <div
      ref="root"
      class="j-editor"
      :class="{ 'is-invalid': field.invalid.value, 'is-disabled': disabled, 'is-readonly': readonly }"
      :style="{ '--j-editor-min': minHeight, '--j-editor-max': maxHeight ?? 'none' }"
    >
      <!-- Toolbar -->
      <div
        v-if="toolbar"
        :ref="initRovingTabindex"
        role="toolbar"
        aria-label="Formatting"
        class="j-editor__toolbar"
        @keydown="onToolbarKeydown"
      >
        <template v-if="toolbar === 'full'">
          <JDropdownMenu :disabled="!editable">
            <template #trigger>
              <button
                type="button"
                class="j-editor__block j-focusable"
                :disabled="!editable"
                aria-label="Block type"
                data-editor-control
                @pointerdown.prevent
              >
                <component :is="currentBlock.icon" />
                <span class="j-editor__block-label">{{ currentBlock.label }}</span>
                <IconChevronDown class="j-editor__block-chevron" />
              </button>
            </template>
            <JDropdownMenuItem
              v-for="command in blockCommands.filter(c => c.convertible)"
              :key="command.id"
              :checked="command.id === currentBlock.id"
              @select="editor && command.run(editor)"
            >
              <template #leading>
                <component :is="command.icon" />
              </template>
              {{ command.label }}
            </JDropdownMenuItem>
          </JDropdownMenu>
          <span class="j-editor__divider" aria-hidden="true" />
        </template>

        <JEditorButton label="Bold" shortcut="mod+b" :active="!!editor?.isActive('bold')" :disabled="!editable" @click="run(c => c.toggleBold())">
          <IconBold />
        </JEditorButton>
        <JEditorButton label="Italic" shortcut="mod+i" :active="!!editor?.isActive('italic')" :disabled="!editable" @click="run(c => c.toggleItalic())">
          <IconItalic />
        </JEditorButton>
        <JEditorButton label="Underline" shortcut="mod+u" :active="!!editor?.isActive('underline')" :disabled="!editable" @click="run(c => c.toggleUnderline())">
          <IconUnderline />
        </JEditorButton>
        <JEditorButton v-if="toolbar === 'full'" label="Strikethrough" shortcut="mod+shift+s" :active="!!editor?.isActive('strike')" :disabled="!editable" @click="run(c => c.toggleStrike())">
          <IconStrike />
        </JEditorButton>
        <JEditorButton v-if="toolbar === 'full'" label="Inline code" shortcut="mod+e" :active="!!editor?.isActive('code')" :disabled="!editable" @click="run(c => c.toggleCode())">
          <IconCode />
        </JEditorButton>
        <JEditorButton label="Link" shortcut="mod+k" :active="!!editor?.isActive('link')" :disabled="!editable" @click="openLink">
          <IconLink />
        </JEditorButton>

        <span class="j-editor__divider" aria-hidden="true" />

        <JEditorButton
          v-for="command in blockCommands.filter(c => (toolbar === 'full' ? ['bullet', 'ordered', 'task', 'quote', 'code', 'divider'] : ['bullet', 'ordered']).includes(c.id))"
          :key="command.id"
          :label="command.label"
          :active="command.isActive ? !!(editor && command.isActive(editor)) : undefined"
          :disabled="!editable"
          @click="editor && command.run(editor)"
        >
          <component :is="command.icon" />
        </JEditorButton>

        <span class="j-editor__spacer" />

        <slot v-if="editor" name="toolbar-end" :editor="editor" />
        <JEditorButton label="Undo" shortcut="mod+z" :disabled="!editable || !can.undo" @click="run(c => c.undo())">
          <IconUndo />
        </JEditorButton>
        <JEditorButton label="Redo" shortcut="mod+shift+z" :disabled="!editable || !can.redo" @click="run(c => c.redo())">
          <IconRedo />
        </JEditorButton>
      </div>

      <!-- Writing area -->
      <div class="j-editor__content" @click="focusEditor">
        <EditorContent v-if="editor" :editor="editor" />
        <p v-else class="j-editor__prose j-editor__ssr" aria-hidden="true">
          {{ placeholder }}
        </p>
      </div>

      <!-- Footer -->
      <div v-if="showCount || limit" class="j-editor__footer" aria-live="polite">
        <span>{{ counts.words }} {{ counts.words === 1 ? 'word' : 'words' }}</span>
        <span :class="{ 'is-near': nearLimit, 'is-at': atLimit }">
          {{ counts.characters }}<template v-if="limit"> / {{ limit }}</template> characters
        </span>
      </div>
    </div>

    <!-- Selection toolbar -->
    <BubbleMenu
      v-if="editor && bubbleMenu"
      :editor="editor"
      :should-show="shouldShowBubble"
      :options="{ placement: 'top', offset: 8 }"
      class="j-editor__bubble"
    >
      <JEditorButton label="Bold" shortcut="mod+b" side="bottom" :active="editor.isActive('bold')" @click="run(c => c.toggleBold())">
        <IconBold />
      </JEditorButton>
      <JEditorButton label="Italic" shortcut="mod+i" side="bottom" :active="editor.isActive('italic')" @click="run(c => c.toggleItalic())">
        <IconItalic />
      </JEditorButton>
      <JEditorButton label="Underline" shortcut="mod+u" side="bottom" :active="editor.isActive('underline')" @click="run(c => c.toggleUnderline())">
        <IconUnderline />
      </JEditorButton>
      <JEditorButton label="Strikethrough" shortcut="mod+shift+s" side="bottom" :active="editor.isActive('strike')" @click="run(c => c.toggleStrike())">
        <IconStrike />
      </JEditorButton>
      <JEditorButton label="Inline code" shortcut="mod+e" side="bottom" :active="editor.isActive('code')" @click="run(c => c.toggleCode())">
        <IconCode />
      </JEditorButton>
      <JEditorButton label="Highlight" shortcut="mod+shift+h" side="bottom" :active="editor.isActive('highlight')" @click="run(c => c.toggleHighlight())">
        <IconHighlight />
      </JEditorButton>
      <span class="j-editor__divider" aria-hidden="true" />
      <JEditorButton label="Link" shortcut="mod+k" side="bottom" :active="editor.isActive('link')" @click="openLink">
        <IconLink />
      </JEditorButton>
    </BubbleMenu>

    <JPortal>
      <!-- Slash menu -->
      <Transition name="j-pop">
        <div
          v-if="slash.open"
          :id="slashId"
          ref="slashEl"
          role="listbox"
          aria-label="Blocks"
          class="j-editor__slash j-popover-surface"
          :style="slashStyles"
          @pointerdown.prevent
        >
          <template v-if="slash.items.length">
            <div class="j-editor__slash-label" role="presentation">
              Blocks
            </div>
            <div
              v-for="(item, i) in slash.items"
              :id="`${slashId}-${item.id}`"
              :key="item.id"
              role="option"
              class="j-editor__slash-item"
              :class="{ 'is-active': i === slash.index }"
              :aria-selected="i === slash.index"
              @pointermove="slash.index = i"
              @click="slash.select?.(item)"
            >
              <span class="j-editor__slash-icon"><component :is="item.icon" /></span>
              <span class="j-editor__slash-text">
                <span class="j-editor__slash-title">{{ item.label }}</span>
                <span class="j-editor__slash-description">{{ item.description }}</span>
              </span>
              <kbd v-if="item.markdown" class="j-editor__slash-md">{{ item.markdown }}</kbd>
            </div>
          </template>
          <div v-else class="j-editor__slash-empty">
            No blocks match “{{ slash.query }}”
          </div>
        </div>
      </Transition>

      <!-- Link editor -->
      <Transition name="j-pop">
        <form
          v-if="link.open"
          ref="linkEl"
          class="j-editor__link j-popover-surface"
          :style="linkStyles"
          @submit.prevent="applyLink"
        >
          <IconLink class="j-editor__link-icon" />
          <input
            ref="linkInput"
            v-model="link.url"
            class="j-editor__link-input"
            type="text"
            inputmode="url"
            placeholder="Paste or type a link"
            aria-label="Link address"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit" class="j-editor-button j-focusable" aria-label="Apply link">
            <IconCornerDownLeft />
          </button>
          <a
            v-if="link.active && normalizeUrl(link.url)"
            :href="normalizeUrl(link.url)!"
            target="_blank"
            rel="noopener noreferrer"
            class="j-editor-button j-focusable"
            aria-label="Open link in a new tab"
          >
            <IconExternal />
          </a>
          <button v-if="link.active" type="button" class="j-editor-button j-focusable" aria-label="Remove link" @click="removeLink">
            <IconUnlink />
          </button>
        </form>
      </Transition>
    </JPortal>
  </JFieldShell>
</template>

<style>
@layer theme, base, juxt, components, utilities;
@layer juxt {
/* Frame: the same border, focus halo and invalid states as Input. */
.j-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--juxt-border);
  border-radius: var(--juxt-radius-md);
  background: var(--juxt-surface);
  box-shadow: var(--juxt-shadow-xs);
  color: var(--juxt-fg);
  font-family: var(--juxt-font-sans);
  transition:
    border-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    box-shadow var(--juxt-duration-normal) var(--juxt-ease-out);
}

.dark .j-editor,
[data-theme='dark'] .j-editor {
  background: var(--juxt-surface-sunken);
}

.j-editor:hover:not(.is-disabled, :focus-within) {
  border-color: var(--juxt-border-strong);
}

.j-editor:has(.ProseMirror-focused) {
  border-color: var(--juxt-accent);
  box-shadow: 0 0 0 3px var(--juxt-ring-soft);
}

.j-editor.is-invalid {
  border-color: var(--juxt-danger-border);
}

.j-editor.is-invalid:has(.ProseMirror-focused) {
  border-color: var(--juxt-danger);
  box-shadow: 0 0 0 3px var(--juxt-danger-ring);
}

.j-editor.is-disabled {
  background: var(--juxt-surface-sunken);
  box-shadow: none;
  opacity: 0.7;
}

/* Toolbar: stays reachable while you scroll a long document. */
.j-editor__toolbar {
  position: sticky;
  top: var(--j-editor-sticky-top, 0);
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: var(--juxt-space-1);
  overflow-x: auto;
  border-bottom: 1px solid var(--juxt-border-subtle);
  border-radius: var(--juxt-radius-md) var(--juxt-radius-md) 0 0;
  background: inherit;
  scrollbar-width: none;
}

.j-editor__toolbar::-webkit-scrollbar {
  display: none;
}

.dark .j-editor__toolbar,
[data-theme='dark'] .j-editor__toolbar {
  border-bottom-color: var(--juxt-border);
}

.j-editor__divider {
  flex: none;
  width: 1px;
  height: 1rem;
  margin: 0 var(--juxt-space-1);
  background: var(--juxt-border);
}

.j-editor__spacer {
  flex: 1;
  min-width: var(--juxt-space-2);
}

.j-editor__block {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--juxt-space-1-5);
  height: var(--juxt-control-sm);
  padding: 0 var(--juxt-space-2);
  border: 0;
  border-radius: var(--juxt-radius-sm);
  background: transparent;
  color: var(--juxt-fg);
  font: inherit;
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
  cursor: pointer;
  transition-property: background-color, outline-color, outline-offset;
}

.j-editor__block:hover:not(:disabled) {
  background: var(--juxt-surface-hover);
}

.j-editor__block:disabled {
  color: var(--juxt-fg-disabled);
  cursor: not-allowed;
}

.j-editor__block > svg {
  width: 1rem;
  height: 1rem;
  color: var(--juxt-fg-muted);
}

.j-editor__block-label {
  min-width: 5.5rem;
  text-align: left;
}

.j-editor__block .j-editor__block-chevron {
  width: 0.75rem;
  height: 0.75rem;
}

/* Writing area */
.j-editor__content {
  flex: 1;
  min-height: var(--j-editor-min);
  max-height: var(--j-editor-max);
  padding: var(--juxt-space-3) var(--juxt-space-4);
  overflow-y: auto;
  cursor: text;
}

.j-editor.is-disabled .j-editor__content,
.j-editor.is-readonly .j-editor__content {
  cursor: default;
}

.j-editor__ssr {
  margin: 0;
  color: var(--juxt-fg-muted);
}

.j-editor__footer {
  display: flex;
  justify-content: space-between;
  gap: var(--juxt-space-3);
  padding: var(--juxt-space-1-5) var(--juxt-space-4);
  border-top: 1px solid var(--juxt-border-subtle);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  font-variant-numeric: tabular-nums;
}

.dark .j-editor__footer,
[data-theme='dark'] .j-editor__footer {
  border-top-color: var(--juxt-border);
}

.j-editor__footer .is-near {
  color: var(--juxt-warning-text);
}

.j-editor__footer .is-at {
  color: var(--juxt-danger-text);
}

/* ---------------------------------------------------------------------------
 * Document typography. Deliberately close to the docs prose: calm, readable,
 * a clear hierarchy without shouting.
 * ------------------------------------------------------------------------ */
.j-editor__prose {
  min-height: calc(var(--j-editor-min) - var(--juxt-space-6));
  color: var(--juxt-fg);
  font-size: 0.9375rem;
  line-height: 1.7;
  letter-spacing: var(--juxt-tracking-tight);
  white-space: pre-wrap;
  word-wrap: break-word;
  outline: none;
  font-variant-ligatures: none;
  font-feature-settings: 'liga' 0;
}

.j-editor__prose > * + * {
  margin-top: 0.75em;
}

.j-editor__prose p {
  margin: 0;
}

.j-editor__prose :is(h1, h2, h3) {
  margin: 1.4em 0 0;
  color: var(--juxt-fg);
  font-weight: var(--juxt-weight-semibold);
  line-height: 1.3;
  letter-spacing: var(--juxt-tracking-tighter);
}

.j-editor__prose > :is(h1, h2, h3):first-child {
  margin-top: 0;
}

.j-editor__prose h1 {
  font-size: 1.625rem;
}

.j-editor__prose h2 {
  font-size: 1.3125rem;
}

.j-editor__prose h3 {
  font-size: 1.0625rem;
}

.j-editor__prose :is(ul, ol) {
  margin-bottom: 0;
  padding-left: 1.375em;
}

.j-editor__prose li + li {
  margin-top: 0.25em;
}

.j-editor__prose li > p {
  margin: 0;
}

.j-editor__prose li::marker {
  color: var(--juxt-fg-muted);
}

.j-editor__prose ul ul {
  list-style-type: circle;
}

/* To-do items look and feel like JCheckbox. */
.j-editor__prose ul[data-type='taskList'] {
  padding-left: 0.125em;
  list-style: none;
}

.j-editor__prose ul[data-type='taskList'] li {
  display: flex;
  align-items: flex-start;
  gap: 0.625em;
}

.j-editor__prose ul[data-type='taskList'] li > label {
  display: inline-flex;
  flex: none;
  margin-top: 0.2em;
  user-select: none;
}

.j-editor__prose ul[data-type='taskList'] li > div {
  flex: 1;
  min-width: 0;
}

.j-editor__prose ul[data-type='taskList'] input[type='checkbox'] {
  display: grid;
  place-content: center;
  width: 1rem;
  height: 1rem;
  margin: 0;
  border: 1px solid var(--juxt-border-strong);
  border-radius: var(--juxt-radius-xs);
  background: var(--juxt-surface);
  cursor: pointer;
  appearance: none;
  transition:
    background-color var(--juxt-duration-fast) var(--juxt-ease-standard),
    border-color var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-editor__prose ul[data-type='taskList'] input[type='checkbox']::after {
  content: '';
  width: 0.5rem;
  height: 0.28rem;
  margin-top: -0.1rem;
  border-bottom: 2px solid var(--juxt-accent-fg);
  border-left: 2px solid var(--juxt-accent-fg);
  opacity: 0;
  transform: rotate(-45deg) scale(0.6);
  transition:
    opacity var(--juxt-duration-instant) var(--juxt-ease-standard),
    transform var(--juxt-duration-normal) var(--juxt-ease-out);
}

.j-editor__prose ul[data-type='taskList'] input[type='checkbox']:checked {
  border-color: var(--juxt-accent);
  background: var(--juxt-accent);
}

.j-editor__prose ul[data-type='taskList'] input[type='checkbox']:checked::after {
  opacity: 1;
  transform: rotate(-45deg);
}

.j-editor__prose ul[data-type='taskList'] input[type='checkbox']:focus-visible {
  outline: 2px solid var(--juxt-ring);
  outline-offset: 2px;
}

.j-editor__prose li[data-checked='true'] > div {
  color: var(--juxt-fg-muted);
  text-decoration: line-through;
  text-decoration-color: var(--juxt-border-strong);
}

.j-editor__prose blockquote {
  margin-left: 0;
  margin-right: 0;
  padding-left: 1em;
  border-left: 2px solid var(--juxt-border-strong);
  color: var(--juxt-fg-secondary);
}

.j-editor__prose a {
  color: var(--juxt-fg);
  text-decoration: underline;
  text-decoration-color: var(--juxt-border-strong);
  text-underline-offset: 3px;
  cursor: text;
  transition: text-decoration-color var(--juxt-duration-fast) var(--juxt-ease-standard);
}

.j-editor__prose a:hover {
  text-decoration-color: var(--juxt-accent);
}

.j-editor__prose code {
  padding: 0.1em 0.3em;
  border: 1px solid var(--juxt-border-subtle);
  border-radius: var(--juxt-radius-xs);
  background: var(--juxt-surface-sunken);
  font-family: var(--juxt-font-mono);
  font-size: 0.85em;
}

.dark .j-editor__prose code,
[data-theme='dark'] .j-editor__prose code {
  border-color: var(--juxt-border);
  background: var(--juxt-surface-raised);
}

.j-editor__prose pre {
  padding: 0.875em 1em;
  overflow-x: auto;
  border: 1px solid var(--juxt-border-subtle);
  border-radius: var(--juxt-radius-md);
  background: var(--juxt-surface-sunken);
  font-family: var(--juxt-font-mono);
  font-size: 0.8125rem;
  line-height: 1.65;
  white-space: pre;
}

.dark .j-editor__prose pre,
[data-theme='dark'] .j-editor__prose pre {
  border-color: var(--juxt-border);
  background: var(--juxt-bg);
}

.j-editor__prose pre code {
  padding: 0;
  border: 0;
  background: none;
  font-size: inherit;
}

.j-editor__prose hr {
  height: 1px;
  margin: 1.5em 0;
  border: 0;
  background: var(--juxt-border);
}

.j-editor__prose hr.ProseMirror-selectednode {
  outline: 2px solid var(--juxt-ring);
  outline-offset: 4px;
}

.j-editor__prose mark {
  padding: 0.05em 0.1em;
  border-radius: 2px;
  background: var(--juxt-warning-soft);
  color: inherit;
}

.j-editor__prose ::selection {
  background: var(--juxt-accent-soft);
}

/* Placeholder: on an empty document, and on each empty heading. */
.j-editor__prose .is-empty::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: var(--juxt-fg-muted);
  pointer-events: none;
}

/* The per-line hint is quieter than the document placeholder. */
.j-editor__prose .is-empty:not(.is-editor-empty):not(h1, h2, h3)::before {
  color: var(--juxt-fg-disabled);
}

.j-editor__prose .ProseMirror-gapcursor {
  display: none;
  position: relative;
  pointer-events: none;
}

.j-editor__prose.ProseMirror-focused .ProseMirror-gapcursor {
  display: block;
}

.j-editor__prose .ProseMirror-gapcursor::after {
  content: '';
  position: absolute;
  top: -2px;
  display: block;
  width: 20px;
  border-top: 1px solid var(--juxt-fg);
  animation: j-editor-cursor 1.1s steps(2, start) infinite;
}

@keyframes j-editor-cursor {
  to {
    visibility: hidden;
  }
}

/* Selection toolbar */
.j-editor__bubble {
  z-index: var(--juxt-z-popover);
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--juxt-border);
  border-radius: var(--juxt-radius-md);
  background: var(--juxt-surface-raised);
  box-shadow: var(--juxt-shadow-md);
  animation: j-editor-bubble-in var(--juxt-duration-fast) var(--juxt-ease-out);
}

@keyframes j-editor-bubble-in {
  from {
    opacity: 0;
    transform: translateY(calc(var(--juxt-motion-shift) * 0.5)) scale(var(--juxt-motion-scale));
  }
}

/* Slash menu */
.j-editor__slash {
  z-index: var(--juxt-z-popover);
  width: 17rem;
  max-height: min(20rem, var(--j-available-height, 20rem));
  padding: var(--juxt-space-1);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.j-editor__slash-label {
  padding: var(--juxt-space-1-5) var(--juxt-space-2) var(--juxt-space-1);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  font-weight: var(--juxt-weight-medium);
}

.j-editor__slash-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--juxt-space-2-5);
  padding: var(--juxt-space-1-5) var(--juxt-space-2);
  border-radius: var(--juxt-radius-sm);
  cursor: pointer;
  user-select: none;
}

.j-editor__slash-item.is-active {
  background: var(--juxt-surface-hover);
}

.j-editor__slash-item.is-active::before {
  content: '';
  position: absolute;
  top: 0.625rem;
  bottom: 0.625rem;
  left: 0;
  width: 2px;
  border-radius: 0 2px 2px 0;
  background: var(--juxt-accent);
}

.j-editor__slash-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--juxt-border);
  border-radius: var(--juxt-radius-sm);
  background: var(--juxt-surface);
  color: var(--juxt-fg-secondary);
}

.j-editor__slash-icon > svg {
  width: 1rem;
  height: 1rem;
}

.j-editor__slash-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.j-editor__slash-title {
  color: var(--juxt-fg);
  font-size: var(--juxt-text-sm);
  font-weight: var(--juxt-weight-medium);
}

.j-editor__slash-description {
  overflow: hidden;
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.j-editor__slash-md {
  color: var(--juxt-fg-muted);
  font-family: var(--juxt-font-mono);
  font-size: var(--juxt-text-2xs);
}

.j-editor__slash-empty {
  padding: var(--juxt-space-3) var(--juxt-space-2);
  color: var(--juxt-fg-muted);
  font-size: var(--juxt-text-sm);
}

/* Link editor */
.j-editor__link {
  z-index: var(--juxt-z-popover);
  display: flex;
  align-items: center;
  gap: 2px;
  width: min(22rem, calc(100vw - 16px));
  padding: 3px 3px 3px var(--juxt-space-2-5);
}

.j-editor__link-icon {
  flex: none;
  width: 0.875rem;
  height: 0.875rem;
  color: var(--juxt-fg-muted);
}

.j-editor__link-input {
  flex: 1;
  min-width: 0;
  height: var(--juxt-control-sm);
  padding: 0 var(--juxt-space-1-5);
  border: 0;
  outline: none;
  background: transparent;
  color: var(--juxt-fg);
  font: inherit;
  font-size: var(--juxt-text-sm);
}

.j-editor__link-input::placeholder {
  color: var(--juxt-fg-muted);
}

@media (prefers-reduced-motion: reduce) {
  .j-editor__bubble {
    animation: none;
  }
}
}
</style>
