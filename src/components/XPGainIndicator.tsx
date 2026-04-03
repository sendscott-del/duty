'use client'

import { useEffect, useState } from 'react'

interface XPGainIndicatorProps {
  amount: number
  onDone: () => void
}

export function XPGainIndicator({ amount, onDone }: XPGainIndicatorProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1200)
    return () => clearTimeout(timer)
  }, [onDone])

  if (amount <= 0) return null

  return (
    <span className="inline-block text-sm font-bold text-orange-500 animate-float-up">
      +{amount} XP
    </span>
  )
}
