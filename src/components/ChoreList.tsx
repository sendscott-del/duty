'use client'

import { ChoreCard } from './ChoreCard'
import type { Chore, Completion, FamilyMember } from '@/lib/types'
import { completionKey } from '@/lib/dates'

interface ChoreListProps {
  chores: Chore[]
  completions: Map<string, Completion>
  members: FamilyMember[]
  currentMemberId: string
  isParent: boolean
  familyId: string
  date: string
  onUpsert: (choreId: string, memberId: string, date: string, updates: Partial<Completion>) => Promise<void>
}

export function ChoreList({
  chores,
  completions,
  members,
  currentMemberId,
  isParent,
  familyId,
  date,
  onUpsert,
}: ChoreListProps) {
  if (chores.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No chores yet. {isParent ? 'Add some from the Chores tab!' : 'Check back later!'}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {chores.map(chore => {
        const memberId = chore.assigned_to || currentMemberId
        const key = completionKey(chore.id, memberId, date)
        const completion = completions.get(key)
        const member = members.find(m => m.id === chore.assigned_to)

        return (
          <ChoreCard
            key={chore.id}
            chore={chore}
            completion={completion}
            member={member}
            currentMemberId={currentMemberId}
            isParent={isParent}
            familyId={familyId}
            date={date}
            onUpsert={onUpsert}
          />
        )
      })}
    </div>
  )
}
