// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MarkdownEditor } from './MarkdownEditor.js'
import { markdownToHtml, htmlToMarkdown } from './markdown-utils.js'

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe('MarkdownEditor mode toggle', () => {
  it('renders mode control with Raw and Styled buttons', () => {
    render(<MarkdownEditor value="" onChange={() => {}} />)
    expect(screen.getByTestId('markdown-editor-mode-control')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-editor-mode-raw')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-editor-mode-styled')).toBeInTheDocument()
  })

  it('defaults to raw mode when localStorage is empty', () => {
    render(<MarkdownEditor value="hello" onChange={() => {}} />)
    const rawBtn = screen.getByTestId('markdown-editor-mode-raw')
    expect(rawBtn).toHaveAttribute('aria-pressed', 'true')
    // textarea should be present in raw mode
    expect(screen.getByTestId('drawer-field-text').tagName).toBe('TEXTAREA')
  })

  it('reads stored mode from localStorage', () => {
    localStorage.setItem('mustard-text-mode', 'styled')
    render(<MarkdownEditor value="hello" onChange={() => {}} />)
    const styledBtn = screen.getByTestId('markdown-editor-mode-styled')
    expect(styledBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches between raw and styled mode', () => {
    render(<MarkdownEditor value="hello" onChange={() => {}} />)
    // Start in raw
    expect(screen.getByTestId('drawer-field-text').tagName).toBe('TEXTAREA')

    // Switch to styled
    fireEvent.click(screen.getByTestId('markdown-editor-mode-styled'))
    expect(screen.getByTestId('markdown-editor-mode-styled')).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('mustard-text-mode')).toBe('styled')

    // Switch back to raw
    fireEvent.click(screen.getByTestId('markdown-editor-mode-raw'))
    expect(screen.getByTestId('markdown-editor-mode-raw')).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('mustard-text-mode')).toBe('raw')
  })

  it('preserves text when switching modes', () => {
    const onChange = vi.fn()
    const { rerender } = render(<MarkdownEditor value="test text" onChange={onChange} />)

    // Switch to styled, then back to raw
    fireEvent.click(screen.getByTestId('markdown-editor-mode-styled'))
    rerender(<MarkdownEditor value="test text" onChange={onChange} />)
    fireEvent.click(screen.getByTestId('markdown-editor-mode-raw'))
    rerender(<MarkdownEditor value="test text" onChange={onChange} />)

    // Text should still be there in raw textarea
    const textarea = screen.getByTestId('drawer-field-text') as HTMLTextAreaElement
    expect(textarea.value).toBe('test text')
  })

  it('writes localStorage on mode change', () => {
    render(<MarkdownEditor value="" onChange={() => {}} />)
    fireEvent.click(screen.getByTestId('markdown-editor-mode-styled'))
    expect(localStorage.getItem('mustard-text-mode')).toBe('styled')
    fireEvent.click(screen.getByTestId('markdown-editor-mode-raw'))
    expect(localStorage.getItem('mustard-text-mode')).toBe('raw')
  })
})

describe('EditorToolbar', () => {
  it('shows toolbar with 9 accessible controls in styled mode', () => {
    localStorage.setItem('mustard-text-mode', 'styled')
    render(<MarkdownEditor value="" onChange={() => {}} />)
    const toolbar = screen.getByTestId('markdown-editor-toolbar')
    expect(toolbar).toBeInTheDocument()

    const expectedLabels = [
      'Bold', 'Italic', 'Strikethrough', 'Link',
      'Bullet list', 'Ordered list', 'Blockquote',
      'Inline code', 'Code block',
    ]
    for (const label of expectedLabels) {
      const btn = screen.getByRole('button', { name: label })
      expect(btn).toBeInTheDocument()
      expect(btn.getAttribute('aria-label') || btn.getAttribute('title')).toBeTruthy()
    }
    // Exactly 9 toolbar buttons
    const toolbarButtons = toolbar.querySelectorAll('button')
    expect(toolbarButtons).toHaveLength(9)
  })

  it('hides toolbar in raw mode', () => {
    localStorage.setItem('mustard-text-mode', 'raw')
    render(<MarkdownEditor value="" onChange={() => {}} />)
    expect(screen.queryByTestId('markdown-editor-toolbar')).not.toBeInTheDocument()
  })

  it('does not contain an underline toolbar button', () => {
    localStorage.setItem('mustard-text-mode', 'styled')
    render(<MarkdownEditor value="" onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: /underline/i })).not.toBeInTheDocument()
  })
})

describe('markdown-utils round-trip', () => {
  it('converts bold markdown to HTML and back', () => {
    const md = '**bold text**'
    const html = markdownToHtml(md)
    expect(html).toContain('<strong>bold text</strong>')
    const back = htmlToMarkdown(html)
    expect(back).toContain('**bold text**')
  })

  it('converts bullet list markdown to HTML and back', () => {
    const md = '- item one\n- item two'
    const html = markdownToHtml(md)
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>item one</li>')
    const back = htmlToMarkdown(html)
    expect(back).toContain('- item one')
    expect(back).toContain('- item two')
  })

  it('converts inline code markdown to HTML and back', () => {
    const md = 'use `const x = 1` here'
    const html = markdownToHtml(md)
    expect(html).toContain('<code>const x = 1</code>')
    const back = htmlToMarkdown(html)
    expect(back).toContain('`const x = 1`')
  })

  it('converts strikethrough markdown to HTML and back', () => {
    const md = '~~deleted~~'
    const html = markdownToHtml(md)
    expect(html).toContain('<s>deleted</s>')
    const back = htmlToMarkdown(html)
    expect(back).toContain('~~deleted~~')
  })
})
