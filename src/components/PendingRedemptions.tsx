'use client'

import { useState } from 'react'
import { Check, X, Package } from 'lucide-react'
import type { Redemption, Reward, FamilyMember } from '@/lib/types'

interface PendingRedemptionsProps {
  redemptions: Redemption[]
  rewards: Reward[]
  members: FamilyMember[]
  onUpdateStatus: (id: string, status: string, note?: string) => Promise<void>
}

export function PendingRedemptions({ redemptions, rewards, members, onUpdateStatus }: PendingRedemptionsProps) {
  if (redemptions.length === 0) return null

  return (
    <div>
      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Pending Redemptions</div>
      <div className="space-y-2">
        {redemptions.map(r => {
          const reward = rewards.find(rw => rw.id === r.reward_id)
          const kid = members.find(m => m.id === r.member_id)
          if (!reward) return null

          return (
            <div key={r.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200/60">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{reward.emoji}</span>
                <div>
                  <div className="text-sm font-medium text-gray-800">{reward.name}</div>
                  <div className="text-xs text-gray-500">
                    {kid?.avatar_emoji} {kid?.display_name} · {reward.point_cost} pts
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onUpdateStatus(r.id, 'approved')}
                  className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                  title="Approve"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => onUpdateStatus(r.id, 'fulfilled')}
                  className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                  title="Mark fulfilled"
                >
                  <Package size={16} />
                </button>
                <button
                  onClick={() => onUpdateStatus(r.id, 'denied')}
                  className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                  title="Deny"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
