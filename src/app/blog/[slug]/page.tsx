import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import BlogContent from './BlogContent'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', params.slug)
    .single()

  if (!post) return { title: 'Post not found — Proceriq' }

  return {
    title: `${post.title} — Proceriq Blog`,
    description: post.excerpt || undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const supabase = createClient()
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !post) notFound()

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold text-white">Proceriq</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">
              ← Blog
            </Link>
            <Link
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Meta */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm mb-6 transition-colors"
          >
            ← All posts
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-gray-400 leading-relaxed mb-4 border-l-2 border-indigo-500/40 pl-4">
              {post.excerpt}
            </p>
          )}
          <p className="text-sm text-gray-600">
            {post.published_at
              ? format(new Date(post.published_at), 'MMMM d, yyyy')
              : ''}
          </p>
        </div>

        {/* Hero image */}
        {post.image_url && (
          <div className="rounded-xl overflow-hidden mb-10 border border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full object-cover max-h-[420px]"
            />
          </div>
        )}

        {/* Hero video */}
        {post.video_url && (
          <div className="rounded-xl overflow-hidden mb-10 border border-gray-800 aspect-video">
            <iframe
              src={post.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Content */}
        <BlogContent content={post.content} />

        {/* CTA */}
        <div className="mt-16 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-8 text-center">
          <div className="text-3xl mb-3">🧠</div>
          <h3 className="text-xl font-bold text-white mb-2">Build your second brain</h3>
          <p className="text-gray-400 text-sm mb-6">
            Proceriq gives your AI a persistent memory — so every conversation builds on the last.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Get started free →
          </Link>
        </div>
      </article>
    </div>
  )
}
