import { fetchMemoryContext, saveMemory } from '@/lib/memory'
import { MODEL_MAP } from '@/lib/models'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  })
}

export async function POST(req: Request) {
  if (!TELEGRAM_BOT_TOKEN) return Response.json({ ok: false })

  const update = await req.json()
  const message = update?.message
  if (!message?.text || !message?.chat?.id) return Response.json({ ok: true })

  const chatId = message.chat.id
  const text = message.text
  const userId = `telegram_${chatId}` // map telegram user to proceriq user

  const memoryContext = await fetchMemoryContext(userId, text, 'work')

  const systemPrompt = `You are Proceriq, a personal AI with persistent memory accessible via Telegram.

## Your Memory
${memoryContext || 'No relevant memories yet.'}

Be concise — this is a Telegram chat. Keep responses under 300 words.`

  // Save incoming message as memory
  if (text.length > 20 && !text.startsWith('/')) {
    saveMemory(userId, text, 'work', { source: 'telegram' }).catch(console.error)
  }

  // Get response from OpenRouter (non-streaming for Telegram)
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://proceriq.com',
      'X-Title': 'Proceriq'
    },
    body: JSON.stringify({
      model: MODEL_MAP.small,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      stream: false
    })
  })

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content || 'Sorry, I had trouble responding. Please try again.'

  // Save AI response as memory too
  saveMemory(userId, reply, 'work', { source: 'telegram', role: 'assistant' }).catch(console.error)

  await sendTelegramMessage(chatId, reply)
  return Response.json({ ok: true })
}
