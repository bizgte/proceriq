'use client'

interface SpaceToggleProps {
  space: string
  onChange: (space: string) => void
}

export default function SpaceToggle({ space, onChange }: SpaceToggleProps) {
  return (
    <div className="flex items-center bg-gray-800 rounded-xl p-1 border border-gray-700">
      <button
        onClick={() => onChange('work')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          space === 'work'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <span>💼</span>
        <span>Work</span>
      </button>
      <button
        onClick={() => onChange('personal')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          space === 'personal'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <span>🏠</span>
        <span>Personal</span>
      </button>
    </div>
  )
}
