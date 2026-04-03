'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Chore, FamilyMember } from '@/lib/types'

interface ChoreFormProps {
  familyId: string
  userId: string
  members: FamilyMember[]
  chore?: Chore
  onSaved: () => void
  onClose: () => void
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function ChoreForm({ familyId, userId, members, chore, onSaved, onClose }: ChoreFormProps) {
  const [name, setName] = useState(chore?.name || '')
  const [description, setDescription] = useState(chore?.description || '')
  const [points, setPoints] = useState(chore?.points ?? 1)
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(chore?.frequency || 'daily')
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(chore?.day_of_week ?? null)
  const [assignedTo, setAssignedTo] = useState<string>(chore?.assigned_to || '')
  const [requireCheckoff, setRequireCheckoff] = useState(chore?.require_checkoff ?? true)
  const [requirePhoto, setRequirePhoto] = useState(chore?.require_photo ?? false)
  const [requireApproval, setRequireApproval] = useState(chore?.require_approval ?? false)
  const [saving, setSaving] = useState(false)

  const activeChildren = members.filter(m => m.role === 'child' && m.is_active)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const record = {
      family_id: familyId,
      name,
      description: description || null,
      points,
      frequency,
      day_of_week: frequency === 'weekly' ? dayOfWeek : null,
      assigned_to: assignedTo || null,
      require_checkoff: requireCheckoff,
      require_photo: requirePhoto,
      require_approval: requireApproval,
      created_by: userId,
      updated_at: new Date().toISOString(),
    }

    if (chore) {
      await supabase.from('chores_chores').update(record).eq('id', chore.id)
    } else {
      await supabase.from('chores_chores').insert(record)
    }

    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{chore ? 'Edit Chore' : 'New Chore'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Take out trash"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Any extra details"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                min={1}
                max={100}
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as 'daily' | 'weekly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                value={dayOfWeek ?? ''}
                onChange={e => setDayOfWeek(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Any day this week</option>
                {DAYS.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Unassigned</option>
              {activeChildren.map(m => (
                <option key={m.id} value={m.id}>{m.avatar_emoji} {m.display_name}</option>
              ))}
            </select>
          </div>

          {/* Verification toggles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={requireCheckoff}
                  onChange={e => setRequireCheckoff(e.target.checked)}
                  className="rounded accent-purple-600"
                />
                Check-off (kid marks it done)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={requirePhoto}
                  onChange={e => setRequirePhoto(e.target.checked)}
                  className="rounded accent-purple-600"
                />
                Photo proof
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={e => setRequireApproval(e.target.checked)}
                  className="rounded accent-purple-600"
                />
                Parental approval
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : chore ? 'Update Chore' : 'Create Chore'}
          </button>
        </form>
      </div>
    </div>
  )
}
