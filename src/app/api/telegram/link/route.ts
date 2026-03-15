// POST /api/telegram/link
// Generates a one-time linking token for the current user
// Returns { token, bot_username, deep_link }

import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(_req: Request) {
  const userId = 'demo-user' // replace with actual auth later
  const token = randomBytes(16).toString('hex')

  // Store token in telegram_links (upsert by user_id)
  await supabase.from('telegram_links').upsert({
    user_id: userId,
    telegram_chat_id: 0, // placeholder until linked
    link_token: token,
  }, { onConflict: 'user_id', ignoreDuplicates: false })

  const botUsername = 'proceriq_bot'
  const deepLink = `https://t.me/${botUsername}?start=${token}`

  return Response.json({ token, bot_username: botUsername, deep_link: deepLink })
}

export async function GET(_req: Request) {
  // Check if current user has a linked Telegram account
  const userId = 'demo-user'
  const { data } = await supabase
    .from('telegram_links')
    .select('telegram_chat_id, telegram_username, telegram_first_name, linked_at')
    .eq('user_id', userId)
    .gt('telegram_chat_id', 0) // 0 = placeholder (not yet linked)
    .single()

  return Response.json(data || null)
}

export async function DELETE(_req: Request) {
  // Unlink Telegram
  const userId = 'demo-user'
  await supabase.from('telegram_links').delete().eq('user_id', userId)
  return Response.json({ success: true })
}
