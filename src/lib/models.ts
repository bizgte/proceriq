export const MODEL_MAP = {
  auto: 'openrouter/auto',
  small: 'openai/gpt-4o-mini',
  medium: 'anthropic/claude-sonnet-4-6',
  large: 'openai/gpt-4o'
} as const

export type ModelTier = keyof typeof MODEL_MAP

export const MODEL_LABELS: Record<ModelTier, { label: string; icon: string; description: string }> = {
  auto: { label: 'Auto Router', icon: '🔀', description: 'OpenRouter Auto — picks the best model for each query' },
  small: { label: 'Fast', icon: '⚡', description: 'GPT-4o Mini — quick responses' },
  medium: { label: 'Smart', icon: '🧠', description: 'Claude Sonnet — balanced' },
  large: { label: 'Powerful', icon: '🔥', description: 'GPT-4o — most capable' }
}

export const ALL_MODELS = [
  // Auto
  { id: 'openrouter/auto', name: 'Auto Router', provider: 'OpenRouter', tier: 'auto', description: 'Automatically picks the best model for your query' },
  // OpenAI
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', tier: 'fast', description: 'Fast and cheap' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', tier: 'powerful', description: 'Most capable from OpenAI' },
  // Anthropic
  { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet', provider: 'Anthropic', tier: 'smart', description: 'Balanced speed and intelligence' },
  { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus', provider: 'Anthropic', tier: 'powerful', description: 'Most capable from Anthropic' },
  // Google
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', tier: 'fast', description: 'Fast Google model' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', tier: 'smart', description: 'Balanced Google model' },
  // xAI
  { id: 'x-ai/grok-2-1212', name: 'Grok 2', provider: 'xAI', tier: 'smart', description: 'xAI Grok with real-time knowledge' },
  // Perplexity
  { id: 'perplexity/llama-3.1-sonar-large-128k-online', name: 'Perplexity Sonar', provider: 'Perplexity', tier: 'search', description: 'Online search + reasoning' },
  // Meta
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', tier: 'fast', description: 'Open-source powerhouse' },
  // Mistral
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', tier: 'smart', description: 'Efficient European model' },
] as const

export type ModelId = typeof ALL_MODELS[number]['id']
