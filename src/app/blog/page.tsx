import Link from 'next/link'
import { createServerClient as createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Proceriq',
  description: 'Insights on AI, productivity, personal knowledge management, and building your second brain.',
}

export const revalidate = 3600 // revalidate every hour

export default async function BlogPage() {
  const supabase = createClient()
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, published_at, image_url')
    .order('published_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold text-white">Proceriq</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors text-sm">
              Sign in
            </Link>
            <Link
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-medium mb-6">
          📝 Blog
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Insights & Ideas</h1>
        <p className="text-gray-400 text-lg">
          AI, productivity, and the art of building a second brain.
        </p>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        {error || !posts || posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-4">✍️</div>
            <p>No posts yet — check back soon.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-indigo-500/40 rounded-xl overflow-hidden transition-all duration-200"
              >
                {post.image_url && (
                  <div className="w-full h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2 leading-snug">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-3">
                      {post.published_at
                        ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
                        : ''}
                    </p>
                  </div>
                  <span className="text-indigo-500 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
