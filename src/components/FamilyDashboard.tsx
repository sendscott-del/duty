'use client'

import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { useChoresData } from '@/lib/hooks/useChoresData'
import { useRewards } from '@/lib/hooks/useRewards'
import { useChallenges } from '@/lib/hooks/useChallenges'
import { MemberAvatar } from './MemberAvatar'
import { PointsDisplay } from './PointsDisplay'
import { StreakBadge } from './StreakBadge'
import { LevelIndicator } from './LevelIndicator'
import { ApprovalQueue } from './ApprovalQueue'
import { WeeklyChallenge } from './WeeklyChallenge'
import { todayStr, isDueToday, completionKey } from '@/lib/dates'
import { isChoreComplete } from '@/lib/points'

export function FamilyDashboard() {
  const { family, member } = useFamilyMember()
  const { chores, completions, members, loading, upsertCompletion } = useChoresData(family?.id)
  const { getBalance } = useRewards(family?.id)
  const { challenge, generateChallenge } = useChallenges(family?.id)

  if (loading || !family || !member) {
    return <div className="text-gray-400 text-sm text-center py-8">Loading...</div>
  }

  const today = todayStr()
  const children = members.filter(m => m.role === 'child')

  // Pending approvals
  const pendingApprovals = chores
    .filter(c => c.require_approval)
    .flatMap(c => {
      const memberId = c.assigned_to
      if (!memberId) return []
      const key = completionKey(c.id, memberId, today)
      const comp = completions.get(key)
      if (comp && comp.approved === null && (comp.checked_off || !c.require_checkoff)) {
        return [{ chore: c, completion: comp, member: members.find(m => m.id === memberId) }]
      }
      return []
    })

  // Challenge progress
  const challengeProgress = challenge?.goal_type === 'family_completions'
    ? Array.from(completions.values()).filter(c => c.points_awarded > 0).length
    : 0

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Family Dashboard</h2>

      {/* Weekly challenge */}
      <WeeklyChallenge
        challenge={challenge}
        progress={challengeProgress}
        isParent={true}
        onGenerate={() => generateChallenge()}
        onSelectTemplate={(i) => generateChallenge(i)}
      />

      {/* Kids overview */}
      <div className="grid grid-cols-2 gap-3">
        {children.map(child => {
          const kidChores = chores.filter(c =>
            c.assigned_to === child.id && isDueToday(c.frequency, c.day_of_week)
          )
          const doneCount = kidChores.filter(c => {
            const key = completionKey(c.id, child.id, today)
            const comp = completions.get(key)
            return isChoreComplete(comp, c.require_checkoff, c.require_photo, c.require_approval)
          }).length

          const balance = getBalance(child.id)

          return (
            <div
              key={child.id}
              className={`rounded-xl border p-4 ${child.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
            >
              <div className="flex items-start justify-between">
                <MemberAvatar emoji={child.avatar_emoji} name={child.display_name} photoUrl={child.photo_url} active={child.is_active} size="sm" />
                {child.is_active && (
                  <LevelIndicator level={child.level} xp={child.xp} size="sm" />
                )}
              </div>
              {child.is_active ? (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StreakBadge streak={child.current_streak} size="sm" />
                    <PointsDisplay points={balance} size="sm" />
                  </div>
                  <div className="text-xs text-gray-500">
                    {doneCount} / {kidChores.length} chores today
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: kidChores.length > 0 ? `${(doneCount / kidChores.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-400">Away</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pending approvals */}
      {pendingApprovals.length > 0 && (
        <ApprovalQueue
          items={pendingApprovals}
          currentMemberId={member.id}
          familyId={family.id}
          date={today}
          onUpsert={upsertCompletion}
        />
      )}
    </div>
  )
}
