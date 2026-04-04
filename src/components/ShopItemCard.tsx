'use client'

import { Heart, ShoppingBag } from 'lucide-react'
import { PointsDisplay } from './PointsDisplay'
import type { Reward } from '@/lib/types'

interface ShopItemCardProps {
  reward: Reward
  balance: number
  isWishlisted: boolean
  onRedeem: () => void
  onToggleWishlist: () => void
}

export function ShopItemCard({ reward, balance, isWishlisted, onRedeem, onToggleWishlist }: ShopItemCardProps) {
  const canAfford = balance >= reward.point_cost
  const remaining = Math.max(0, reward.point_cost - balance)
  const progress = Math.min(100, (balance / reward.point_cost) * 100)
  const soldOut = reward.is_limited && reward.stock !== null && reward.stock <= 0

  return (
    <div className={`rounded-2xl bg-white border border-gray-100 p-4 shadow-sm ${soldOut ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{reward.emoji}</span>
          <div>
            <div className="font-semibold text-gray-900 tracking-tight text-sm">{reward.name}</div>
            {reward.description && <p className="text-[11px] text-gray-500 mt-0.5">{reward.description}</p>}
          </div>
        </div>
        <button
          onClick={onToggleWishlist}
          className={`p-1.5 rounded-full transition-colors ${
            isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
          }`}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Price + progress */}
      <div className="flex items-center justify-between mb-2">
        <PointsDisplay points={reward.point_cost} size="sm" />
        {reward.is_limited && (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
            soldOut ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-red-600'
          }`}>
            {soldOut ? 'Sold Out' : `${reward.stock} left`}
          </span>
        )}
      </div>

      {/* Mini progress bar if not affordable */}
      {!canAfford && !soldOut && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
          <div className="bg-orange-400 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <button
        onClick={onRedeem}
        disabled={!canAfford || soldOut}
        className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
          soldOut
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : canAfford
            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-500/20'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
      >
        {soldOut ? 'Sold Out' : canAfford ? 'Redeem!' : `${remaining} more to go`}
      </button>
    </div>
  )
}
