'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CHORE_PRESETS } from '@/constants/presets'
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
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(() => {
    if (!chore?.day_of_week) return []
    if (Array.isArray(chore.day_of_week)) return chore.day_of_week
    return [chore.day_of_week]
  })
  const [assignedTo, setAssignedTo] = useState<string>(chore?.assigned_to || '')
  const [requireCheckoff, setRequireCheckoff] = useState(chore?.require_checkoff ?? true)
  const [requirePhoto, setRequirePhoto] = useState(chore?.require_photo ?? false)
  const [requireApproval, setRequireApproval] = useState(chore?.require_approval ?? false)
  const [saving, setSaving] = useState(false)
  const [showPresets, setShowPresets] = useState(!chore)

  const activeChildren = members.filter(m => m.role === 'child' && m.is_active)

  const applyPreset = (preset: typeof CHORE_PRESETS[0]) => {
    setName(preset.name)
    setPoints(preset.points)
    setFrequency(preset.frequency)
    setShowPresets(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const record = {
      family_id: familyId,
      name,
      description: description || null,
      points,
      frequency,
      day_of_week: frequency === 'weekly' && daysOfWeek.length > 0 ? daysOfWeek : null,
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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold tracking-tight">{chore ? 'Edit Chore' : 'New Chore'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Preset picker for new chores */}
        {showPresets && !chore && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Quick add from suggestions</span>
              <button onClick={() => setShowPresets(false)} className="text-xs text-orange-500 font-medium">Custom chore</button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(
                CHORE_PRESETS.reduce((acc, p) => {
                  if (!acc[p.category]) acc[p.category] = []
                  acc[p.category].push(p)
                  return acc
                }, {} as Record<string, typeof CHORE_PRESETS>)
              ).map(([cat, presets]) => (
                <div key={cat}>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{cat}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map(p => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
                      >
                        <span>{p.emoji}</span> {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
              placeholder="e.g., Take out trash"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
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
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as 'daily' | 'weekly')}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Which days?</label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day, i) => {
                  const selected = daysOfWeek.includes(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (selected) setDaysOfWeek(daysOfWeek.filter(d => d !== i))
                        else setDaysOfWeek([...daysOfWeek, i])
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selected
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  )
                })}
              </div>
              {daysOfWeek.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">No days selected = any day this week</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
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
                  className="rounded accent-orange-500"
                />
                Check-off (kid marks it done)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={requirePhoto}
                  onChange={e => setRequirePhoto(e.target.checked)}
                  className="rounded accent-orange-500"
                />
                Photo proof
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={e => setRequireApproval(e.target.checked)}
                  className="rounded accent-orange-500"
                />
                Parental approval
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm shadow-orange-500/20"
          >
            {saving ? 'Saving...' : chore ? 'Update Chore' : 'Create Chore'}
          </button>
        </form>
      </div>
    </div>
  )
}
