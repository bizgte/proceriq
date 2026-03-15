'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { MODEL_MAP, MODEL_LABELS, type ModelTier } from '@/lib/models'



interface ApiKey {
  id: string
  label: string
  key: string
  created_at: string
}

export default function ConfigPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [modelPrefs, setModelPrefs] = useState({
    default: 'small' as ModelTier,
    work: 'medium' as ModelTier,
    personal: 'small' as ModelTier,
  })
  const [copied, setCopied] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const generateKey = async () => {
    setGenerating(true)
    const key = `prq_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    const newKey: ApiKey = {
      id: Math.random().toString(36).slice(2),
      label: `Key ${apiKeys.length + 1}`,
      key,
      created_at: new Date().toISOString()
    }
    setApiKeys(prev => [...prev, newKey])
    setGenerating(false)
  }

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const revokeKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id))
  }

  const tiers: ModelTier[] = ['small', 'medium', 'large']
  const [webhookStatus, setWebhookStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [settingWebhook, setSettingWebhook] = useState(false)

  const setWebhook = async () => {
    setSettingWebhook(true)
    setWebhookStatus(null)
    try {
      const res = await fetch('/api/telegram/setup', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setWebhookStatus({ type: 'success', message: '✅ Webhook set! Message your bot to start chatting.' })
      } else {
        setWebhookStatus({ type: 'error', message: data.error || data.description || 'Failed to set webhook' })
      }
    } catch {
      setWebhookStatus({ type: 'error', message: 'Request failed. Check your token and try again.' })
    } finally {
      setSettingWebhook(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-white mb-8">Configuration</h1>

        {/* API Keys */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">API Keys</h2>
              <p className="text-gray-500 text-sm mt-0.5">Connect Proceriq to external tools and agents</p>
            </div>
            <button
              onClick={generateKey}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {generating ? '...' : '+ New key'}
            </button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p className="text-2xl mb-2">🔑</p>
              <p className="text-sm">No API keys yet. Generate one to connect external tools.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map(k => (
                <div key={k.id} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{k.label}</p>
                    <p className="text-xs text-gray-500 font-mono truncate mt-0.5">{k.key}</p>
                  </div>
                  <button
                    onClick={() => copyKey(k.key, k.id)}
                    className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded transition-colors"
                  >
                    {copied === k.id ? '✓ Copied' : '📋 Copy'}
                  </button>
                  <button
                    onClick={() => revokeKey(k.id)}
                    className="text-gray-600 hover:text-red-400 text-sm px-2 py-1 rounded transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Model Preferences */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Model Preferences</h2>
          <p className="text-gray-500 text-sm mb-4">Choose your default AI model for each context</p>

          <div className="space-y-4">
            {(['default', 'work', 'personal'] as const).map(context => (
              <div key={context} className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium text-gray-300 capitalize w-24">
                  {context === 'default' ? '🌐 Default' : context === 'work' ? '💼 Work' : '🏠 Personal'}
                </label>
                <select
                  value={modelPrefs[context]}
                  onChange={(e) => setModelPrefs(prev => ({ ...prev, [context]: e.target.value as ModelTier }))}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {tiers.map(tier => (
                    <option key={tier} value={tier}>
                      {MODEL_LABELS[tier].icon} {MODEL_LABELS[tier].label} — {MODEL_MAP[tier]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Telegram Bot */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">🤖 Telegram Bot</h2>
          <p className="text-gray-500 text-sm mb-4">Chat with Proceriq directly from Telegram with full memory access</p>

          <ol className="space-y-3 mb-5">
            {[
              { n: 1, text: 'Create a bot via @BotFather on Telegram and copy your token' },
              { n: 2, text: 'Add TELEGRAM_BOT_TOKEN=<your-token> to your Vercel environment variables' },
              { n: 3, text: 'Click "Set Webhook" below to connect Telegram to this app' },
              { n: 4, text: 'Message your bot — it will respond with memory!' },
            ].map(step => (
              <li key={step.n} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-full text-xs flex items-center justify-center font-bold">
                  {step.n}
                </span>
                <span className="text-gray-300 text-sm">{step.text}</span>
              </li>
            ))}
          </ol>

          {webhookStatus && (
            <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${
              webhookStatus.type === 'success'
                ? 'bg-green-950/50 text-green-300 border border-green-800'
                : 'bg-red-950/50 text-red-300 border border-red-800'
            }`}>
              {webhookStatus.message}
            </div>
          )}

          <button
            onClick={setWebhook}
            disabled={settingWebhook}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {settingWebhook ? 'Setting webhook…' : '🔗 Set Webhook'}
          </button>
        </section>

        {/* Account info */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">User</span>
              <span className="text-white text-sm">Demo User</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Plan</span>
              <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-full border border-indigo-500/20">Free Trial</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400 text-sm">Memory spaces</span>
              <span className="text-white text-sm">Work + Personal</span>
            </div>
          </div>
          <button className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors border border-gray-700">
            Upgrade to Personal →
          </button>
        </section>
      </div>
    </div>
  )
}
