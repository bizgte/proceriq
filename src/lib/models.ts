export const MODEL_MAP = {
  small: 'openai/gpt-4o-mini',
  medium: 'anthropic/claude-sonnet-4-5',
  large: 'openai/gpt-4o'
} as const

export type ModelTier = keyof typeof MODEL_MAP

export const MODEL_LABELS: Record<ModelTier, { label: string; icon: string; description: string }> = {
  small: { label: 'Fast', icon: '⚡', description: 'GPT-4o Mini — quick responses' },
  medium: { label: 'Smart', icon: '🧠', description: 'Claude Sonnet — balanced' },
  large: { label: 'Powerful', icon: '🔥', description: 'GPT-4o — most capable' }
}
