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
    { label: 'Bold', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { label: 'Italic', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { label: 'Strikethrough', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H8"/><line x1="4" y1="12" x2="20" y2="12"/></svg>, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    {
      label: 'Link',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
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
    { label: 'Bullet list', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { label: 'Ordered list', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="2" y="8" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text><text x="2" y="14" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text><text x="2" y="20" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text></svg>, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { label: 'Blockquote', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    { label: 'Inline code', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
    { label: 'Code block', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="4" y1="21" x2="20" y2="21"/></svg>, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
  ]

  return (
    <div className="markdown-editor__toolbar" data-testid="markdown-editor-toolbar" role="toolbar" aria-label="Formatting toolbar">
      {actions.map(({ label, icon, action, active }) => (
        <button
          key={label}
          type="button"
          className={`markdown-editor__toolbar-btn${active ? ' markdown-editor__toolbar-btn--active' : ''}`}
          onClick={action}
          aria-label={label}
          title={label}
          data-testid={`toolbar-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
