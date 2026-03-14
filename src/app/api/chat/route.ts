import { fetchMemoryContext, saveMemory } from '@/lib/memory'
import { MODEL_MAP } from '@/lib/models'
import { getOpenRouterHeaders, OPENROUTER_BASE } from '@/lib/openrouter'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { message, space, model_tier, history } = await req.json()

    const userId = 'demo-user'

    const memoryContext = await fetchMemoryContext(userId, message, space || 'work')
    const memoryCount = memoryContext ? memoryContext.split('\n').filter(Boolean).length : 0

    const systemPrompt = `You are Proceriq, a personal AI with persistent memory.

## Your Memory (${space || 'work'} space)
${memoryContext || 'No relevant memories yet. Start chatting to build your second brain.'}

## Instructions
- Reference relevant memories naturally when they apply
- Be concise and helpful
- Current space: ${space || 'work'}`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ]

    const modelTier = (model_tier as keyof typeof MODEL_MAP) || 'small'
    const model = MODEL_MAP[modelTier] || MODEL_MAP.small

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: getOpenRouterHeaders(),
      body: JSON.stringify({
        model,
        messages,
        stream: true
      })
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), { status: response.status })
    }

    // Save memory async (fire and forget)
    if (message && message.length > 30) {
      saveMemory(userId, message, space || 'work', { source: 'chat', role: 'user' }).catch(console.error)
    }

    // Return memory count header so client knows how many memories were used
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Memory-Count': String(memoryCount)
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
