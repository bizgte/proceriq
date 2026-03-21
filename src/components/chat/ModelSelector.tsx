'use client'

import { getModelsForPlan, ALL_MODELS, type ModelId } from '@/lib/models'

interface ModelSelectorProps {
  model: ModelId
  onChange: (model: ModelId) => void
  isPro?: boolean
}

export default function ModelSelector({ model, onChange, isPro = false }: ModelSelectorProps) {
  const available = getModelsForPlan(isPro)
  const providers = Array.from(new Set(ALL_MODELS.map(m => m.provider)))

  return (
    <div className="relative">
      <select
        value={model}
        onChange={e => onChange(e.target.value as ModelId)}
        className="appearance-none bg-gray-800 border border-gray-700 text-white text-sm rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
      >
        {providers.map(provider => {
          const providerModels = ALL_MODELS.filter(m => m.provider === provider)
          const visibleModels = isPro ? providerModels : providerModels.filter(m => !m.proOnly)
          if (visibleModels.length === 0) return null
          return (
            <optgroup key={provider} label={provider}>
              {visibleModels.map(m => (
                <option key={m.id} value={m.id}>
                  {m.provider === 'OpenRouter' ? '🔀 ' : ''}{m.name} — {m.description}
                </option>
              ))}
            </optgroup>
          )
        })}
        {!isPro && (
          <optgroup label="🔒 Pro only">
            <option disabled value="">Claude Sonnet, GPT-4o, Grok, Gemini Pro + more...</option>
          </optgroup>
        )}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
    </div>
  )
}
