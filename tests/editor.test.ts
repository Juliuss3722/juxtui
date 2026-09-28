import type { Editor } from '@tiptap/core'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { blockCommands } from '../src/editor/commands'
import JEditor from '../src/editor/JEditor.vue'
import { filterCommands } from '../src/editor/slash'
import { settle, waitFor } from './utils'

async function setup(props: Record<string, unknown> = {}) {
  let instance: Editor | undefined
  const wrapper = mount(JEditor, {
    attachTo: document.body,
    props: {
      'label': 'Notes',
      'modelValue': '<p>Hello world</p>',
      'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value as string }),
      'onReady': (editor: Editor) => (instance = editor),
      ...props,
    },
  })
  await waitFor(() => instance)
  await settle()
  return { wrapper, editor: instance! }
}

describe('slash commands', () => {
  it('lists every block for an empty query', () => {
    expect(filterCommands('')).toHaveLength(blockCommands.length)
  })

  it('ranks by label and keywords', () => {
    expect(filterCommands('head')[0]!.id).toBe('h1')
    expect(filterCommands('todo')[0]!.id).toBe('task')
    expect(filterCommands('hr')[0]!.id).toBe('divider')
    expect(filterCommands('zzz')).toHaveLength(0)
  })
})

describe('JEditor', () => {
  it('renders the initial content inside a labelled, multiline textbox', async () => {
    const { wrapper } = await setup()
    const prose = wrapper.get('.ProseMirror')
    expect(prose.text()).toBe('Hello world')
    expect(prose.attributes('role')).toBe('textbox')
    expect(prose.attributes('aria-multiline')).toBe('true')
    expect(wrapper.get(`#${prose.attributes('aria-labelledby')}`).text()).toContain('Notes')
    expect(wrapper.get('[role="toolbar"]').attributes('aria-label')).toBe('Formatting')
  })

  it('emits HTML through v-model', async () => {
    const { wrapper, editor } = await setup()
    editor.commands.setContent('<p>Changed</p>', { emitUpdate: true })
    await settle()
    expect(wrapper.props('modelValue')).toBe('<p>Changed</p>')
  })

  it('emits an empty string for an empty document', async () => {
    const { wrapper, editor } = await setup()
    editor.commands.clearContent(true)
    await settle()
    expect(wrapper.props('modelValue')).toBe('')
  })

  it('emits JSON when format="json"', async () => {
    const { wrapper, editor } = await setup({ format: 'json', modelValue: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }] } })
    expect(wrapper.get('.ProseMirror').text()).toBe('Hi')
    editor.commands.insertContent(' there')
    await settle()
    expect(wrapper.props('modelValue')).toMatchObject({ type: 'doc' })
  })

  it('applies outside v-model changes without echoing', async () => {
    const { wrapper } = await setup()
    await wrapper.setProps({ modelValue: '<h2>From outside</h2>' })
    await settle()
    expect(wrapper.get('.ProseMirror h2').text()).toBe('From outside')
  })

  it('reflects marks in the toolbar with aria-pressed', async () => {
    const { wrapper, editor } = await setup()
    const bold = () => wrapper.get('[role="toolbar"] button[aria-label="Bold"]')
    expect(bold().attributes('aria-pressed')).toBe('false')
    editor.chain().selectAll().toggleBold().run()
    await settle()
    expect(bold().attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('.ProseMirror strong').exists()).toBe(true)
  })

  it('turns a line into a heading from the block menu command', async () => {
    const { wrapper, editor } = await setup()
    blockCommands.find(c => c.id === 'h2')!.run(editor)
    await settle()
    expect(wrapper.find('.ProseMirror h2').exists()).toBe(true)
    expect(wrapper.get('.j-editor__block-label').text()).toBe('Heading 2')
  })

  it('shows word and character counts, and enforces a limit', async () => {
    const { wrapper, editor } = await setup({ limit: 20 })
    expect(wrapper.get('.j-editor__footer').text()).toContain('2 words')
    expect(wrapper.get('.j-editor__footer').text()).toContain('11 / 20')
    editor.commands.insertContent(' and a lot more text than allowed')
    await settle()
    expect(editor.storage.characterCount.characters()).toBeLessThanOrEqual(20)
  })

  it('is read-only when disabled', async () => {
    const { wrapper, editor } = await setup({ disabled: true })
    expect(editor.isEditable).toBe(false)
    expect(wrapper.get('.ProseMirror').attributes('contenteditable')).toBe('false')
    expect(wrapper.get('[role="toolbar"] button[aria-label="Bold"]').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ disabled: false })
    await settle()
    expect(editor.isEditable).toBe(true)
  })

  it('marks errors on the editable element', async () => {
    const { wrapper } = await setup({ error: 'Too short' })
    const prose = wrapper.get('.ProseMirror')
    expect(prose.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get(`#${prose.attributes('aria-describedby')}`).text()).toBe('Too short')
  })

  it('offers a minimal toolbar and can hide it', async () => {
    const minimal = await setup({ toolbar: 'minimal' })
    expect(minimal.wrapper.find('.j-editor__block').exists()).toBe(false)
    expect(minimal.wrapper.find('button[aria-label="Bold"]').exists()).toBe(true)
    const none = await setup({ toolbar: false })
    expect(none.wrapper.find('[role="toolbar"]').exists()).toBe(false)
  })
})
