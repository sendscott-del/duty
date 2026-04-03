'use client'

import { useEffect } from 'react'

interface LevelUpModalProps {
  level: number
  onClose: () => void
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl p-8 text-center max-w-xs w-full animate-scale-up">
        {/* Emoji confetti */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {['🎉', '⭐', '🔥', '💪', '🎊', '✨'].map((e, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-confetti"
              style={{
                left: `${15 + i * 14}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {e}
            </span>
          ))}
        </div>

        <div className="text-6xl font-black text-orange-500 mb-2">{level}</div>
        <div className="text-xl font-bold text-gray-900 mb-1">Level Up!</div>
        <p className="text-sm text-gray-500">
          {level <= 3 && "You're just getting started!"}
          {level > 3 && level <= 7 && "Looking good! Keep it up!"}
          {level > 7 && level <= 15 && "Seriously impressive work!"}
          {level > 15 && "You're a total legend!"}
        </p>
      </div>
    </div>
  )
}
