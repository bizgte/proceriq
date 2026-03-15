export const MODEL_MAP = {
  small: 'openai/gpt-4o-mini',
  medium: 'anthropic/claude-sonnet-4-6',
  large: 'openai/gpt-4o'
} as const

export type ModelTier = keyof typeof MODEL_MAP

// Keep for backward compat with config page
export const MODEL_LABELS: Record<ModelTier, { label: string; icon: string; description: string }> = {
  small: { label: 'Fast', icon: '⚡', description: 'GPT-4o Mini — quick responses' },
  medium: { label: 'Smart', icon: '🧠', description: 'Claude Sonnet — balanced' },
  large: { label: 'Powerful', icon: '🔥', description: 'GPT-4o — most capable' }
}

export const ALL_MODELS = [
  // OpenAI
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', tier: 'fast' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', tier: 'powerful' },
  // Anthropic
  { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet', provider: 'Anthropic', tier: 'smart' },
  { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus', provider: 'Anthropic', tier: 'powerful' },
  // Google
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', tier: 'fast' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', tier: 'smart' },
  // xAI
  { id: 'x-ai/grok-2-1212', name: 'Grok 2', provider: 'xAI', tier: 'smart' },
  // Perplexity
  { id: 'perplexity/llama-3.1-sonar-large-128k-online', name: 'Perplexity Sonar', provider: 'Perplexity', tier: 'search' },
  // Meta
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', tier: 'fast' },
  // Mistral
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', tier: 'smart' },
] as const

export type ModelId = typeof ALL_MODELS[number]['id']
