import { getAuthUserId } from '@/lib/auth'
import { fetchMemoryContext, saveMemory, classifySpace } from '@/lib/memory'
import { MODEL_MAP } from '@/lib/models'
import { getOpenRouterHeaders, OPENROUTER_BASE } from '@/lib/openrouter'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { message, space, model: modelParam, model_tier, history } = await req.json()

    const userId = await getAuthUserId()
    if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

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

    // Accept full model ID (new) or fall back to model_tier (legacy), then default
    const model = modelParam || (model_tier ? MODEL_MAP[model_tier as keyof typeof MODEL_MAP] : null) || MODEL_MAP.small

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

    // Save memory async (fire and forget, auto-classify if space='auto')
    if (message && message.length > 30) {
      const resolvedSpace = space === 'auto' || !space
        ? classifySpace(message).then(s => saveMemory(userId, message, s, { source: 'chat', role: 'user', auto_classified: true }))
        : saveMemory(userId, message, space, { source: 'chat', role: 'user' })
      Promise.resolve(resolvedSpace).catch(console.error)
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
