'use client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  memoryCount?: number
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🧠</span>
            <span className="text-xs text-gray-500 font-medium">Proceriq</span>
            {message.memoryCount && message.memoryCount > 0 ? (
              <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
                🧠 {message.memoryCount} {message.memoryCount === 1 ? 'memory' : 'memories'}
              </span>
            ) : null}
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed prose-chat ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
