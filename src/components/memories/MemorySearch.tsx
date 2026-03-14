'use client'

import { useState, useEffect } from 'react'

interface Memory {
  id: string
  content: string
  space: string
  metadata: Record<string, unknown>
  created_at: string
  similarity?: number
}

interface MemorySearchProps {
  space: string
  onResults: (results: Memory[]) => void
  onClear: () => void
}

export default function MemorySearch({ space, onResults, onClear }: MemorySearchProps) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      onClear()
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch('/api/memory/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, space: space === 'all' ? 'both' : space })
        })
        const data = await res.json()
        onResults(data.results || [])
      } catch {
        console.error('Search failed')
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query, space, onResults, onClear])

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Semantic search your memories..."
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-500 text-sm"
      />
      {searching && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 text-xs">searching...</span>
      )}
    </div>
  )
}
