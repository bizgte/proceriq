export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ChatInterface from '@/components/chat/ChatInterface'

export default async function DashboardPage() {
  let isPro = false
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    isPro = user?.user_metadata?.plan === 'pro' || user?.user_metadata?.subscribed === true
  } catch {}
  return <ChatInterface isPro={isPro} />
}
