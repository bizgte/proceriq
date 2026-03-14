import { saveMemory } from '@/lib/memory'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { content, space, metadata } = await req.json()
    const userId = 'demo-user'

    if (!content || !space) {
      return new Response(JSON.stringify({ error: 'content and space are required' }), { status: 400 })
    }

    await saveMemory(userId, content, space, metadata || {})
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Save memory error:', error)
    return new Response(JSON.stringify({ error: 'Failed to save memory' }), { status: 500 })
  }
}
