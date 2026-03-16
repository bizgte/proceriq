import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { searchMemories, saveMemory, listMemories, classifySpace } from '@/lib/memory'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function validateApiKey(req: Request): Promise<string | null> {
  const auth = req.headers.get('Authorization') || req.headers.get('x-api-key') || ''
  const key = auth.replace(/^Bearer /i, '').trim()
  if (!key.startsWith('pq-')) return null
  const keyHash = crypto.createHash('sha256').update(key).digest('hex')
  const { data } = await supabaseAdmin.from('api_keys').select('user_id').eq('key_hash', keyHash).single()
  return data?.user_id ?? null
}

const MCP_TOOLS = [
  {
    name: 'search_memory',
    description: 'Search your Proceriq memories semantically.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to search for' },
        space: { type: 'string', enum: ['work', 'personal', 'both'], default: 'both' },
        limit: { type: 'number', default: 5 }
      },
      required: ['query']
    }
  },
  {
    name: 'save_memory',
    description: 'Save a new memory to Proceriq.',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'The memory to save' },
        space: { type: 'string', enum: ['work', 'personal', 'auto'], default: 'auto' }
      },
      required: ['content']
    }
  },
  {
    name: 'list_memories',
    description: 'List your most recent memories.',
    inputSchema: {
      type: 'object',
      properties: {
        space: { type: 'string', enum: ['work', 'personal', 'all'], default: 'all' },
        limit: { type: 'number', default: 10 }
      }
    }
  }
]

export async function POST(req: Request) {
  const userId = await validateApiKey(req)
  if (!userId) {
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized. Provide your Proceriq API key.' }, id: null },
      { status: 401 }
    )
  }

  const body = await req.json()
  const { method, params, id } = body

  try {
    if (method === 'initialize') {
      return Response.json({
        jsonrpc: '2.0', id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'proceriq', version: '1.0.0' }
        }
      })
    }

    if (method === 'tools/list') {
      return Response.json({ jsonrpc: '2.0', id, result: { tools: MCP_TOOLS } })
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params
      let result = ''

      if (name === 'search_memory') {
        const memories = await searchMemories(userId, args.query, args.space || 'both')
        const limited = memories.slice(0, Math.min(args.limit || 5, 20))
        result = limited.length > 0
          ? limited.map((m: { space: string; content: string }) => '[' + m.space + '] ' + m.content).join('\n\n')
          : 'No relevant memories found.'
      }

      if (name === 'save_memory') {
        const space = args.space === 'auto' || !args.space ? await classifySpace(args.content) : args.space
        await saveMemory(userId, args.content, space, { source: 'mcp' })
        result = 'Memory saved to ' + space + ' space.'
      }

      if (name === 'list_memories') {
        const memories = await listMemories(userId, args.space || 'all')
        const limited = memories.slice(0, Math.min(args.limit || 10, 50))
        result = limited.length > 0
          ? limited.map((m: { space: string; content: string }) => '[' + m.space + '] ' + m.content).join('\n\n')
          : 'No memories found.'
      }

      return Response.json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: result }] } })
    }

    return Response.json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } }, { status: 404 })
  } catch (err) {
    return Response.json({ jsonrpc: '2.0', id, error: { code: -32603, message: String(err) } }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({
    name: 'Proceriq MCP Server',
    version: '1.0.0',
    protocol: 'MCP 2024-11-05',
    tools: MCP_TOOLS.map(t => t.name),
    setup: {
      url: 'https://proceriq.com/api/mcp',
      auth: 'Authorization: Bearer YOUR_API_KEY'
    }
  })
}
