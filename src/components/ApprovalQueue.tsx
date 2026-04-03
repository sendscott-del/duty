'use client'

import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { Chore, Completion, FamilyMember } from '@/lib/types'

interface ApprovalItem {
  chore: Chore
  completion: Completion
  member: FamilyMember | undefined
}

interface ApprovalQueueProps {
  items: ApprovalItem[]
  currentMemberId: string
  familyId: string
  date: string
  onUpsert: (choreId: string, memberId: string, date: string, updates: Partial<Completion>) => Promise<void>
}

export function ApprovalQueue({ items, currentMemberId, familyId, date, onUpsert }: ApprovalQueueProps) {
  const handleApprove = async (item: ApprovalItem, approved: boolean) => {
    const updates: Partial<Completion> = {
      approved,
      approved_by: currentMemberId,
      approved_at: new Date().toISOString(),
    }

    if (approved) {
      const hasPhoto = !!item.completion.photo_url || !item.chore.require_photo
      const isChecked = item.completion.checked_off || !item.chore.require_checkoff
      if (hasPhoto && isChecked) {
        updates.points_awarded = item.chore.points
      }
    } else {
      updates.points_awarded = 0
    }

    await onUpsert(item.chore.id, item.completion.member_id, date, updates)
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Pending Approvals</h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.completion.id || `${item.chore.id}-${item.completion.member_id}`} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div>
              <div className="text-sm font-medium">{item.chore.name}</div>
              <div className="text-xs text-gray-500">
                {item.member?.avatar_emoji} {item.member?.display_name}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(item, true)}
                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                <ThumbsUp size={16} />
              </button>
              <button
                onClick={() => handleApprove(item, false)}
                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <ThumbsDown size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
