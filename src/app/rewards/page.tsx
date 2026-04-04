'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ShopItemCard } from '@/components/ShopItemCard'
import { SavingsGoal } from '@/components/SavingsGoal'
import { Inventory } from '@/components/Inventory'
import { PendingRedemptions } from '@/components/PendingRedemptions'
import { RewardCard } from '@/components/RewardCard'
import { RewardForm } from '@/components/RewardForm'
import { RedemptionModal } from '@/components/RedemptionModal'
import { PointsDisplay } from '@/components/PointsDisplay'
import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { useRewardShop } from '@/lib/hooks/useRewardShop'
import type { Reward } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  treat: '🍦 Treats',
  screen_time: '📱 Screen Time',
  activity: '🎯 Activities',
  purchase: '🛍️ Purchases',
  privilege: '⭐ Privileges',
  general: '🎁 General',
}

const KID_TABS = ['Shop', 'Wishlist', 'My Stuff'] as const

export default function RewardsPage() {
  const { user, member, family, isParent, allMembers } = useFamilyMember()
  const shop = useRewardShop(family?.id, member?.id)
  const [showForm, setShowForm] = useState(false)
  const [editReward, setEditReward] = useState<Reward | undefined>()
  const [redeemTarget, setRedeemTarget] = useState<Reward | null>(null)
  const [kidTab, setKidTab] = useState<typeof KID_TABS[number]>('Shop')

  if (shop.loading || !family || !member || !user) {
    return <AppShell><div className="text-gray-400 text-sm text-center py-8">Loading...</div></AppShell>
  }

  const balance = shop.getBalance(member.id)

  // Parent view
  if (isParent) {
    return (
      <AppShell>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Rewards</h2>
            <button
              onClick={() => { setEditReward(undefined); setShowForm(true) }}
              className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20"
            >
              <Plus size={16} /> Add Reward
            </button>
          </div>

          {/* Pending redemptions */}
          <PendingRedemptions
            redemptions={shop.pendingRedemptions}
            rewards={shop.rewards}
            members={allMembers}
            onUpdateStatus={shop.updateRedemptionStatus}
          />

          {/* All rewards */}
          {shop.rewards.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No rewards yet. Add some to motivate the crew!
            </div>
          ) : (
            <div className="space-y-3">
              {shop.rewards.map(reward => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  balance={balance}
                  onRedeem={() => setRedeemTarget(reward)}
                  isParent={true}
                  onEdit={() => { setEditReward(reward); setShowForm(true) }}
                />
              ))}
            </div>
          )}
        </div>

        {showForm && (
          <RewardForm
            familyId={family.id}
            userId={user.id}
            reward={editReward}
            onSaved={() => { setShowForm(false); shop.refresh() }}
            onClose={() => setShowForm(false)}
          />
        )}

        {redeemTarget && (
          <RedemptionModal
            reward={redeemTarget}
            balance={balance}
            onConfirm={async () => {
              await shop.redeemReward(redeemTarget.id, member.id)
              setRedeemTarget(null)
            }}
            onClose={() => setRedeemTarget(null)}
          />
        )}
      </AppShell>
    )
  }

  // Kid view — Shop / Wishlist / My Stuff
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Rewards</h2>
          <PointsDisplay points={balance} size="lg" />
        </div>

        {/* Savings goal */}
        {shop.savingGoalReward && (
          <SavingsGoal reward={shop.savingGoalReward} balance={balance} avgDailyXP={shop.avgDailyXP} />
        )}

        {/* Tab bar */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {KID_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setKidTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                kidTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Shop tab */}
        {kidTab === 'Shop' && (
          <div className="space-y-5">
            {Object.entries(shop.rewardsByCategory).map(([cat, rewards]) => (
              <div key={cat}>
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  {CATEGORY_LABELS[cat] || cat}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {rewards.map(reward => (
                    <ShopItemCard
                      key={reward.id}
                      reward={reward}
                      balance={balance}
                      isWishlisted={shop.isWishlisted(reward.id)}
                      onRedeem={() => setRedeemTarget(reward)}
                      onToggleWishlist={() => {
                        if (shop.isWishlisted(reward.id)) shop.removeFromWishlist(reward.id)
                        else shop.addToWishlist(reward.id)
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
            {shop.rewards.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No rewards in the shop yet. Check back soon!
              </div>
            )}
          </div>
        )}

        {/* Wishlist tab */}
        {kidTab === 'Wishlist' && (
          <div className="space-y-3">
            {shop.wishlist.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">💝</div>
                <p className="text-sm text-gray-400">Tap the heart on any reward to add it here!</p>
              </div>
            ) : (
              shop.wishlist.map(w => {
                const reward = shop.rewards.find(r => r.id === w.reward_id)
                if (!reward) return null
                const progress = Math.min(100, (balance / reward.point_cost) * 100)
                const remaining = Math.max(0, reward.point_cost - balance)

                return (
                  <div key={w.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-2xl">{reward.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{reward.name}</div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                        <div className="bg-orange-400 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {remaining === 0 ? 'Ready to redeem!' : `${remaining} more points`}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <PointsDisplay points={reward.point_cost} size="sm" />
                      <button
                        onClick={() => shop.setSavingGoal(reward.id)}
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                          w.priority === 1
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-orange-100'
                        }`}
                      >
                        {w.priority === 1 ? 'Goal!' : 'Set goal'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* My Stuff (Inventory) tab */}
        {kidTab === 'My Stuff' && (
          <Inventory items={shop.inventory} rewards={shop.rewards} />
        )}
      </div>

      {redeemTarget && (
        <RedemptionModal
          reward={redeemTarget}
          balance={balance}
          onConfirm={async () => {
            await shop.redeemReward(redeemTarget.id, member.id)
            setRedeemTarget(null)
          }}
          onClose={() => setRedeemTarget(null)}
        />
      )}
    </AppShell>
  )
}
