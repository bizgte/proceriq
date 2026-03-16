'use client'

interface SpaceToggleProps {
  space: string
  onChange: (space: string) => void
}

export default function SpaceToggle({ space, onChange }: SpaceToggleProps) {
  const options = [
    { value: 'auto', label: 'Auto', icon: '🔀' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'personal', label: 'Personal', icon: '🏠' },
  ]
  return (
    <div className="flex items-center bg-gray-800 rounded-xl p-1 border border-gray-700">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.value === 'auto' ? 'AI will auto-classify each message as work or personal' : undefined}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            space === opt.value
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
