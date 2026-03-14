'use client'

import { MODEL_LABELS, type ModelTier } from '@/lib/models'

interface ModelSelectorProps {
  model: ModelTier
  onChange: (model: ModelTier) => void
}

const tiers: ModelTier[] = ['small', 'medium', 'large']

export default function ModelSelector({ model, onChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center bg-gray-800 rounded-xl p-1 border border-gray-700">
      {tiers.map(tier => (
        <button
          key={tier}
          onClick={() => onChange(tier)}
          title={MODEL_LABELS[tier].description}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            model === tier
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{MODEL_LABELS[tier].icon}</span>
          <span>{MODEL_LABELS[tier].label}</span>
        </button>
      ))}
    </div>
  )
}
