import { embed } from '@/lib/embeddings'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
    if (i + chunkSize >= words.length) break
  }
  return chunks
}

export async function POST(req: Request) {
  const userId = 'demo-user'
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return Response.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['txt', 'md'].includes(ext || '')) {
    return Response.json(
      { error: 'Only .txt and .md files supported in v1. PDF support coming soon.' },
      { status: 400 }
    )
  }

  const text = await file.text()
  const chunks = chunkText(text)

  // Create document record
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      name: file.name,
      type: ext,
      size_bytes: file.size,
      chunk_count: chunks.length
    })
    .select()
    .single()

  if (docError || !doc) {
    return Response.json({ error: 'Failed to create document record' }, { status: 500 })
  }

  // Embed and store each chunk
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embed(chunks[i])
    await supabase.from('thoughts').insert({
      user_id: userId,
      content: chunks[i],
      space: 'work',
      embedding,
      metadata: {
        source: 'document',
        document_id: doc.id,
        document_name: file.name,
        chunk_index: i
      }
    })
  }

  return Response.json({ id: doc.id, name: file.name, chunk_count: chunks.length })
}

export async function GET(_req: Request) {
  const userId = 'demo-user'
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return Response.json(data || [])
}

export async function DELETE(req: Request) {
  const userId = 'demo-user'
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'No id' }, { status: 400 })

  // Delete chunks from thoughts (filter by metadata document_id)
  await supabase
    .from('thoughts')
    .delete()
    .eq('user_id', userId)
    .contains('metadata', { document_id: id })

  // Delete document record
  await supabase.from('documents').delete().eq('id', id).eq('user_id', userId)
  return Response.json({ success: true })
}
