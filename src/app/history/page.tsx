'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { MemberAvatar } from '@/components/MemberAvatar'
import { PointsDisplay } from '@/components/PointsDisplay'
import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { useChoresData } from '@/lib/hooks/useChoresData'
import { Check, Camera, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function HistoryPage() {
  const { member, family, isParent } = useFamilyMember()
  const { chores, completions, members, loading } = useChoresData(family?.id)
  const [filterMember, setFilterMember] = useState<string>('all')

  if (loading || !family || !member) {
    return <AppShell><div className="text-gray-400 text-sm text-center py-8">Loading...</div></AppShell>
  }

  // Get all completions as array, sorted by date desc
  const allCompletions = Array.from(completions.values())
    .filter(c => {
      if (!isParent) return c.member_id === member.id
      if (filterMember !== 'all') return c.member_id === filterMember
      return true
    })
    .sort((a, b) => b.completion_date.localeCompare(a.completion_date))

  const children = members.filter(m => m.role === 'child')

  return (
    <AppShell>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">History</h2>

        {isParent && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterMember('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                filterMember === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All Kids
            </button>
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setFilterMember(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  filterMember === c.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {c.avatar_emoji} {c.display_name}
              </button>
            ))}
          </div>
        )}

        {allCompletions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No history yet.</div>
        ) : (
          <div className="space-y-2">
            {allCompletions.map(comp => {
              const chore = chores.find(c => c.id === comp.chore_id)
              const kid = members.find(m => m.id === comp.member_id)

              return (
                <div key={comp.id || `${comp.chore_id}-${comp.completion_date}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {kid && <span className="text-lg">{kid.avatar_emoji}</span>}
                    <div>
                      <div className="text-sm font-medium">{chore?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{comp.completion_date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {comp.checked_off && <Check size={14} className="text-green-600" />}
                    {comp.photo_url && <Camera size={14} className="text-blue-600" />}
                    {comp.approved === true && <ThumbsUp size={14} className="text-green-600" />}
                    {comp.approved === false && <ThumbsDown size={14} className="text-red-600" />}
                    {comp.points_awarded > 0 && <PointsDisplay points={comp.points_awarded} size="sm" />}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
