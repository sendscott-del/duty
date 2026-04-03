'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { RewardCard } from '@/components/RewardCard'
import { RewardForm } from '@/components/RewardForm'
import { RedemptionModal } from '@/components/RedemptionModal'
import { PointsDisplay } from '@/components/PointsDisplay'
import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { useRewards } from '@/lib/hooks/useRewards'
import type { Reward } from '@/lib/types'

export default function RewardsPage() {
  const { user, member, family, isParent } = useFamilyMember()
  const { rewards, loading, refresh, getBalance, redeemReward } = useRewards(family?.id)
  const [showForm, setShowForm] = useState(false)
  const [editReward, setEditReward] = useState<Reward | undefined>()
  const [redeemTarget, setRedeemTarget] = useState<Reward | null>(null)

  if (loading || !family || !member || !user) {
    return <AppShell><div className="text-gray-400 text-sm text-center py-8">Loading...</div></AppShell>
  }

  const balance = getBalance(member.id)

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Rewards</h2>
          <div className="flex items-center gap-3">
            {!isParent && <PointsDisplay points={balance} size="lg" />}
            {isParent && (
              <button
                onClick={() => { setEditReward(undefined); setShowForm(true) }}
                className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                <Plus size={16} /> Add Reward
              </button>
            )}
          </div>
        </div>

        {rewards.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No rewards yet. {isParent ? 'Add some to motivate the crew!' : 'Check back soon!'}
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map(reward => (
              <RewardCard
                key={reward.id}
                reward={reward}
                balance={balance}
                onRedeem={() => setRedeemTarget(reward)}
                isParent={isParent}
                onEdit={isParent ? () => { setEditReward(reward); setShowForm(true) } : undefined}
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
          onSaved={() => { setShowForm(false); refresh() }}
          onClose={() => setShowForm(false)}
        />
      )}

      {redeemTarget && (
        <RedemptionModal
          reward={redeemTarget}
          balance={balance}
          onConfirm={async () => {
            await redeemReward(redeemTarget.id, member.id)
            setRedeemTarget(null)
          }}
          onClose={() => setRedeemTarget(null)}
        />
      )}
    </AppShell>
  )
}
