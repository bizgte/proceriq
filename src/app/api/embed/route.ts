import { embed } from '@/lib/embeddings'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return new Response(JSON.stringify({ error: 'text is required' }), { status: 400 })
    }

    const embedding = await embed(text)
    return new Response(JSON.stringify({ embedding }), { status: 200 })
  } catch (error) {
    console.error('Embed error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate embedding' }), { status: 500 })
  }
}
