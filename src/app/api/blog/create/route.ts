import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BLOG_KEY = 'proceriq_blog_key_2026'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-api-key') || req.headers.get('x-blog-key')
  if (!key || key !== BLOG_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { slug, title, excerpt, content, category, readTime } = body

    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'slug, title, content required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .upsert({
        slug,
        title,
        excerpt: excerpt || '',
        content,
        published_at: new Date().toISOString(),
        image_url: null,
      }, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, appId: 'proceriq', slug: data?.slug })
  } catch (err) {
    console.error('Blog create error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
