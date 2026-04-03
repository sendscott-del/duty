'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Reward, Redemption, Completion } from '@/lib/types'
import { calculateBalance } from '@/lib/points'

export function useRewards(familyId: string | undefined) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!familyId) return

    const [rewardsRes, redemptionsRes, completionsRes] = await Promise.all([
      supabase
        .from('chores_rewards')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true),
      supabase
        .from('chores_redemptions')
        .select('*'),
      supabase
        .from('chores_completions')
        .select('*')
    ])

    if (rewardsRes.data) setRewards(rewardsRes.data as Reward[])
    if (redemptionsRes.data) setRedemptions(redemptionsRes.data as Redemption[])
    if (completionsRes.data) setCompletions(completionsRes.data as Completion[])

    setLoading(false)
  }, [familyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getBalance = (memberId: string) => calculateBalance(completions, redemptions, memberId)

  const redeemReward = async (rewardId: string, memberId: string) => {
    const reward = rewards.find(r => r.id === rewardId)
    if (!reward) return

    const balance = getBalance(memberId)
    if (balance < reward.point_cost) return

    const { error } = await supabase
      .from('chores_redemptions')
      .insert({
        reward_id: rewardId,
        member_id: memberId,
        points_spent: reward.point_cost,
      })

    if (!error) {
      await fetchData()
    }
  }

  return { rewards, redemptions, completions, loading, refresh: fetchData, getBalance, redeemReward }
}
