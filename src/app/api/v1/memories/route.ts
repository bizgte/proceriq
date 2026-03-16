import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { saveMemory, searchMemories, listMemories, classifySpace } from '@/lib/memory'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function validateApiKey(req: Request): Promise<string | null> {
  const auth = req.headers.get('Authorization') || req.headers.get('x-api-key') || ''
  const key = auth.replace(/^Bearer\s+/i, '').trim()
  if (!key.startsWith('pq-')) return null

  const keyHash = crypto.createHash('sha256').update(key).digest('hex')
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('user_id, id')
    .eq('key_hash', keyHash)
    .single()

  if (!data) return null

  // Update last_used_at async
  supabaseAdmin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id).then(() => {})

  return data.user_id
}

// GET /api/v1/memories?q=query&space=work&limit=10
export async function GET(req: Request) {
  const userId = await validateApiKey(req)
  if (!userId) return Response.json({ error: 'Unauthorized. Provide your API key via Authorization: Bearer pq-xxx header.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const space = searchParams.get('space') || 'both'
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

  if (query) {
    const results = await searchMemories(userId, query, space)
    return Response.json({ results: results.slice(0, limit) })
  } else {
    const memories = await listMemories(userId, space)
    return Response.json({ memories: memories.slice(0, limit) })
  }
}

// POST /api/v1/memories — save a memory
export async function POST(req: Request) {
  const userId = await validateApiKey(req)
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, space } = await req.json()
  if (!content) return Response.json({ error: 'content is required' }, { status: 400 })

  const resolvedSpace = space === 'auto' || !space ? await classifySpace(content) : space
  await saveMemory(userId, content, resolvedSpace, { source: 'api' })

  return Response.json({ success: true, space: resolvedSpace })
}
