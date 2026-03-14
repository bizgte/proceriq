'use client'

import { formatDistanceToNow } from 'date-fns'

interface Memory {
  id: string
  content: string
  space: string
  metadata: Record<string, unknown>
  created_at: string
  similarity?: number
}

interface MemoryCardProps {
  memory: Memory
  onDelete?: (id: string) => void
}

export default function MemoryCard({ memory, onDelete }: MemoryCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <p className="text-gray-200 text-sm leading-relaxed line-clamp-3 flex-1">
          {memory.content}
        </p>
        {onDelete && (
          <button
            onClick={() => onDelete(memory.id)}
            className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 text-lg mt-0.5"
            title="Delete memory"
          >
            🗑️
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          memory.space === 'work'
            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
        }`}>
          {memory.space === 'work' ? '💼 Work' : '🏠 Personal'}
        </span>
        {memory.similarity !== undefined && (
          <span className="text-xs text-indigo-400">
            {Math.round(memory.similarity * 100)}% match
          </span>
        )}
        <span className="text-xs text-gray-600">
          {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}
