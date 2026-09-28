import type { Editor, Range } from '@tiptap/core'
import type { Component } from 'vue'
import {
  IconBulletList,
  IconCodeBlock,
  IconDivider,
  IconHeading1,
  IconHeading2,
  IconHeading3,
  IconOrderedList,
  IconQuote,
  IconTaskList,
  IconText,
} from './icons'

/** A block the user can turn the current line into, from the toolbar or the slash menu. */
export interface BlockCommand {
  id: string
  label: string
  description: string
  icon: Component
  /** The Markdown shortcut that does the same thing, shown as a hint. */
  markdown?: string
  keywords: string[]
  /** Whether the selection is currently this kind of block. */
  isActive?: (editor: Editor) => boolean
  /** Only offered as a "turn into" target, not as an insertable block. */
  convertible: boolean
  run: (editor: Editor, range?: Range) => void
}

// Start from the slash-command range when there is one, so the `/query` text is removed.
const chain = (editor: Editor, range?: Range) => (range ? editor.chain().focus().deleteRange(range) : editor.chain().focus())

export const blockCommands: BlockCommand[] = [
  {
    id: 'text',
    label: 'Text',
    description: 'Plain paragraph',
    icon: IconText,
    keywords: ['paragraph', 'p', 'body'],
    convertible: true,
    isActive: editor => editor.isActive('paragraph') && !editor.isActive('bulletList') && !editor.isActive('orderedList') && !editor.isActive('taskList') && !editor.isActive('blockquote'),
    run: (editor, range) => chain(editor, range).setParagraph().run(),
  },
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Large section title',
    icon: IconHeading1,
    markdown: '#',
    keywords: ['title', 'h1', 'big'],
    convertible: true,
    isActive: editor => editor.isActive('heading', { level: 1 }),
    run: (editor, range) => chain(editor, range).setHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium section title',
    icon: IconHeading2,
    markdown: '##',
    keywords: ['subtitle', 'h2'],
    convertible: true,
    isActive: editor => editor.isActive('heading', { level: 2 }),
    run: (editor, range) => chain(editor, range).setHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Small section title',
    icon: IconHeading3,
    markdown: '###',
    keywords: ['h3'],
    convertible: true,
    isActive: editor => editor.isActive('heading', { level: 3 }),
    run: (editor, range) => chain(editor, range).setHeading({ level: 3 }).run(),
  },
  {
    id: 'bullet',
    label: 'Bulleted list',
    description: 'A simple list',
    icon: IconBulletList,
    markdown: '-',
    keywords: ['ul', 'unordered', 'bullets'],
    convertible: true,
    isActive: editor => editor.isActive('bulletList'),
    run: (editor, range) => chain(editor, range).toggleBulletList().run(),
  },
  {
    id: 'ordered',
    label: 'Numbered list',
    description: 'A list with numbers',
    icon: IconOrderedList,
    markdown: '1.',
    keywords: ['ol', 'ordered', 'numbers'],
    convertible: true,
    isActive: editor => editor.isActive('orderedList'),
    run: (editor, range) => chain(editor, range).toggleOrderedList().run(),
  },
  {
    id: 'task',
    label: 'To-do list',
    description: 'Checkboxes you can tick off',
    icon: IconTaskList,
    markdown: '[ ]',
    keywords: ['todo', 'task', 'checkbox', 'checklist'],
    convertible: true,
    isActive: editor => editor.isActive('taskList'),
    run: (editor, range) => chain(editor, range).toggleTaskList().run(),
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Set a passage apart',
    icon: IconQuote,
    markdown: '>',
    keywords: ['blockquote', 'citation'],
    convertible: true,
    isActive: editor => editor.isActive('blockquote'),
    run: (editor, range) => chain(editor, range).toggleBlockquote().run(),
  },
  {
    id: 'code',
    label: 'Code block',
    description: 'Monospaced, whitespace kept',
    icon: IconCodeBlock,
    markdown: '```',
    keywords: ['pre', 'snippet', 'code'],
    convertible: true,
    isActive: editor => editor.isActive('codeBlock'),
    run: (editor, range) => chain(editor, range).toggleCodeBlock().run(),
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'A line between sections',
    icon: IconDivider,
    markdown: '---',
    keywords: ['hr', 'rule', 'separator', 'line'],
    convertible: false,
    run: (editor, range) => chain(editor, range).setHorizontalRule().run(),
  },
]
