'use client'

import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  if (streak === 0) return null

  const styles = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-1 gap-1',
    lg: 'text-lg px-3 py-1.5 gap-1.5 font-bold',
  }

  const iconSizes = { sm: 12, md: 14, lg: 20 }

  return (
    <span className={`inline-flex items-center bg-orange-100 text-orange-600 rounded-full ${styles[size]} ${streak > 0 ? 'animate-pulse-once' : ''}`}>
      <Flame size={iconSizes[size]} fill="currentColor" />
      {streak}
    </span>
  )
}
