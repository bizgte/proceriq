export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { fetchMemoryContext, saveMemory } from '@/lib/memory'
import { MODEL_MAP } from '@/lib/models'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  if (!message?.chat?.id) return Response.json({ ok: true })

  const chatId: number = message.chat.id
  const text: string = message.text || ''
  const firstName = message.from?.first_name || ''
  const username = message.from?.username || ''

  // Handle /start <token> — account linking
  if (text.startsWith('/start')) {
    const parts = text.split(' ')
    const token = parts[1]

    if (token) {
      // Find the pending link record with this token
      const { data: linkRecord } = await supabase
        .from('telegram_links')
        .select('user_id')
        .eq('link_token', token)
        .single()

      if (linkRecord) {
        // Link the account
        await supabase.from('telegram_links').update({
          telegram_chat_id: chatId,
          telegram_username: username,
          telegram_first_name: firstName,
          link_token: null, // consume the token
          linked_at: new Date().toISOString()
        }).eq('link_token', token)

        await sendTelegramMessage(chatId, `✅ *Telegram linked to your Proceriq account!*\n\nHi ${firstName}! Your memory is now synced. Just send me a message and I'll remember it across all your devices.\n\nTry saying something about yourself to get started.`)
        return Response.json({ ok: true })
      } else {
        await sendTelegramMessage(chatId, '❌ Invalid or expired link token. Please generate a new one from your Proceriq dashboard.')
        return Response.json({ ok: true })
      }
    } else {
      // /start without token — welcome message
      await sendTelegramMessage(chatId, `👋 Welcome to *Proceriq*!\n\nI'm your personal AI with persistent memory.\n\nTo get started, link your account from your Proceriq dashboard:\n👉 https://proceriq.com/dashboard/config\n\nThen click *"Connect Telegram"* and follow the instructions.`)
      return Response.json({ ok: true })
    }
  }

  // Regular message — look up linked user
  const { data: linkRecord } = await supabase
    .from('telegram_links')
    .select('user_id')
    .eq('telegram_chat_id', chatId)
    .single()

  if (!linkRecord) {
    await sendTelegramMessage(chatId, `Please link your Telegram account first.\n\nGo to: https://proceriq.com/dashboard/config`)
    return Response.json({ ok: true })
  }

  const userId = linkRecord.user_id

  // Memory pipeline
  const memoryContext = await fetchMemoryContext(userId, text, 'work')

  const systemPrompt = `You are Proceriq, a personal AI with persistent memory.

## Your Memory
${memoryContext || 'No relevant memories yet.'}

Be concise — this is a Telegram chat. Keep responses under 300 words unless asked for detail.`

  if (text.length > 20) {
    saveMemory(userId, text, 'work', { source: 'telegram' }).catch(console.error)
  }

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

  saveMemory(userId, reply, 'work', { source: 'telegram', role: 'assistant' }).catch(console.error)

  await sendTelegramMessage(chatId, reply)
  return Response.json({ ok: true })
}
