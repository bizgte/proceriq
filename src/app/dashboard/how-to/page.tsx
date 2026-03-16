import React from 'react'

type ChildrenProps = { children: React.ReactNode }
type SectionProps = { title: string; id: string; children: React.ReactNode }
type CodeBlockProps = { code: string }

export default function HowToPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-gray-100">
      <h1 className="text-3xl font-bold mb-2">How to Use Proceriq</h1>
      <p className="text-gray-400 mb-10">Your AI-powered second brain. Everything you need to know.</p>

      <Section title="Chat" id="chat">
        <p>The Chat page is your main interface. Type anything and Proceriq will respond using your stored memories as context.</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Auto Router model:</strong> Automatically picks the best AI model for each query.</li>
          <li><strong>Auto space:</strong> AI classifies each message as Work or Personal automatically.</li>
          <li><strong>Memory:</strong> Messages over 30 chars are auto-saved for future sessions.</li>
        </ul>
      </Section>

      <Section title="Memories" id="memories">
        <p>Browse, search, and delete stored memories. Search is semantic — it finds meaning, not just keywords.</p>
      </Section>

      <Section title="Telegram Bot" id="telegram">
        <p>Capture memories on the go without opening the app.</p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>Go to Settings and click Connect Telegram</li>
          <li>Click Generate Link and tap the deep link in Telegram</li>
          <li>Any message you send the bot is saved to your memory</li>
        </ol>
        <Callout>The bot responds using your memory as context — the full Proceriq experience in Telegram.</Callout>
      </Section>

      <Section title="Documents" id="documents">
        <p>Upload PDFs or text files and Proceriq embeds them into your memory. Chat will reference them automatically when relevant.</p>
      </Section>

      <Section title="API" id="api">
        <p>Read and write memories from your own apps, automations, or scripts.</p>
        <CodeBlock code="# Search memories&#10;curl https://proceriq.com/api/v1/memories?q=your+query \&#10;  -H 'Authorization: Bearer YOUR_API_KEY'&#10;&#10;# Save a memory&#10;curl -X POST https://proceriq.com/api/v1/memories \&#10;  -H 'Authorization: Bearer YOUR_API_KEY' \&#10;  -H 'Content-Type: application/json' \&#10;  -d '{&quot;content&quot;: &quot;My note&quot;, &quot;space&quot;: &quot;auto&quot;}'" />
        <p className="mt-2">Generate your API key in Settings.</p>
      </Section>

      <Section title="MCP — Claude Desktop / Cursor" id="mcp">
        <p>Add Proceriq as an MCP server so Claude Desktop or Cursor can query your memory automatically.</p>
        <CodeBlock code="// ~/.claude/claude_desktop_config.json&#10;{&#10;  &quot;mcpServers&quot;: {&#10;    &quot;proceriq&quot;: {&#10;      &quot;url&quot;: &quot;https://proceriq.com/api/mcp&quot;,&#10;      &quot;headers&quot;: { &quot;Authorization&quot;: &quot;Bearer YOUR_API_KEY&quot; }&#10;    }&#10;  }&#10;}" />
        <p className="mt-2">Available tools: search_memory, save_memory, list_memories</p>
        <Callout>Get your API key from Settings first.</Callout>
      </Section>

      <Section title="Settings" id="settings">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Default Model:</strong> Set preferred AI model</li>
          <li><strong>Telegram:</strong> Link or unlink your account</li>
          <li><strong>API Keys:</strong> Generate keys for REST API and MCP. Keys are shown once — copy immediately.</li>
        </ul>
      </Section>
    </div>
  )
}

function Section({ title, id, children }: SectionProps) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">{title}</h2>
      <div className="space-y-3 text-gray-300 leading-relaxed">{children}</div>
    </section>
  )
}

function Callout({ children }: ChildrenProps) {
  return (
    <div className="mt-3 flex gap-2 bg-indigo-900/30 border border-indigo-700/40 rounded-lg px-4 py-3 text-sm text-indigo-200">
      <span>💡</span><span>{children}</span>
    </div>
  )
}

function CodeBlock({ code }: CodeBlockProps) {
  return (
    <pre
      className="mt-2 bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  )
}
