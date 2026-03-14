'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Memory {
  id: string
  content: string
  space: string
  metadata: Record<string, unknown>
  created_at: string
}

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'work', label: '💼 Work' },
  { id: 'personal', label: '🏠 Personal' },
]

export default function MemoriesClient() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchMemories = useCallback(async (space = 'all') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/memory/list?space=${space}`)
      const data = await res.json()
      setMemories(data.memories || [])
      setFilteredMemories(data.memories || [])
    } catch {
      console.error('Failed to fetch memories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMemories(activeTab)
  }, [activeTab, fetchMemories])

  // Debounced semantic search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMemories(memories)
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch('/api/memory/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery, space: activeTab === 'all' ? 'both' : activeTab })
        })
        const data = await res.json()
        setFilteredMemories(data.results || [])
      } catch {
        console.error('Search failed')
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, memories, activeTab])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await fetch('/api/memory/list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setMemories(prev => prev.filter(m => m.id !== id))
      setFilteredMemories(prev => prev.filter(m => m.id !== id))
    } catch {
      console.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white mb-4">Memory Bank</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSearchQuery('')
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Semantic search your memories..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-500 text-sm"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 text-xs">searching...</span>
          )}
        </div>
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading memories...</div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-gray-400 font-medium">No memories yet</p>
            <p className="text-gray-600 text-sm mt-1">Start chatting to build your second brain</p>
          </div>
        ) : (
          filteredMemories.map(memory => (
            <div key={memory.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <p className="text-gray-200 text-sm leading-relaxed line-clamp-3 flex-1">
                  {memory.content}
                </p>
                <button
                  onClick={() => handleDelete(memory.id)}
                  disabled={deleting === memory.id}
                  className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 text-lg mt-0.5"
                  title="Delete memory"
                >
                  {deleting === memory.id ? '⏳' : '🗑️'}
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  memory.space === 'work'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}>
                  {memory.space === 'work' ? '💼 Work' : '🏠 Personal'}
                </span>
                <span className="text-xs text-gray-600">
                  {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
