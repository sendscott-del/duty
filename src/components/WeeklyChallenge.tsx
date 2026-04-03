'use client'

import { Target, Trophy, Plus } from 'lucide-react'
import type { Challenge } from '@/lib/types'

interface WeeklyChallengeProps {
  challenge: Challenge | null
  progress: number
  isParent: boolean
  onGenerate?: () => void
}

export function WeeklyChallenge({ challenge, progress, isParent, onGenerate }: WeeklyChallengeProps) {
  if (!challenge && !isParent) return null

  if (!challenge) {
    return (
      <button
        onClick={onGenerate}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-blue-200 text-blue-500 text-sm font-medium hover:bg-blue-50 transition"
      >
        <Plus size={16} /> Start a Weekly Challenge
      </button>
    )
  }

  const progressPct = challenge.goal_value > 0
    ? Math.min(100, (progress / challenge.goal_value) * 100)
    : challenge.completed ? 100 : 0

  return (
    <div className={`rounded-xl p-4 ${challenge.completed ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        {challenge.completed ? <Trophy size={16} className="text-green-600" /> : <Target size={16} className="text-blue-600" />}
        <span className={`text-sm font-semibold ${challenge.completed ? 'text-green-700' : 'text-blue-700'}`}>
          Weekly Challenge
        </span>
        {challenge.completed && (
          <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium ml-auto">
            Complete! +{challenge.bonus_points} pts
          </span>
        )}
      </div>
      <div className="text-sm font-medium text-gray-800 mb-1">{challenge.title}</div>
      <div className="text-xs text-gray-500 mb-2">{challenge.description}</div>

      {!challenge.completed && (
        <>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-xs text-blue-600 font-medium">
            {progress} / {challenge.goal_value} · {challenge.bonus_points} bonus pts
          </div>
        </>
      )}
    </div>
  )
}
