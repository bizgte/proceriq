'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Activity {
  id: string
  action: string
  source: string
  metadata: Record<string, unknown>
  created_at: string
}

function getActivityIcon(action: string): string {
  if (action.includes('memory') || action.includes('save')) return '🧠'
  if (action.includes('chat') || action.includes('message')) return '💬'
  if (action.includes('search')) return '🔍'
  if (action.includes('delete')) return '🗑️'
  if (action.includes('login') || action.includes('auth')) return '🔐'
  return '⚡'
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('activity')
        .select('*')
        .eq('user_id', 'demo-user')
        .order('created_at', { ascending: false })
        .limit(50)

      setActivities(data || [])
      setLoading(false)
    }

    fetchActivity()
  }, [])

  // Mock recent activity for demo
  const mockActivities: Activity[] = [
    { id: '1', action: 'Memory saved from chat', source: 'web', metadata: { space: 'work' }, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: '2', action: 'Chat session started', source: 'web', metadata: { model: 'gpt-4o-mini' }, created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    { id: '3', action: 'Memory search performed', source: 'api', metadata: { query: 'project deadlines' }, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: '4', action: 'Memory saved from chat', source: 'web', metadata: { space: 'personal' }, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white">Activity Feed</h1>
        <p className="text-gray-500 text-sm mt-1">Your memory and chat history</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading activity...</div>
        ) : (
          <div className="space-y-3">
            {displayActivities.map((activity, i) => (
              <div key={activity.id} className="flex gap-4 items-start">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {getActivityIcon(activity.action)}
                  </div>
                  {i < displayActivities.length - 1 && (
                    <div className="w-0.5 h-full min-h-[24px] bg-gray-800 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <p className="text-gray-200 text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {activity.source}
                      </span>
                      <span className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
