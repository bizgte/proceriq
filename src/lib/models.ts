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
  { id: 'openrouter/auto', name: 'Auto Router', provider: 'OpenRouter', tier: 'auto', description: 'Automatically picks the best model for your query', proOnly: true },
  // OpenAI
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', tier: 'fast', description: 'Fast and cheap', proOnly: false },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', tier: 'powerful', description: 'Most capable from OpenAI', proOnly: true },
  // Anthropic
  { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet', provider: 'Anthropic', tier: 'smart', description: 'Balanced speed and intelligence', proOnly: true },
  { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus', provider: 'Anthropic', tier: 'powerful', description: 'Most capable from Anthropic', proOnly: true },
  // Google
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', tier: 'fast', description: 'Fast Google model', proOnly: false },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', tier: 'smart', description: 'Balanced Google model', proOnly: true },
  // xAI
  { id: 'x-ai/grok-2-1212', name: 'Grok 2', provider: 'xAI', tier: 'smart', description: 'xAI Grok with real-time knowledge', proOnly: true },
  // Perplexity
  { id: 'perplexity/llama-3.1-sonar-large-128k-online', name: 'Perplexity Sonar', provider: 'Perplexity', tier: 'search', description: 'Online search + reasoning', proOnly: true },
  // Meta
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', tier: 'fast', description: 'Open-source powerhouse', proOnly: false },
  // Mistral
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', tier: 'smart', description: 'Efficient European model', proOnly: true },
] as const

export type ModelId = typeof ALL_MODELS[number]['id']

// Free tier: 3 models (GPT-4o Mini, Gemini Flash, Llama 70B)
export const FREE_MODEL_IDS: ModelId[] = [
  'openai/gpt-4o-mini',
  'google/gemini-2.0-flash-001',
  'meta-llama/llama-3.3-70b-instruct',
]

export function getModelsForPlan(isPro: boolean) {
  return isPro ? ALL_MODELS : ALL_MODELS.filter(m => !m.proOnly)
}

export function isModelAllowed(modelId: string, isPro: boolean): boolean {
  if (isPro) return true
  return FREE_MODEL_IDS.includes(modelId as ModelId)
}
