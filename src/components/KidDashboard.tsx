'use client'

import { useState } from 'react'
import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { useChoresData } from '@/lib/hooks/useChoresData'
import { useRewards } from '@/lib/hooks/useRewards'
import { useGamification } from '@/lib/hooks/useGamification'
import { useChallenges } from '@/lib/hooks/useChallenges'
import { ChoreList } from './ChoreList'
import { PointsDisplay } from './PointsDisplay'
import { StreakBadge } from './StreakBadge'
import { LevelIndicator } from './LevelIndicator'
import { BadgeCase } from './BadgeCase'
import { BadgeUnlockToast } from './BadgeUnlockToast'
import { LevelUpModal } from './LevelUpModal'
import { WeeklyChallenge } from './WeeklyChallenge'
import { DayNavigator } from './DayNavigator'
import { todayStr, isDueToday, formatDisplay, completionKey } from '@/lib/dates'
import { format, isToday, getDay } from 'date-fns'
import { isChoreComplete } from '@/lib/points'
import type { Completion } from '@/lib/types'

interface KidDashboardProps {
  memberId: string
}

export function KidDashboard({ memberId }: KidDashboardProps) {
  const { family, member, isParent, allMembers } = useFamilyMember()
  const { chores, completions, members, loading, upsertCompletion } = useChoresData(family?.id)
  const { getBalance } = useRewards(family?.id)
  const { badges, earnedBadges, newlyEarned, dismissBadge, awardXP, updateStreak, checkBadges, awardCleanSweep } = useGamification(family?.id, memberId)
  const { challenge } = useChallenges(family?.id)
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const [showBadges, setShowBadges] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())

  if (loading || !family || !member) {
    return <div className="text-gray-400 text-sm text-center py-8">Loading...</div>
  }

  const dateStr = format(viewDate, 'yyyy-MM-dd')
  const viewingToday = isToday(viewDate)
  const balance = getBalance(memberId)
  const currentMember = allMembers.find(m => m.id === memberId) || member

  // Filter chores due on the viewed date
  const isDueOnDate = (frequency: string, dayOfWeek: number | null) => {
    if (frequency === 'daily') return true
    if (frequency === 'weekly' && dayOfWeek !== null) return getDay(viewDate) === dayOfWeek
    return frequency === 'weekly'
  }

  const myChores = chores.filter(c =>
    c.assigned_to === memberId && isDueOnDate(c.frequency, c.day_of_week)
  )

  const doneCount = myChores.filter(c => {
    const key = completionKey(c.id, memberId, dateStr)
    return isChoreComplete(completions.get(key), c.require_checkoff, c.require_photo, c.require_approval)
  }).length

  const allDone = myChores.length > 0 && doneCount === myChores.length

  // Wrapper that triggers gamification after completion
  const handleUpsert = async (choreId: string, mId: string, date: string, updates: Partial<Completion>) => {
    await upsertCompletion(choreId, mId, date, updates)

    if (updates.points_awarded && updates.points_awarded > 0 && currentMember) {
      const { newXP, newLevel, leveledUp } = await awardXP(currentMember, updates.points_awarded)
      if (leveledUp) setLevelUp(newLevel)

      const allCompletions = Array.from(completions.values()).filter(c => c.member_id === memberId)
      const completionCount = allCompletions.filter(c => c.points_awarded > 0).length + 1
      const photoCount = allCompletions.filter(c => c.photo_url).length + (updates.photo_url ? 1 : 0)

      await checkBadges(currentMember, completionCount, photoCount, currentMember.current_streak, newXP)

      // Check if all chores done today → streak + clean sweep
      const updatedDone = myChores.filter(c => {
        if (c.id === choreId) return true
        const key = completionKey(c.id, memberId, dateStr)
        return isChoreComplete(completions.get(key), c.require_checkoff, c.require_photo, c.require_approval)
      }).length

      if (updatedDone === myChores.length && myChores.length > 0) {
        await updateStreak(currentMember, date)
        await awardCleanSweep(currentMember)
      }
    }
  }

  const challengeProgress = challenge?.goal_type === 'family_completions'
    ? Array.from(completions.values()).filter(c => c.points_awarded > 0).length
    : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LevelIndicator level={currentMember.level} xp={currentMember.xp} size="md" />
          <div>
            <h2 className="text-xl font-bold tracking-tight">My Chores</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <StreakBadge streak={currentMember.current_streak} size="sm" />
            </div>
          </div>
        </div>
        <PointsDisplay points={balance} size="lg" />
      </div>

      {/* Day navigation */}
      <div className="flex justify-center">
        <DayNavigator date={viewDate} onDateChange={setViewDate} />
      </div>

      {/* Progress bar */}
      {myChores.length > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{doneCount} of {myChores.length} done</span>
            {allDone && <span className="text-green-600 font-medium">All done!</span>}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${myChores.length > 0 ? (doneCount / myChores.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Weekly challenge */}
      {challenge && (
        <WeeklyChallenge challenge={challenge} progress={challengeProgress} isParent={false} />
      )}

      {/* Chore list */}
      <ChoreList
        chores={myChores}
        completions={completions}
        members={members}
        currentMemberId={memberId}
        isParent={isParent}
        familyId={family.id}
        date={dateStr}
        onUpsert={handleUpsert}
      />

      {/* Badge case toggle */}
      <button
        onClick={() => setShowBadges(!showBadges)}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
      >
        {showBadges ? 'Hide Badges' : `Badges (${earnedBadges.length}/${badges.length})`}
      </button>
      {showBadges && <BadgeCase badges={badges} earnedBadges={earnedBadges} />}

      {/* Notifications */}
      {newlyEarned.length > 0 && (
        <BadgeUnlockToast badge={newlyEarned[0].badge} onDismiss={dismissBadge} />
      )}
      {levelUp && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />}
    </div>
  )
}
