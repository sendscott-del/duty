'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { REWARD_PRESETS } from '@/constants/presets'
import type { Reward } from '@/lib/types'

interface RewardFormProps {
  familyId: string
  userId: string
  reward?: Reward
  onSaved: () => void
  onClose: () => void
}

const EMOJI_CATEGORIES: Record<string, string[]> = {
  'Food & Treats': ['🍕', '🍦', '🍪', '🍩', '🧁', '🍫', '🍿', '🥤', '🍔', '🌮', '🍰', '🧇'],
  'Activities': ['🎬', '🎮', '🏖️', '🎳', '🎪', '⛷️', '🎢', '🏊', '🚴', '⚽', '🎯', '🛝'],
  'Screen Time': ['📱', '💻', '🎮', '📺', '🕹️', '🎧'],
  'Shopping': ['🛍️', '👟', '👕', '🧸', '📚', '🎁', '💵', '💳', '🛒'],
  'Special': ['⭐', '🌟', '🏆', '👑', '🎉', '🦄', '🐶', '🎨', '🚗', '✈️', '🏠', '❤️'],
}

export function RewardForm({ familyId, userId, reward, onSaved, onClose }: RewardFormProps) {
  const [name, setName] = useState(reward?.name || '')
  const [description, setDescription] = useState(reward?.description || '')
  const [pointCost, setPointCost] = useState(reward?.point_cost ?? 10)
  const [emoji, setEmoji] = useState(reward?.emoji || '🎁')
  const [category, setCategory] = useState(reward?.category || 'general')
  const [isLimited, setIsLimited] = useState(reward?.is_limited ?? false)
  const [stock, setStock] = useState(reward?.stock ?? 5)
  const [showPresets, setShowPresets] = useState(!reward)
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
      category,
      is_limited: isLimited,
      stock: isLimited ? stock : null,
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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold tracking-tight">{reward ? 'Edit Reward' : 'New Reward'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Preset picker for new rewards */}
        {showPresets && !reward && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Quick add from suggestions</span>
              <button onClick={() => setShowPresets(false)} className="text-xs text-orange-500 font-medium">Custom reward</button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(
                REWARD_PRESETS.reduce((acc, p) => {
                  if (!acc[p.category]) acc[p.category] = []
                  acc[p.category].push(p)
                  return acc
                }, {} as Record<string, typeof REWARD_PRESETS>)
              ).map(([cat, presets]) => (
                <div key={cat}>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{cat}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map(p => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => { setName(p.name); setEmoji(p.emoji); setPointCost(p.points); setShowPresets(false) }}
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
              placeholder="e.g., Movie night"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Point Cost</label>
            <input
              type="number"
              min={1}
              value={pointCost}
              onChange={e => setPointCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                <div key={category}>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{category}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {emojis.map(e => (
                      <button
                        key={`${category}-${e}`}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                          emoji === e ? 'bg-orange-100 ring-2 ring-orange-500 scale-110' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as typeof category)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
            >
              <option value="general">General</option>
              <option value="treat">Treats</option>
              <option value="screen_time">Screen Time</option>
              <option value="activity">Activities</option>
              <option value="purchase">Purchases</option>
              <option value="privilege">Privileges</option>
            </select>
          </div>

          {/* Limited stock */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isLimited}
              onChange={e => setIsLimited(e.target.checked)}
              className="rounded accent-orange-500"
            />
            Limited quantity
          </label>
          {isLimited && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                min={1}
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm shadow-orange-500/20"
          >
            {saving ? 'Saving...' : reward ? 'Update Reward' : 'Create Reward'}
          </button>
        </form>
      </div>
    </div>
  )
}
