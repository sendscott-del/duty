'use client'

import { Star } from 'lucide-react'

interface PointsDisplayProps {
  points: number
  size?: 'sm' | 'md' | 'lg'
}

export function PointsDisplay({ points, size = 'md' }: PointsDisplayProps) {
  const styles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1',
    lg: 'text-lg px-3.5 py-1.5 gap-1.5 font-bold',
  }

  const iconSizes = { sm: 11, md: 13, lg: 18 }

  return (
    <span className={`inline-flex items-center bg-amber-50 text-amber-600 rounded-full font-semibold ${styles[size]}`}>
      <Star size={iconSizes[size]} fill="currentColor" />
      {points}
    </span>
  )
}
