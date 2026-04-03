'use client'

import { useState } from 'react'
import { Target, Trophy, Plus, RefreshCw } from 'lucide-react'
import { CHALLENGE_TEMPLATES } from '@/lib/gamification'
import type { Challenge } from '@/lib/types'

interface WeeklyChallengeProps {
  challenge: Challenge | null
  progress: number
  isParent: boolean
  onGenerate?: () => void
  onSelectTemplate?: (index: number) => void
  onChangeChallenge?: () => void
}

export function WeeklyChallenge({ challenge, progress, isParent, onGenerate, onSelectTemplate, onChangeChallenge }: WeeklyChallengeProps) {
  const [showPicker, setShowPicker] = useState(false)

  if (!challenge && !isParent) return null

  // Challenge picker for parent
  if (!challenge || showPicker) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
        <div className="text-sm font-semibold text-blue-700">Pick a Weekly Challenge</div>
        <div className="space-y-2">
          {CHALLENGE_TEMPLATES.map((t, i) => (
            <button
              key={i}
              onClick={() => {
                onSelectTemplate?.(i)
                setShowPicker(false)
              }}
              className="w-full text-left p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors"
            >
              <div className="text-sm font-semibold text-gray-800">{t.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {t.description.replace('{goal}', String(t.goal_value))} · +{t.bonus_points} bonus pts
              </div>
            </button>
          ))}
        </div>
        {showPicker && (
          <button
            onClick={() => setShowPicker(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    )
  }

  const progressPct = challenge.goal_value > 0
    ? Math.min(100, (progress / challenge.goal_value) * 100)
    : challenge.completed ? 100 : 0

  return (
    <div className={`rounded-2xl p-4 ${challenge.completed ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
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
        {isParent && !challenge.completed && (
          <button
            onClick={() => setShowPicker(true)}
            className="ml-auto p-1 text-blue-400 hover:text-blue-600 transition-colors"
            title="Change challenge"
          >
            <RefreshCw size={14} />
          </button>
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
