'use client'

import { levelProgress, xpForNextLevel } from '@/lib/gamification'

interface LevelIndicatorProps {
  level: number
  xp: number
  size?: 'sm' | 'md' | 'lg'
}

export function LevelIndicator({ level, xp, size = 'md' }: LevelIndicatorProps) {
  const progress = levelProgress(xp)
  const nextXP = xpForNextLevel(level)

  const dimensions = { sm: 40, md: 56, lg: 72 }
  const strokeWidth = { sm: 3, md: 4, lg: 5 }
  const fontSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' }
  const labelSize = { sm: 'text-[8px]', md: 'text-[10px]', lg: 'text-xs' }

  const dim = dimensions[size]
  const sw = strokeWidth[size]
  const radius = (dim - sw) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={dim} height={dim} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth={sw}
        />
        {/* Progress ring */}
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke="#f47b20" strokeWidth={sw}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {/* Level number centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold text-gray-800 ${fontSize[size]}`}>{level}</span>
        <span className={`text-gray-400 ${labelSize[size]}`}>LVL</span>
      </div>
    </div>
  )
}
