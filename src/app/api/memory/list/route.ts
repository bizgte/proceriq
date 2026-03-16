import { listMemories, deleteMemory } from '@/lib/memory'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const { searchParams } = new URL(req.url)
    const space = searchParams.get('space') || 'all'

    const memories = await listMemories(userId, space)
    return new Response(JSON.stringify({ memories }), { status: 200 })
  } catch (error) {
    console.error('List memories error:', error)
    return new Response(JSON.stringify({ error: 'Failed to list memories' }), { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const { id } = await req.json()
    if (!id) return new Response(JSON.stringify({ error: 'id is required' }), { status: 400 })

    await deleteMemory(id, userId)
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Delete memory error:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete memory' }), { status: 500 })
  }
}
