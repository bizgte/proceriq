import { embed } from './embeddings'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function fetchMemoryContext(userId: string, query: string, space: string): Promise<string> {
  try {
    const embedding = await embed(query)
    const { data } = await supabase.rpc('match_thoughts', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5,
      p_user_id: userId,
      p_space: space
    })
    if (!data?.length) return ''
    return data.map((m: { content: string }) => `- ${m.content}`).join('\n')
  } catch {
    return ''
  }
}

export async function saveMemory(
  userId: string,
  content: string,
  space: string,
  metadata: object = {}
): Promise<void> {
  const embedding = await embed(content)
  await supabase.from('thoughts').insert({ user_id: userId, content, space, embedding, metadata })
}

export async function listMemories(userId: string, space: string = 'all') {
  let query = supabase
    .from('thoughts')
    .select('id, content, space, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (space !== 'all') {
    query = query.eq('space', space)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function deleteMemory(id: string, userId: string): Promise<void> {
  await supabase.from('thoughts').delete().eq('id', id).eq('user_id', userId)
}

export async function searchMemories(userId: string, queryText: string, space: string = 'both') {
  try {
    const embedding = await embed(queryText)
    const { data } = await supabase.rpc('match_thoughts', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 10,
      p_user_id: userId,
      p_space: space
    })
    return data || []
  } catch {
    return []
  }
}

// Auto-classify content into work or personal space
export async function classifySpace(content: string): Promise<'work' | 'personal'> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://proceriq.vercel.app',
        'X-Title': 'Proceriq'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Classify this text as either "work" or "personal". Respond with only one word.' },
          { role: 'user', content: content.slice(0, 500) }
        ],
        max_tokens: 5
      })
    })
    const data = await res.json()
    const result = data.choices?.[0]?.message?.content?.toLowerCase().trim()
    return result === 'personal' ? 'personal' : 'work'
  } catch {
    return 'work'
  }
}
