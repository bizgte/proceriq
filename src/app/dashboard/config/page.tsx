'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { MODEL_MAP, MODEL_LABELS, type ModelTier } from '@/lib/models'

interface ApiKey {
  id: string
  label: string
  key: string
  created_at: string
}

interface TelegramLink {
  telegram_chat_id: number
  telegram_username: string | null
  telegram_first_name: string | null
  linked_at: string
}

interface LinkData {
  token: string
  bot_username: string
  deep_link: string
}

function TelegramSection() {
  const [linkedAccount, setLinkedAccount] = useState<TelegramLink | null | undefined>(undefined)
  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check initial link status
  useEffect(() => {
    fetch('/api/telegram/link')
      .then(r => r.json())
      .then(data => setLinkedAccount(data || null))
      .catch(() => setLinkedAccount(null))
  }, [])

  // Poll for link completion after generating token
  useEffect(() => {
    if (!linkData) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/telegram/link')
        const data = await res.json()
        if (data && data.telegram_chat_id > 0) {
          setLinkedAccount(data)
          setLinkData(null)
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // ignore poll errors
      }
    }, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [linkData])

  const generateLink = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/telegram/link', { method: 'POST' })
      const data = await res.json()
      setLinkData(data)
    } catch {
      // handle error
    } finally {
      setGenerating(false)
    }
  }

  const disconnect = async () => {
    setDisconnecting(true)
    try {
      await fetch('/api/telegram/link', { method: 'DELETE' })
      setLinkedAccount(null)
      setLinkData(null)
    } catch {
      // handle error
    } finally {
      setDisconnecting(false)
    }
  }

  // Loading state
  if (linkedAccount === undefined) {
    return (
      <div className="text-gray-500 text-sm py-4 text-center">Checking connection status…</div>
    )
  }

  // STATE B — Connected
  if (linkedAccount) {
    const displayName = linkedAccount.telegram_username
      ? `@${linkedAccount.telegram_username}`
      : linkedAccount.telegram_first_name || 'Unknown'

    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-green-950/50 text-green-400 border border-green-800 text-sm font-medium px-3 py-1 rounded-full">
            ✅ Connected
          </span>
          <span className="text-white text-sm font-medium">{displayName}</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://t.me/proceriq_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            ✈️ Open @proceriq_bot
          </a>
          <button
            onClick={disconnect}
            disabled={disconnecting}
            className="text-gray-500 hover:text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting…' : 'Disconnect'}
          </button>
        </div>
      </div>
    )
  }

  // STATE A — Not connected, link generated
  if (linkData) {
    return (
      <div>
        <p className="text-gray-400 text-sm mb-4">
          Tap the button below to open Telegram. Send the message that appears — your account will link automatically.
        </p>
        <a
          href={linkData.deep_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#2AABEE] hover:bg-[#229ed9] text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 mb-3"
        >
          ✈️ Open @{linkData.bot_username}
        </a>
        <p className="text-gray-600 text-xs text-center">Link expires in 10 minutes</p>
        <div className="mt-3 flex items-center gap-2 text-gray-500 text-xs justify-center">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          Waiting for Telegram confirmation…
        </div>
      </div>
    )
  }

  // STATE A — Not connected, no link yet
  return (
    <div>
      <p className="text-gray-400 text-sm mb-4">
        Chat with your AI and access your memories from Telegram
      </p>
      <button
        onClick={generateLink}
        disabled={generating}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        {generating ? 'Generating…' : '🔗 Generate Link'}
      </button>
    </div>
  )
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

        {/* Connect Telegram */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">🤖 Connect Telegram</h2>
          <div className="mb-4">
            <TelegramSection />
          </div>

          {/* Webhook setup (advanced) */}
          <details className="mt-4">
            <summary className="text-gray-600 text-xs cursor-pointer hover:text-gray-400 transition-colors select-none">
              ⚙️ Advanced: Set webhook
            </summary>
            <div className="mt-3 border-t border-gray-800 pt-3">
              <p className="text-gray-500 text-xs mb-3">
                Only needed when self-hosting. Set TELEGRAM_BOT_TOKEN in your environment first.
              </p>
              {webhookStatus && (
                <div className={`rounded-xl px-4 py-3 text-sm mb-3 ${
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
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                {settingWebhook ? 'Setting webhook…' : '🔗 Set Webhook'}
              </button>
            </div>
          </details>
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
