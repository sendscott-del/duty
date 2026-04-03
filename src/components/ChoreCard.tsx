'use client'

import { useState } from 'react'
import { Check, Camera, ThumbsUp, ThumbsDown, Clock } from 'lucide-react'
import { PointsDisplay } from './PointsDisplay'
import { PhotoUpload } from './PhotoUpload'
import type { Chore, Completion, FamilyMember } from '@/lib/types'
import { isChoreComplete } from '@/lib/points'

interface ChoreCardProps {
  chore: Chore
  completion: Completion | undefined
  member: FamilyMember | undefined
  currentMemberId: string
  isParent: boolean
  familyId: string
  date: string
  onUpsert: (choreId: string, memberId: string, date: string, updates: Partial<Completion>) => Promise<void>
}

export function ChoreCard({
  chore,
  completion,
  member,
  currentMemberId,
  isParent,
  familyId,
  date,
  onUpsert,
}: ChoreCardProps) {
  const [showPhoto, setShowPhoto] = useState(false)

  const isAssignedToMe = chore.assigned_to === currentMemberId
  const memberId = chore.assigned_to || currentMemberId
  const done = isChoreComplete(completion, chore.require_checkoff, chore.require_photo, chore.require_approval)

  const handleCheckOff = async () => {
    if (!isAssignedToMe && !isParent) return
    const newChecked = !completion?.checked_off
    const updates: Partial<Completion> = {
      checked_off: newChecked,
      checked_off_at: newChecked ? new Date().toISOString() : null,
    }

    // If checkoff is the only requirement, award points
    if (newChecked && !chore.require_photo && !chore.require_approval) {
      updates.points_awarded = chore.points
    } else if (!newChecked) {
      updates.points_awarded = 0
    }

    await onUpsert(chore.id, memberId, date, updates)
  }

  const handlePhotoUploaded = async (url: string) => {
    const updates: Partial<Completion> = {
      photo_url: url,
      photo_uploaded_at: new Date().toISOString(),
    }

    // Check if all requirements now met
    const wouldBeChecked = completion?.checked_off || !chore.require_checkoff
    const wouldBeApproved = completion?.approved === true || !chore.require_approval
    if (wouldBeChecked && wouldBeApproved) {
      updates.points_awarded = chore.points
    }

    await onUpsert(chore.id, memberId, date, updates)
    setShowPhoto(false)
  }

  const handleApprove = async (approved: boolean) => {
    const updates: Partial<Completion> = {
      approved,
      approved_by: currentMemberId,
      approved_at: new Date().toISOString(),
    }

    // Check if all requirements now met
    const wouldBeChecked = completion?.checked_off || !chore.require_checkoff
    const hasPhoto = !!completion?.photo_url || !chore.require_photo
    if (approved && wouldBeChecked && hasPhoto) {
      updates.points_awarded = chore.points
    } else if (!approved) {
      updates.points_awarded = 0
    }

    await onUpsert(chore.id, memberId, date, updates)
  }

  return (
    <div className={`rounded-2xl p-4 transition-all ${done ? 'bg-green-50 border border-green-200/60 shadow-sm' : 'bg-white border border-gray-100 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`font-semibold tracking-tight ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {chore.name}
        </div>
        <PointsDisplay points={chore.points} size="sm" />
      </div>

      {chore.description && (
        <p className="text-xs text-gray-500 mb-3">{chore.description}</p>
      )}

      {member && (
        <div className="text-xs text-gray-400 mb-3">
          Assigned to {member.avatar_emoji} {member.display_name}
        </div>
      )}

      {/* Verification actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Check-off */}
        {chore.require_checkoff && (
          <button
            onClick={handleCheckOff}
            disabled={!isAssignedToMe && !isParent}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              completion?.checked_off
                ? 'bg-green-100 text-green-700 shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <Check size={14} />
            {completion?.checked_off ? 'Done' : 'Mark Done'}
          </button>
        )}

        {/* Photo */}
        {chore.require_photo && (
          <>
            {completion?.photo_url ? (
              <a
                href={completion.photo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700"
              >
                <Camera size={14} />
                View Photo
              </a>
            ) : (
              <button
                onClick={() => setShowPhoto(true)}
                disabled={!isAssignedToMe && !isParent}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Camera size={14} />
                Add Photo
              </button>
            )}
          </>
        )}

        {/* Approval */}
        {chore.require_approval && (
          <>
            {completion?.approved === true && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                <ThumbsUp size={14} /> Approved
              </span>
            )}
            {completion?.approved === false && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                <ThumbsDown size={14} /> Rejected
              </span>
            )}
            {completion?.approved === null || (completion?.approved === undefined && chore.require_approval) ? (
              isParent ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleApprove(true)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => handleApprove(false)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-700">
                  <Clock size={14} /> Awaiting Approval
                </span>
              )
            ) : null}
          </>
        )}
      </div>

      {/* Photo upload modal */}
      {showPhoto && (
        <div className="mt-3">
          <PhotoUpload
            familyId={familyId}
            choreId={chore.id}
            memberId={memberId}
            date={date}
            onUploaded={handlePhotoUploaded}
            onCancel={() => setShowPhoto(false)}
          />
        </div>
      )}
    </div>
  )
}
