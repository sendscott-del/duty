'use client'

import type { Redemption, Reward } from '@/lib/types'

interface InventoryProps {
  items: Redemption[]
  rewards: Reward[]
}

export function Inventory({ items, rewards }: InventoryProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">🎒</div>
        <p className="text-sm text-gray-400">No items yet. Redeem rewards to fill your inventory!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(item => {
        const reward = rewards.find(r => r.id === item.reward_id)
        if (!reward) return null

        return (
          <div key={item.id} className="flex flex-col items-center p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-2xl mb-1">{reward.emoji}</span>
            <span className="text-[10px] text-gray-700 font-medium text-center leading-tight">{reward.name}</span>
            <span className="text-[9px] text-gray-400 mt-0.5">
              {new Date(item.redeemed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )
      })}
    </div>
  )
}
