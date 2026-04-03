'use client'

import { useState } from 'react'
import type { Badge, MemberBadge } from '@/lib/types'

interface BadgeCaseProps {
  badges: Badge[]
  earnedBadges: MemberBadge[]
  compact?: boolean
}

export function BadgeCase({ badges, earnedBadges, compact = false }: BadgeCaseProps) {
  const [selected, setSelected] = useState<Badge | null>(null)
  const earnedSlugs = new Set(earnedBadges.map(b => b.badge_slug))

  return (
    <div>
      <div className={`grid ${compact ? 'grid-cols-6 gap-2' : 'grid-cols-4 gap-3'}`}>
        {badges.map(badge => {
          const earned = earnedSlugs.has(badge.slug)
          const earnedAt = earnedBadges.find(b => b.badge_slug === badge.slug)?.earned_at

          return (
            <button
              key={badge.slug}
              onClick={() => setSelected(earned ? badge : null)}
              className={`flex flex-col items-center ${compact ? 'p-1' : 'p-2'} rounded-xl transition ${
                earned
                  ? 'bg-amber-50 hover:bg-amber-100'
                  : 'bg-gray-50 opacity-40'
              }`}
            >
              <span className={compact ? 'text-xl' : 'text-2xl'}>{earned ? badge.emoji : '❓'}</span>
              {!compact && (
                <span className={`text-[10px] mt-1 text-center leading-tight ${
                  earned ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {earned ? badge.name : '???'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Badge detail popover */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelected(null)} />
          <div className="fixed inset-x-4 bottom-20 z-50 bg-white rounded-2xl shadow-lg border p-4 max-w-sm mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selected.emoji}</span>
              <div>
                <div className="font-bold text-gray-900">{selected.name}</div>
                <div className="text-sm text-gray-500">{selected.description}</div>
                {earnedBadges.find(b => b.badge_slug === selected.slug) && (
                  <div className="text-xs text-gray-400 mt-1">
                    Earned {new Date(earnedBadges.find(b => b.badge_slug === selected.slug)!.earned_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
