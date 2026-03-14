'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import MessageBubble from './MessageBubble'
import SpaceToggle from './SpaceToggle'
import ModelSelector from './ModelSelector'
import type { ModelTier } from '@/lib/models'

interface Message {
  role: 'user' | 'assistant'
  content: string
  memoryCount?: number
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Proceriq, your personal AI with persistent memory. Every conversation we have is saved and I'll remember relevant context for future chats. What's on your mind today? 🧠",
      memoryCount: 0
    }
  ])
  const [input, setInput] = useState('')
  const [space, setSpace] = useState('work')
  const [model, setModel] = useState<ModelTier>('small')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)

    try {
      const history = newMessages.slice(-10).slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          space,
          model_tier: model,
          history
        })
      })

      const memoryCount = parseInt(response.headers.get('X-Memory-Count') || '0', 10)

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                fullContent += delta
                setStreamingContent(fullContent)
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fullContent || 'I encountered an issue generating a response. Please try again.',
        memoryCount
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        memoryCount: 0
      }])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <SpaceToggle space={space} onChange={setSpace} />
        <ModelSelector model={model} onChange={setModel} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Streaming bubble */}
        {isStreaming && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">🧠</span>
                <span className="text-xs text-gray-500 font-medium">Proceriq</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
              <div className="bg-gray-800 text-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-700 text-sm leading-relaxed prose-chat">
                {streamingContent || <span className="text-gray-500 italic">Thinking...</span>}
                {streamingContent && (
                  <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-end gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message Proceriq (${space} space)...`}
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none placeholder-gray-500 max-h-32 disabled:opacity-50"
            style={{ height: '24px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 text-sm"
          >
            {isStreaming ? (
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              '↑'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-700 mt-2 text-center">
          Messages in <strong className="text-gray-600">{space}</strong> space · <strong className="text-gray-600">{model}</strong> model · Memories saved automatically
        </p>
      </div>
    </div>
  )
}
