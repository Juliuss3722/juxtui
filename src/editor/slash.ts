import type { Editor, Range } from '@tiptap/core'
import type { BlockCommand } from './commands'
import { Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import { matchText } from '../components/command-palette/search'
import { blockCommands } from './commands'

/** Reactive state the editor component renders the slash menu from. */
export interface SlashState {
  open: boolean
  query: string
  items: BlockCommand[]
  index: number
  rect: DOMRect | null
  select: ((item: BlockCommand) => void) | null
}

export function filterCommands(query: string): BlockCommand[] {
  const q = query.trim()
  if (!q) return blockCommands
  return blockCommands
    .map((command) => {
      const score = Math.max(
        matchText(q, command.label).score,
        ...command.keywords.map(keyword => matchText(q, keyword).score * 0.9),
      )
      return { command, score }
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.command)
}

export const slashPluginKey = new PluginKey('juxtSlash')

/**
 * Typing `/` opens a menu of blocks at the caret. The menu itself is rendered
 * by JEditor from `state`; this extension only feeds it and handles keys.
 */
export function createSlashCommands(state: SlashState) {
  return Extension.create({
    name: 'juxtSlashCommands',
    addProseMirrorPlugins() {
      return [
        Suggestion<BlockCommand>({
          editor: this.editor,
          pluginKey: slashPluginKey,
          char: '/',
          // Only in plain paragraphs: not in code, headings or mid-word.
          allow: ({ state: editorState, range }) => {
            const $from = editorState.doc.resolve(range.from)
            return $from.parent.type.name === 'paragraph' && !$from.parent.type.spec.code
          },
          items: ({ query }) => filterCommands(query),
          command: ({ editor, range, props }: { editor: Editor, range: Range, props: BlockCommand }) => props.run(editor, range),
          render: () => {
            let select: ((item: BlockCommand) => void) | null = null
            return {
              onStart: (props) => {
                select = item => props.command(item)
                Object.assign(state, {
                  open: true,
                  query: props.query,
                  items: props.items,
                  index: 0,
                  rect: props.clientRect?.() ?? null,
                  select,
                })
              },
              onUpdate: (props) => {
                select = item => props.command(item)
                // A new query puts the best match back under the cursor.
                const index = props.query !== state.query ? 0 : Math.min(state.index, Math.max(0, props.items.length - 1))
                Object.assign(state, {
                  query: props.query,
                  items: props.items,
                  index,
                  rect: props.clientRect?.() ?? null,
                  select,
                })
              },
              onKeyDown: ({ event }) => {
                if (!state.open) return false
                const count = state.items.length
                if (event.key === 'ArrowDown') {
                  if (count) state.index = (state.index + 1) % count
                  return true
                }
                if (event.key === 'ArrowUp') {
                  if (count) state.index = (state.index - 1 + count) % count
                  return true
                }
                if (event.key === 'Enter' || event.key === 'Tab') {
                  const item = state.items[state.index]
                  if (!item) return false
                  select?.(item)
                  return true
                }
                if (event.key === 'Escape') {
                  state.open = false
                  return true
                }
                return false
              },
              onExit: () => {
                Object.assign(state, { open: false, items: [], query: '', rect: null, select: null })
              },
            }
          },
        }),
      ]
    },
  })
}
