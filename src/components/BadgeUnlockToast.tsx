'use client'

import { useEffect } from 'react'
import type { Badge } from '@/lib/types'

interface BadgeUnlockToastProps {
  badge: Badge
  onDismiss: () => void
}

export function BadgeUnlockToast({ badge, onDismiss }: BadgeUnlockToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg flex items-center gap-3 max-w-sm mx-auto">
        <span className="text-3xl animate-bounce">{badge.emoji}</span>
        <div>
          <div className="text-xs font-medium text-amber-600 uppercase tracking-wide">Badge Unlocked!</div>
          <div className="font-bold text-gray-900">{badge.name}</div>
          <div className="text-xs text-gray-500">{badge.description}</div>
        </div>
      </div>
    </div>
  )
}
