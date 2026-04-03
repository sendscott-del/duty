'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateLevel } from '@/lib/gamification'
import type { Badge, MemberBadge, FamilyMember, Completion } from '@/lib/types'

interface NewBadge {
  badge: Badge
  justEarned: boolean
}

export function useGamification(familyId: string | undefined, memberId: string | undefined) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [earnedBadges, setEarnedBadges] = useState<MemberBadge[]>([])
  const [newlyEarned, setNewlyEarned] = useState<NewBadge[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!familyId || !memberId) return

    const [badgesRes, earnedRes] = await Promise.all([
      supabase.from('chores_badges').select('*').order('sort_order'),
      supabase.from('chores_member_badges').select('*').eq('member_id', memberId),
    ])

    if (badgesRes.data) setBadges(badgesRes.data as Badge[])
    if (earnedRes.data) setEarnedBadges(earnedRes.data as MemberBadge[])

    setLoading(false)
  }, [familyId, memberId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Award XP and update level
  const awardXP = async (member: FamilyMember, amount: number) => {
    const newXP = member.xp + amount
    const newLevel = calculateLevel(newXP)
    const leveledUp = newLevel > member.level

    await supabase
      .from('chores_family_members')
      .update({ xp: newXP, level: newLevel })
      .eq('id', member.id)

    return { newXP, newLevel, leveledUp }
  }

  // Check and update streak after all chores are done for the day
  const updateStreak = async (member: FamilyMember, date: string) => {
    const lastDone = member.last_all_done_date
    let newStreak = 1

    if (lastDone) {
      const lastDate = new Date(lastDone)
      const today = new Date(date)
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Consecutive day
        newStreak = member.current_streak + 1
      } else if (diffDays === 0) {
        // Same day, no change
        return { newStreak: member.current_streak, streakIncreased: false }
      }
      // diffDays > 1 means gap, streak resets to 1
    }

    const newLongest = Math.max(newStreak, member.longest_streak)

    await supabase
      .from('chores_family_members')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_all_done_date: date,
      })
      .eq('id', member.id)

    return { newStreak, streakIncreased: newStreak > member.current_streak }
  }

  // Check badge eligibility and award new badges
  const checkBadges = async (
    member: FamilyMember,
    completionCount: number,
    photoCount: number,
    streak: number,
    xp: number
  ) => {
    const earned = new Set(earnedBadges.map(b => b.badge_slug))
    const toAward: string[] = []

    for (const badge of badges) {
      if (earned.has(badge.slug)) continue

      let qualifies = false

      switch (badge.slug) {
        case 'first-duty':
          qualifies = completionCount >= 1
          break
        case 'streak-3':
        case 'streak-7':
        case 'streak-14':
        case 'streak-30':
          qualifies = badge.threshold !== null && streak >= badge.threshold
          break
        case 'photo-5':
          qualifies = badge.threshold !== null && photoCount >= badge.threshold
          break
        case 'points-100':
        case 'points-500':
          qualifies = badge.threshold !== null && xp >= badge.threshold
          break
        case 'clean-sweep':
          // Checked externally when all daily chores are complete
          qualifies = false // handled by caller
          break
      }

      if (qualifies) {
        toAward.push(badge.slug)
      }
    }

    if (toAward.length === 0) return []

    // Insert new badges
    const records = toAward.map(slug => ({
      member_id: member.id,
      badge_slug: slug,
    }))

    await supabase.from('chores_member_badges').insert(records)

    const newBadges = toAward
      .map(slug => badges.find(b => b.slug === slug))
      .filter(Boolean) as Badge[]

    const newlyEarnedList = newBadges.map(badge => ({ badge, justEarned: true }))
    setNewlyEarned(prev => [...prev, ...newlyEarnedList])

    // Refresh earned badges
    await fetchData()

    return newBadges
  }

  // Award the clean-sweep badge specifically
  const awardCleanSweep = async (member: FamilyMember) => {
    const earned = new Set(earnedBadges.map(b => b.badge_slug))
    if (earned.has('clean-sweep')) return null

    await supabase.from('chores_member_badges').insert({
      member_id: member.id,
      badge_slug: 'clean-sweep',
    })

    const badge = badges.find(b => b.slug === 'clean-sweep')
    if (badge) {
      setNewlyEarned(prev => [...prev, { badge, justEarned: true }])
    }
    await fetchData()
    return badge
  }

  // Dismiss a newly earned badge notification
  const dismissBadge = () => {
    setNewlyEarned(prev => prev.slice(1))
  }

  const hasBadge = (slug: string) => earnedBadges.some(b => b.badge_slug === slug)

  return {
    badges,
    earnedBadges,
    newlyEarned,
    loading,
    awardXP,
    updateStreak,
    checkBadges,
    awardCleanSweep,
    dismissBadge,
    hasBadge,
    refresh: fetchData,
  }
}
