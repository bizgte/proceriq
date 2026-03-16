import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-gray-100">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold text-white">Proceriq</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span>✨</span> AI with persistent memory
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your second brain.<br />
            <span className="text-indigo-400">Every AI conversation,</span><br />
            remembered.
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Persistent memory for every AI you use. Every conversation, every insight, every idea — stored and recalled when you need it most.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Start for free →
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-gray-700"
            >
              Try demo
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-4">No credit card required · 14-day free trial</p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Everything your AI needs to know about you</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-white mb-3">Persistent Memory</h3>
              <p className="text-gray-400">
                Every conversation is embedded and stored in a vector database. Future chats are automatically enriched with relevant context from your past.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors">
              <div className="text-4xl mb-4">🔀</div>
              <h3 className="text-xl font-semibold text-white mb-3">Dual Spaces</h3>
              <p className="text-gray-400">
                Separate your Work and Personal memory spaces. Keep your professional insights and personal thoughts organized and private from each other.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors">
              <div className="text-4xl mb-4">🔌</div>
              <h3 className="text-xl font-semibold text-white mb-3">API & MCP</h3>
              <p className="text-gray-400">
                Connect any AI via our REST API or MCP protocol. Works with Claude, ChatGPT, and custom agents. Your memory travels with you everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Simple pricing</h2>
          <p className="text-gray-400 text-center mb-12">Start free, upgrade when you&apos;re ready.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Free</h3>
              <div className="text-4xl font-bold text-white mb-1">$0</div>
              <p className="text-gray-500 text-sm mb-6">14-day trial, no card needed</p>
              <ul className="space-y-3 text-gray-400 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 100 memories</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Work + Personal spaces</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Fast model (GPT-4o Mini)</li>
                <li className="flex items-center gap-2"><span className="text-gray-600">✗</span> API access</li>
              </ul>
              <Link href="/auth/login" className="block text-center bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors font-medium">
                Get started
              </Link>
            </div>

            {/* Personal */}
            <div className="bg-gray-900 border-2 border-indigo-500 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                Most popular
              </div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">Personal</h3>
              <div className="text-4xl font-bold text-white mb-1">$29<span className="text-lg text-gray-400">/mo</span></div>
              <p className="text-gray-500 text-sm mb-6">For individuals who think deeply</p>
              <ul className="space-y-3 text-gray-400 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited memories</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All 3 AI models</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> API access</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Priority support</li>
              </ul>
              <Link href="/auth/login" className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg transition-colors font-medium">
                Start trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-white mb-1">$79<span className="text-lg text-gray-400">/mo</span></div>
              <p className="text-gray-500 text-sm mb-6">For power users and teams</p>
              <ul className="space-y-3 text-gray-400 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Everything in Personal</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> MCP server access</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Team workspaces</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Custom integrations</li>
              </ul>
              <Link href="/auth/login" className="block text-center bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors font-medium">
                Start trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 mt-16">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="text-gray-400 font-medium">Proceriq</span>
          </div>
          <p className="text-gray-600 text-sm">© 2026 Proceriq. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
