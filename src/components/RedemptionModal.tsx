'use client'

import { X } from 'lucide-react'
import { PointsDisplay } from './PointsDisplay'
import type { Reward } from '@/lib/types'

interface RedemptionModalProps {
  reward: Reward
  balance: number
  onConfirm: () => void
  onClose: () => void
}

export function RedemptionModal({ reward, balance, onConfirm, onClose }: RedemptionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={20} />
        </button>

        <div className="text-5xl mb-3">{reward.emoji}</div>
        <h3 className="text-lg font-bold mb-1">{reward.name}</h3>
        <div className="mb-4">
          <PointsDisplay points={reward.point_cost} size="md" />
        </div>

        <p className="text-sm text-gray-500 mb-4">
          You have <strong>{balance}</strong> points. After redeeming you&apos;ll have{' '}
          <strong>{balance - reward.point_cost}</strong>.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
          >
            Redeem!
          </button>
        </div>
      </div>
    </div>
  )
}
