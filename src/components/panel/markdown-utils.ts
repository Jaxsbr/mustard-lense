/**
 * Minimal Markdown ↔ HTML conversion helpers.
 * Handles the subset supported by the toolbar: bold, italic, strikethrough,
 * links, bullet/ordered lists, blockquote, inline code, code blocks.
 */

export function markdownToHtml(md: string): string {
  let html = md

  // Code blocks (fenced) — must be before inline code
  html = html.replace(/```([\s\S]*?)```/g, (_m, code: string) => {
    return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Blockquotes (line-based)
  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')

  // Ordered lists — collect consecutive lines
  html = html.replace(/(?:^\d+\. .+$\n?)+/gm, (block) => {
    const items = block.trim().split('\n').map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('')
    return `<ol>${items}</ol>`
  })

  // Unordered lists — collect consecutive lines
  html = html.replace(/(?:^- .+$\n?)+/gm, (block) => {
    const items = block.trim().split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('')
    return `<ul>${items}</ul>`
  })

  // Paragraphs: wrap remaining bare lines
  html = html.replace(/^(?!<[a-z])((?!<).+)$/gm, '<p>$1</p>')

  return html
}

export function htmlToMarkdown(html: string): string {
  let md = html

  // Code blocks
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (_m, code: string) => {
    return '```\n' + code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') + '\n```'
  })

  // Inline code
  md = md.replace(/<code>(.*?)<\/code>/g, '`$1`')

  // Bold
  md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**')

  // Italic
  md = md.replace(/<em>(.*?)<\/em>/g, '*$1*')

  // Strikethrough
  md = md.replace(/<s>(.*?)<\/s>/g, '~~$1~~')

  // Links
  md = md.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')

  // Blockquotes
  md = md.replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/g, '> $1')

  // Ordered lists
  md = md.replace(/<ol>([\s\S]*?)<\/ol>/g, (_m, items: string) => {
    let i = 0
    return items.replace(/<li>(.*?)<\/li>/g, (_m2: string, content: string) => {
      i++
      return `${i}. ${content}\n`
    }).trim()
  })

  // Unordered lists
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/g, (_m, items: string) => {
    return items.replace(/<li>(.*?)<\/li>/g, '- $1\n').trim()
  })

  // Paragraphs
  md = md.replace(/<p>(.*?)<\/p>/g, '$1\n')

  // Clean up HTML entities
  md = md.replace(/&lt;/g, '<')
  md = md.replace(/&gt;/g, '>')
  md = md.replace(/&amp;/g, '&')

  // Clean up extra newlines
  md = md.replace(/\n{3,}/g, '\n\n').trim()

  return md
}
