'use client'

interface Props {
  content: string
}

// Lightweight markdown renderer — no extra deps needed
function renderMarkdown(md: string): string {
  return md
    // Remove frontmatter if present
    .replace(/^---[\s\S]*?---\n/, '')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mt-10 mb-4 leading-tight">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-3 leading-tight">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-indigo-300 mt-8 mb-2">$1</h3>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="text-gray-300">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Excerpt label (strip it — already shown in header)
    .replace(/^\*\*Excerpt:\*\*.*$/gm, '')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="text-gray-300 leading-relaxed ml-4 list-disc">$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="space-y-1 my-4 pl-4">${match}</ul>`)
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="text-gray-300 leading-relaxed ml-4 list-decimal">$1</li>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-gray-800 my-8" />')
    // Paragraphs: wrap non-empty lines not already HTML tags
    .split('\n\n')
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('<')) return trimmed
      return `<p class="text-gray-300 leading-relaxed my-4">${trimmed.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')
}

export default function BlogContent({ content }: Props) {
  const html = renderMarkdown(content)
  return (
    <div
      className="prose-custom"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
