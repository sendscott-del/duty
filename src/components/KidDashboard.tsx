'use client'

import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { useChoresData } from '@/lib/hooks/useChoresData'
import { useRewards } from '@/lib/hooks/useRewards'
import { ChoreList } from './ChoreList'
import { PointsDisplay } from './PointsDisplay'
import { todayStr, isDueToday, formatDisplay } from '@/lib/dates'

interface KidDashboardProps {
  memberId: string
}

export function KidDashboard({ memberId }: KidDashboardProps) {
  const { family, member, isParent } = useFamilyMember()
  const { chores, completions, members, loading, upsertCompletion } = useChoresData(family?.id)
  const { getBalance } = useRewards(family?.id)

  if (loading || !family || !member) {
    return <div className="text-gray-400 text-sm text-center py-8">Loading...</div>
  }

  const today = todayStr()
  const balance = getBalance(memberId)

  const myChores = chores.filter(c =>
    c.assigned_to === memberId && isDueToday(c.frequency, c.day_of_week)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">My Chores</h2>
          <p className="text-sm text-gray-500">{formatDisplay(new Date())}</p>
        </div>
        <PointsDisplay points={balance} size="lg" />
      </div>

      <ChoreList
        chores={myChores}
        completions={completions}
        members={members}
        currentMemberId={memberId}
        isParent={isParent}
        familyId={family.id}
        date={today}
        onUpsert={upsertCompletion}
      />
    </div>
  )
}
