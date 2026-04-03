'use client'

import { PointsDisplay } from './PointsDisplay'
import type { Reward } from '@/lib/types'

interface RewardCardProps {
  reward: Reward
  balance: number
  onRedeem: () => void
  isParent: boolean
  onEdit?: () => void
}

export function RewardCard({ reward, balance, onRedeem, isParent, onEdit }: RewardCardProps) {
  const canAfford = balance >= reward.point_cost

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{reward.emoji}</span>
          <div>
            <div className="font-medium text-gray-900">{reward.name}</div>
            {reward.description && (
              <p className="text-xs text-gray-500 mt-0.5">{reward.description}</p>
            )}
          </div>
        </div>
        <PointsDisplay points={reward.point_cost} size="sm" />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={onRedeem}
          disabled={!canAfford}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            canAfford
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canAfford ? 'Redeem' : `Need ${reward.point_cost - balance} more`}
        </button>
        {isParent && onEdit && (
          <button
            onClick={onEdit}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}
