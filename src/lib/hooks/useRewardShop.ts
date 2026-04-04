'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Reward, Redemption, Completion, WishlistItem } from '@/lib/types'
import { calculateBalance } from '@/lib/points'

export function useRewardShop(familyId: string | undefined, memberId: string | undefined) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!familyId) return

    const [rewardsRes, redemptionsRes, completionsRes, wishlistRes] = await Promise.all([
      supabase.from('chores_rewards').select('*').eq('family_id', familyId).eq('is_active', true),
      supabase.from('chores_redemptions').select('*'),
      supabase.from('chores_completions').select('*'),
      memberId
        ? supabase.from('chores_wishlists').select('*').eq('member_id', memberId)
        : Promise.resolve({ data: [] }),
    ])

    if (rewardsRes.data) setRewards(rewardsRes.data as Reward[])
    if (redemptionsRes.data) setRedemptions(redemptionsRes.data as Redemption[])
    if (completionsRes.data) setCompletions(completionsRes.data as Completion[])
    if (wishlistRes.data) setWishlist(wishlistRes.data as WishlistItem[])

    setLoading(false)
  }, [familyId, memberId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getBalance = (mId: string) => calculateBalance(completions, redemptions, mId)

  // Wishlist
  const addToWishlist = async (rewardId: string) => {
    if (!memberId) return
    await supabase.from('chores_wishlists').insert({ member_id: memberId, reward_id: rewardId })
    await fetchData()
  }

  const removeFromWishlist = async (rewardId: string) => {
    if (!memberId) return
    await supabase.from('chores_wishlists').delete().eq('member_id', memberId).eq('reward_id', rewardId)
    await fetchData()
  }

  const setSavingGoal = async (rewardId: string) => {
    if (!memberId) return
    // Reset all priorities to 0, set this one to 1
    await supabase.from('chores_wishlists').update({ priority: 0 }).eq('member_id', memberId)
    await supabase.from('chores_wishlists').update({ priority: 1 }).eq('member_id', memberId).eq('reward_id', rewardId)
    await fetchData()
  }

  const isWishlisted = (rewardId: string) => wishlist.some(w => w.reward_id === rewardId)

  const savingGoal = wishlist.find(w => w.priority === 1)
  const savingGoalReward = savingGoal ? rewards.find(r => r.id === savingGoal.reward_id) : null

  // Redemptions
  const redeemReward = async (rewardId: string, mId: string) => {
    const reward = rewards.find(r => r.id === rewardId)
    if (!reward) return

    const balance = getBalance(mId)
    if (balance < reward.point_cost) return

    await supabase.from('chores_redemptions').insert({
      reward_id: rewardId,
      member_id: mId,
      points_spent: reward.point_cost,
      status: 'pending',
    })

    // Decrement stock if limited
    if (reward.is_limited && reward.stock !== null) {
      await supabase.from('chores_rewards').update({ stock: reward.stock - 1 }).eq('id', rewardId)
    }

    await fetchData()
  }

  const updateRedemptionStatus = async (redemptionId: string, status: string, note?: string) => {
    const updates: Record<string, any> = { status }
    if (note) updates.parent_note = note
    if (status === 'fulfilled') {
      updates.fulfilled = true
      updates.fulfilled_at = new Date().toISOString()
    }
    await supabase.from('chores_redemptions').update(updates).eq('id', redemptionId)
    await fetchData()
  }

  // Inventory: fulfilled redemptions
  const inventory = redemptions.filter(r => r.status === 'fulfilled' && (!memberId || r.member_id === memberId))

  // Pending redemptions (for parent approval)
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending')

  // Rewards by category
  const rewardsByCategory = rewards.reduce((acc, r) => {
    const cat = r.category || 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {} as Record<string, Reward[]>)

  // Average daily XP for savings estimate
  const memberCompletions = completions.filter(c => c.member_id === memberId && c.points_awarded > 0)
  const avgDailyXP = memberCompletions.length > 0
    ? memberCompletions.reduce((s, c) => s + c.points_awarded, 0) / Math.max(7, memberCompletions.length)
    : 0

  return {
    rewards,
    rewardsByCategory,
    wishlist,
    savingGoal,
    savingGoalReward,
    redemptions,
    pendingRedemptions,
    inventory,
    loading,
    getBalance,
    addToWishlist,
    removeFromWishlist,
    setSavingGoal,
    isWishlisted,
    redeemReward,
    updateRedemptionStatus,
    avgDailyXP,
    refresh: fetchData,
  }
}
