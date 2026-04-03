'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ChoreList } from '@/components/ChoreList'
import { ChoreForm } from '@/components/ChoreForm'
import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { useChoresData } from '@/lib/hooks/useChoresData'
import { todayStr, isDueToday, formatDisplay } from '@/lib/dates'
import type { Chore } from '@/lib/types'

export default function ChoresPage() {
  const { user, member, family, isParent } = useFamilyMember()
  const { chores, completions, members, loading, refresh, upsertCompletion } = useChoresData(family?.id)
  const [showForm, setShowForm] = useState(false)
  const [editChore, setEditChore] = useState<Chore | undefined>()

  if (loading || !family || !member || !user) {
    return <AppShell><div className="text-gray-400 text-sm text-center py-8">Loading...</div></AppShell>
  }

  const today = todayStr()

  // Filter chores visible to this user
  const visibleChores = isParent
    ? chores.filter(c => isDueToday(c.frequency, c.day_of_week))
    : chores.filter(c => c.assigned_to === member.id && isDueToday(c.frequency, c.day_of_week))

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{isParent ? 'All Chores' : 'My Chores'}</h2>
            <p className="text-sm text-gray-500">{formatDisplay(new Date())}</p>
          </div>
          {isParent && (
            <button
              onClick={() => { setEditChore(undefined); setShowForm(true) }}
              className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
            >
              <Plus size={16} /> Add Chore
            </button>
          )}
        </div>

        <ChoreList
          chores={visibleChores}
          completions={completions}
          members={members}
          currentMemberId={member.id}
          isParent={isParent}
          familyId={family.id}
          date={today}
          onUpsert={upsertCompletion}
        />

        {/* All chores management for parent */}
        {isParent && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">All Chores (active)</h3>
            <div className="space-y-2">
              {chores.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setEditChore(c); setShowForm(true) }}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">
                      {c.frequency} · {c.points} pts ·{' '}
                      {members.find(m => m.id === c.assigned_to)?.display_name || 'Unassigned'}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Edit</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <ChoreForm
          familyId={family.id}
          userId={user.id}
          members={members}
          chore={editChore}
          onSaved={() => { setShowForm(false); refresh() }}
          onClose={() => setShowForm(false)}
        />
      )}
    </AppShell>
  )
}
