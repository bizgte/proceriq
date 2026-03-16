import { searchMemories } from '@/lib/memory'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const { query, space } = await req.json()
    if (!query) return new Response(JSON.stringify({ error: 'query is required' }), { status: 400 })

    const results = await searchMemories(userId, query, space || 'both')
    return new Response(JSON.stringify({ results }), { status: 200 })
  } catch (error) {
    console.error('Search memory error:', error)
    return new Response(JSON.stringify({ error: 'Failed to search memories' }), { status: 500 })
  }
}
