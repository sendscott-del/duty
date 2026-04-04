'use client'

import { Star } from 'lucide-react'
import type { Reward } from '@/lib/types'

interface SavingsGoalProps {
  reward: Reward
  balance: number
  avgDailyXP: number
}

export function SavingsGoal({ reward, balance, avgDailyXP }: SavingsGoalProps) {
  const progress = Math.min(100, (balance / reward.point_cost) * 100)
  const remaining = Math.max(0, reward.point_cost - balance)
  const daysLeft = avgDailyXP > 0 ? Math.ceil(remaining / avgDailyXP) : null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 p-4 shadow-sm">
      <div className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-2">Saving For</div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{reward.emoji}</span>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 tracking-tight">{reward.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Star size={10} fill="currentColor" className="text-amber-500" />
            {balance} of {reward.point_cost} points
          </div>
        </div>
      </div>

      {/* Progress thermometer */}
      <div className="w-full bg-orange-200/50 rounded-full h-3 mb-2">
        <div
          className="bg-gradient-to-r from-orange-400 to-amber-400 h-3 rounded-full transition-all relative"
          style={{ width: `${progress}%` }}
        >
          {progress > 15 && (
            <span className="absolute right-1.5 top-0 text-[9px] font-bold text-white leading-3">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        {remaining === 0 ? (
          <span className="text-green-600 font-semibold">You can redeem this now!</span>
        ) : daysLeft ? (
          <span>{remaining} more points — about {daysLeft} {daysLeft === 1 ? 'day' : 'days'} to go!</span>
        ) : (
          <span>{remaining} more points to go</span>
        )}
      </div>
    </div>
  )
}
