'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Reward } from '@/lib/types'

interface RewardFormProps {
  familyId: string
  userId: string
  reward?: Reward
  onSaved: () => void
  onClose: () => void
}

const EMOJIS = ['🎮', '🍕', '🎬', '📱', '🍦', '🎁', '⭐', '🏖️', '🛍️', '💵', '🎯', '🎪']

export function RewardForm({ familyId, userId, reward, onSaved, onClose }: RewardFormProps) {
  const [name, setName] = useState(reward?.name || '')
  const [description, setDescription] = useState(reward?.description || '')
  const [pointCost, setPointCost] = useState(reward?.point_cost ?? 10)
  const [emoji, setEmoji] = useState(reward?.emoji || '🎁')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const record = {
      family_id: familyId,
      name,
      description: description || null,
      point_cost: pointCost,
      emoji,
      created_by: userId,
    }

    if (reward) {
      await supabase.from('chores_rewards').update(record).eq('id', reward.id)
    } else {
      await supabase.from('chores_rewards').insert(record)
    }

    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{reward ? 'Edit Reward' : 'New Reward'}</h2>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Movie night"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Point Cost</label>
            <input
              type="number"
              min={1}
              value={pointCost}
              onChange={e => setPointCost(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center ${
                    emoji === e ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : reward ? 'Update Reward' : 'Create Reward'}
          </button>
        </form>
      </div>
    </div>
  )
}
