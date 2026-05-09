'use client'

import { useState, useRef } from 'react'
import { Plus, UserMinus, UserCheck, Camera, KeyRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { FamilyMember } from '@/lib/types'

interface MemberManagerProps {
  familyId: string
  members: FamilyMember[]
  onUpdated: () => void
}

const AVATARS = ['👦', '👧', '👨', '👩', '🧒', '👶', '🧑', '😎', '🤠', '🦸', '🦹', '🧙']

async function provisionKidAuth(memberId: string): Promise<string | null> {
  const { error } = await supabase.functions.invoke('kid-provision-auth', {
    body: { member_id: memberId },
  })
  return error ? error.message : null
}

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

    const { data: inserted, error: memErr } = await supabase
      .from('chores_family_members')
      .insert({
        family_id: familyId,
        user_id: null,
        display_name: name,
        role: 'child',
        avatar_emoji: emoji,
        pin: pin || null,
      })
      .select('id')
      .single()

    if (memErr || !inserted) {
      setError(memErr?.message ?? 'Failed to add child')
      setSaving(false)
      return
    }

    if (pin) {
      const provErr = await provisionKidAuth(inserted.id)
      if (provErr) {
        setError(`Added, but PIN login setup failed: ${provErr}`)
        setSaving(false)
        onUpdated()
        return
      }
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
          <MemberRow key={child.id} member={child} familyId={familyId} onToggleActive={() => toggleActive(child)} onUpdated={onUpdated} />
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
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">PIN (4 digits, for quick login)</label>
            <input
              type="text"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
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

function MemberRow({ member, familyId, onToggleActive, onUpdated }: {
  member: FamilyMember
  familyId: string
  onToggleActive: () => void
  onUpdated: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [editingPin, setEditingPin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [savingPin, setSavingPin] = useState(false)
  const [pinError, setPinError] = useState('')

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${familyId}/profiles/${member.id}.${ext}`

    const { error } = await supabase.storage
      .from('chore-photos')
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data: urlData } = supabase.storage.from('chore-photos').getPublicUrl(path)
      await supabase
        .from('chores_family_members')
        .update({ photo_url: urlData.publicUrl + '?t=' + Date.now() })
        .eq('id', member.id)
      onUpdated()
    }
    setUploading(false)
  }

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPin(true)
    setPinError('')

    const cleaned = newPin.trim()
    const pinValue = cleaned.length === 0 ? null : cleaned

    const { error } = await supabase
      .from('chores_family_members')
      .update({ pin: pinValue, pin_attempts: 0, pin_locked_until: null })
      .eq('id', member.id)

    if (error) {
      setPinError(error.message)
      setSavingPin(false)
      return
    }

    if (pinValue && !member.user_id) {
      const provErr = await provisionKidAuth(member.id)
      if (provErr) {
        setPinError(`PIN saved, but login setup failed: ${provErr}`)
        setSavingPin(false)
        onUpdated()
        return
      }
    }

    setEditingPin(false)
    setNewPin('')
    setSavingPin(false)
    onUpdated()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative"
            title="Change photo"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.display_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{member.avatar_emoji}</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
              <Camera size={8} className="text-white" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </button>
          <div>
            <div className={`text-sm font-medium ${!member.is_active ? 'text-gray-400' : ''}`}>
              {member.display_name}
            </div>
            <div className="flex items-center gap-1.5">
              {member.pin && member.user_id && <span className="text-[10px] text-green-600 font-medium">PIN login ready</span>}
              {member.pin && !member.user_id && <span className="text-[10px] text-amber-600 font-medium">PIN set (login pending)</span>}
              {!member.pin && <span className="text-[10px] text-gray-400">No PIN</span>}
              {!member.is_active && <span className="text-[10px] text-gray-400">· Away</span>}
              {uploading && <span className="text-[10px] text-orange-500">· Uploading</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditingPin(!editingPin); setNewPin(''); setPinError('') }}
            className="p-2 rounded-lg text-xs text-gray-400 hover:text-orange-500 hover:bg-orange-50"
            title={member.pin ? 'Change PIN' : 'Set PIN'}
          >
            <KeyRound size={16} />
          </button>
          <button
            onClick={onToggleActive}
            className={`p-2 rounded-lg text-xs ${
              member.is_active
                ? 'text-gray-400 hover:bg-gray-100'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={member.is_active ? 'Mark as away' : 'Mark as active'}
          >
            {member.is_active ? <UserMinus size={16} /> : <UserCheck size={16} />}
          </button>
        </div>
      </div>

      {editingPin && (
        <form onSubmit={handleSavePin} className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            {member.pin ? 'Change PIN' : 'Set PIN'} (4 digits, blank to remove)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            autoFocus
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
            placeholder={member.pin ? '••••' : '4 digits'}
          />
          {pinError && <p className="text-red-600 text-xs">{pinError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setEditingPin(false); setNewPin(''); setPinError('') }}
              className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingPin}
              className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
            >
              {savingPin ? 'Saving...' : 'Save PIN'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
