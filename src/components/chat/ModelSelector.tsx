'use client'

import { ALL_MODELS, type ModelId } from '@/lib/models'

interface ModelSelectorProps {
  model: ModelId
  onChange: (model: ModelId) => void
}

// Group models by provider
const providers = Array.from(new Set(ALL_MODELS.map(m => m.provider)))

export default function ModelSelector({ model, onChange }: ModelSelectorProps) {
  const selected = ALL_MODELS.find(m => m.id === model) || ALL_MODELS[0]

  return (
    <div className="relative">
      <select
        value={model}
        onChange={e => onChange(e.target.value as ModelId)}
        className="appearance-none bg-gray-800 border border-gray-700 text-white text-sm rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
      >
        {providers.map(provider => (
          <optgroup key={provider} label={provider}>
            {ALL_MODELS.filter(m => m.provider === provider).map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
    </div>
  )
}
