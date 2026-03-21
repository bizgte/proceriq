export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { fetchMemoryContext, saveMemory } from '@/lib/memory'
import { MODEL_MAP } from '@/lib/models'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Multi-bot support: piperassist_bot token stored separately
const BOT_TOKENS: Record<string, string> = {
  proceriq:    process.env.TELEGRAM_BOT_TOKEN || '',
  piperassist: process.env.PIPERASSIST_BOT_TOKEN || '',
}

function getBotToken(url: string): string {
  const u = new URL(url)
  const bot = u.searchParams.get('bot')
  return (bot && BOT_TOKENS[bot]) ? BOT_TOKENS[bot] : BOT_TOKENS.proceriq
}

async function sendTelegramMessage(chatId: number, text: string, botToken: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  })
}

export async function POST(req: Request) {
  const botToken = getBotToken(req.url)
  if (!botToken) return Response.json({ ok: false })

  const update = await req.json()
  const message = update?.message
  if (!message?.chat?.id) return Response.json({ ok: true })

  const chatId: number = message.chat.id
  const text: string = message.text || ''
  const firstName = message.from?.first_name || ''
  const username = message.from?.username || ''

  // Handle /start <token>
  if (text.startsWith('/start')) {
    const token = text.split(' ')[1]

    if (token) {
      // 1. Try telegram_links table first (legacy)
      const { data: linkRecord } = await supabase
        .from('telegram_links')
        .select('user_id')
        .eq('link_token', token)
        .maybeSingle()

      if (linkRecord) {
        await supabase.from('telegram_links').update({
          telegram_chat_id: chatId,
          telegram_username: username,
          telegram_first_name: firstName,
          link_token: null,
          linked_at: new Date().toISOString()
        }).eq('link_token', token)

        await sendTelegramMessage(chatId, `*Telegram linked to your Proceriq account!*\n\nHi ${firstName}! Just send me a message and I'll remember it across all your devices.`, botToken)
        return Response.json({ ok: true })
      }

      // 2. Try user_metadata token lookup
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const matchedUser = users?.find((u: any) => u.user_metadata?.telegram_link_token === token)

      if (matchedUser) {
        // Clear token and insert telegram_links record
        await supabase.auth.admin.updateUserById(matchedUser.id, {
          user_metadata: { ...matchedUser.user_metadata, telegram_link_token: null }
        })

        await supabase.from('telegram_links').upsert({
          user_id: matchedUser.id,
          telegram_chat_id: chatId,
          telegram_username: username,
          telegram_first_name: firstName,
          link_token: null,
          linked_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

        await sendTelegramMessage(chatId, `*Telegram linked to your Proceriq account!*\n\nHi ${firstName}! Just send me a message and I'll remember it.`, botToken)
        return Response.json({ ok: true })
      }

      await sendTelegramMessage(chatId, 'Invalid or expired link token. Please generate a new one from your Proceriq dashboard.', botToken)
      return Response.json({ ok: true })
    }

    await sendTelegramMessage(chatId, `*Welcome to Proceriq!*\n\nI'm your personal AI with persistent memory.\n\nTo get started, link your account from your dashboard:\nhttps://proceriq.vercel.app/dashboard/config`, botToken)
    return Response.json({ ok: true })
  }

  // Regular message — look up linked user
  const { data: linkRecord } = await supabase
    .from('telegram_links')
    .select('user_id')
    .eq('telegram_chat_id', chatId)
    .maybeSingle()

  if (!linkRecord) {
    await sendTelegramMessage(chatId, `Please link your Telegram account first.\n\nGo to: https://proceriq.vercel.app/dashboard/config`, botToken)
    return Response.json({ ok: true })
  }

  const userId = linkRecord.user_id
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
  await sendTelegramMessage(chatId, reply, botToken)
  return Response.json({ ok: true })
}
