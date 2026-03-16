import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function hashKey(key: string) {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id, label, key_prefix, created_at, last_used_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return Response.json({ keys: data || [] })
}

export async function POST(req: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { label } = await req.json().catch(() => ({}))

  const rawKey = 'pq-' + crypto.randomBytes(24).toString('hex')
  const keyHash = hashKey(rawKey)
  const keyPrefix = rawKey.slice(0, 10) + '...'

  await supabaseAdmin.from('api_keys').insert({
    user_id: user.id,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    label: label || 'API Key'
  })

  return Response.json({ key: rawKey, prefix: keyPrefix })
}

export async function DELETE(req: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await supabaseAdmin.from('api_keys').delete().eq('id', id).eq('user_id', user.id)
  return Response.json({ success: true })
}
