export const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export function getOpenRouterHeaders() {
  return {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://proceriq.com',
    'X-Title': 'Proceriq'
  }
}
