import { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { markdownToHtml, htmlToMarkdown } from './markdown-utils.js'
import './MarkdownEditor.css'

type TextMode = 'raw' | 'styled'

const STORAGE_KEY = 'mustard-text-mode'

function readStoredMode(): TextMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'raw' || stored === 'styled') return stored
  } catch {
    // localStorage unavailable
  }
  return 'raw'
}

function writeStoredMode(mode: TextMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // localStorage unavailable
  }
}

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

export function MarkdownEditor({ value, onChange, autoFocus }: MarkdownEditorProps) {
  const [mode, setMode] = useState<TextMode>(readStoredMode)

  const handleModeChange = useCallback((newMode: TextMode) => {
    setMode(newMode)
    writeStoredMode(newMode)
  }, [])

  return (
    <div className="markdown-editor" data-testid="markdown-editor">
      <div className="markdown-editor__mode-control" data-testid="markdown-editor-mode-control">
        <button
          type="button"
          className={`markdown-editor__mode-btn${mode === 'raw' ? ' markdown-editor__mode-btn--active' : ''}`}
          onClick={() => handleModeChange('raw')}
          data-testid="markdown-editor-mode-raw"
          aria-pressed={mode === 'raw'}
        >
          Raw
        </button>
        <button
          type="button"
          className={`markdown-editor__mode-btn${mode === 'styled' ? ' markdown-editor__mode-btn--active' : ''}`}
          onClick={() => handleModeChange('styled')}
          data-testid="markdown-editor-mode-styled"
          aria-pressed={mode === 'styled'}
        >
          Styled
        </button>
      </div>

      {mode === 'raw' ? (
        <textarea
          className="drawer-textarea markdown-editor__raw"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid="drawer-field-text"
          autoFocus={autoFocus}
        />
      ) : (
        <StyledEditor value={value} onChange={onChange} autoFocus={autoFocus} />
      )}
    </div>
  )
}

interface StyledEditorProps {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

function StyledEditor({ value, onChange, autoFocus }: StyledEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: { class: 'markdown-editor__code-block' },
        },
        link: {
          openOnClick: false,
          HTMLAttributes: { class: 'markdown-editor__link' },
        },
      }),
    ],
    content: markdownToHtml(value),
    autofocus: autoFocus ? 'end' : false,
    onUpdate: ({ editor: e }) => {
      const md = htmlToMarkdown(e.getHTML())
      onChange(md)
    },
    editorProps: {
      attributes: {
        class: 'markdown-editor__styled',
        'data-testid': 'drawer-field-text',
      },
    },
  })

  // Sync external value changes (e.g. when record changes)
  useEffect(() => {
    if (!editor) return
    const currentMd = htmlToMarkdown(editor.getHTML())
    if (currentMd !== value) {
      editor.commands.setContent(markdownToHtml(value))
    }
  }, [editor, value])

  // Cleanup
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  if (!editor) return null

  return (
    <>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}

interface EditorToolbarProps {
  editor: ReturnType<typeof useEditor>
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  const actions = [
    { label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { label: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    {
      label: 'Link',
      action: () => {
        if (editor.isActive('link')) {
          editor.chain().focus().unsetLink().run()
        } else {
          const url = window.prompt('URL:')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }
      },
      active: editor.isActive('link'),
    },
    { label: 'Bullet list', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { label: 'Ordered list', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    { label: 'Inline code', action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
    { label: 'Code block', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
  ]

  return (
    <div className="markdown-editor__toolbar" data-testid="markdown-editor-toolbar" role="toolbar" aria-label="Formatting toolbar">
      {actions.map(({ label, action, active }) => (
        <button
          key={label}
          type="button"
          className={`markdown-editor__toolbar-btn${active ? ' markdown-editor__toolbar-btn--active' : ''}`}
          onClick={action}
          aria-label={label}
          data-testid={`toolbar-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
