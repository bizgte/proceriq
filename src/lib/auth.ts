// src/lib/auth.ts — get authenticated user ID from session
import { createServerClient } from '@/lib/supabase/server'

export async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
  } catch {
    return null
  }
}
