export const dynamic = 'force-dynamic'

export async function POST(_req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    return Response.json({ error: 'TELEGRAM_BOT_TOKEN not set in environment' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proceriq.vercel.app'
  const webhookUrl = `${appUrl}/api/telegram/webhook`

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl })
  })
  const data = await res.json()
  return Response.json(data)
}
