'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: '💬', label: 'Chat' },
  { href: '/dashboard/memories', icon: '🧠', label: 'Memories' },
  { href: '/dashboard/activity', icon: '⚡', label: 'Activity' },
  { href: '/dashboard/config', icon: '⚙️', label: 'Config' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-[#030712] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-60 bg-[#111827] border-r border-gray-800 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-3 md:px-4 py-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">🧠</span>
            <span className="hidden md:block text-lg font-bold text-white">Proceriq</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="hidden md:block text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">
              D
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-white">Demo User</p>
              <p className="text-xs text-gray-500">Free trial</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
