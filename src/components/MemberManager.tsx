'use client'

import { useState } from 'react'
import { Plus, UserMinus, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { FamilyMember } from '@/lib/types'

interface MemberManagerProps {
  familyId: string
  members: FamilyMember[]
  onUpdated: () => void
}

const AVATARS = ['👦', '👧', '👨', '👩', '🧒', '👶', '🧑', '😎', '🤠', '🦸', '🦹', '🧙']

export function MemberManager({ familyId, members, onUpdated }: MemberManagerProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [emoji, setEmoji] = useState('👦')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const children = members.filter(m => m.role === 'child')

  async function handleAddChild(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Just insert a profile record — no auth account needed for kids
    const { error: memErr } = await supabase
      .from('chores_family_members')
      .insert({
        family_id: familyId,
        user_id: null,
        display_name: name,
        role: 'child',
        avatar_emoji: emoji,
        pin: pin || null,
      })

    if (memErr) {
      setError(memErr.message)
      setSaving(false)
      return
    }

    setShowAdd(false)
    setName('')
    setPin('')
    setSaving(false)
    onUpdated()
  }

  async function toggleActive(member: FamilyMember) {
    await supabase
      .from('chores_family_members')
      .update({ is_active: !member.is_active })
      .eq('id', member.id)
    onUpdated()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Family Members</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-500 hover:bg-orange-50 rounded-lg"
        >
          <Plus size={14} /> Add Child
        </button>
      </div>

      <div className="space-y-2">
        {children.map(child => (
          <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">{child.avatar_emoji}</span>
              <div>
                <div className={`text-sm font-medium ${!child.is_active ? 'text-gray-400' : ''}`}>
                  {child.display_name}
                </div>
                {child.pin && <div className="text-xs text-gray-400">PIN set</div>}
                {!child.is_active && <div className="text-xs text-gray-400">Away</div>}
              </div>
            </div>
            <button
              onClick={() => toggleActive(child)}
              className={`p-2 rounded-lg text-xs ${
                child.is_active
                  ? 'text-gray-400 hover:bg-gray-200'
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title={child.is_active ? 'Mark as away' : 'Mark as active'}
            >
              {child.is_active ? <UserMinus size={16} /> : <UserCheck size={16} />}
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <form onSubmit={handleAddChild} className="mt-4 p-4 bg-orange-50 rounded-xl space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">PIN (4 digits, for quick login)</label>
            <input
              type="text"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setEmoji(a)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center ${
                    emoji === a ? 'bg-orange-200 ring-2 ring-orange-500' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Child'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
