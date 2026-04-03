'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Delete } from 'lucide-react'

interface PinMember {
  id: string
  display_name: string
  avatar_emoji: string
  pin: string
  // We need the email/password to sign in — stored in parent's session or fetched
}

interface PinLoginProps {
  onSignedIn: () => void
  onSwitchToEmail: () => void
}

export function PinLogin({ onSignedIn, onSwitchToEmail }: PinLoginProps) {
  const [members, setMembers] = useState<PinMember[]>([])
  const [selected, setSelected] = useState<PinMember | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch family members with PINs (public-ish query for login screen)
    async function fetchMembers() {
      const { data } = await supabase
        .from('chores_family_members')
        .select('id, display_name, avatar_emoji, pin')
        .not('pin', 'is', null)

      if (data) {
        setMembers(data as PinMember[])
      }
      setLoading(false)
    }
    fetchMembers()
  }, [])

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return
    const newPin = pin + digit
    setPin(newPin)
    setError('')

    if (newPin.length === 4 && selected) {
      // Verify PIN
      if (newPin === selected.pin) {
        // PIN matches — but we need credentials to actually sign in
        // For now, show success. Full implementation needs stored credentials or RPC.
        setError('')
        // The PIN login flow requires the parent to have set up email/password for the child.
        // We'll attempt to sign in using the convention: the child's auth email
        onSignedIn()
      } else {
        setError('Wrong PIN')
        setPin('')
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading...</div>
  }

  if (members.length === 0) {
    return null // No PIN members, don't show this option
  }

  // Face picker
  if (!selected) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-center text-gray-800">Who are you?</h3>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
            >
              <span className="text-4xl">{m.avatar_emoji}</span>
              <span className="text-sm font-medium text-gray-700">{m.display_name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onSwitchToEmail}
          className="block mx-auto text-sm text-purple-600 hover:underline"
        >
          Use email instead
        </button>
      </div>
    )
  }

  // PIN entry
  return (
    <div className="space-y-6 max-w-xs mx-auto">
      <button
        onClick={() => { setSelected(null); setPin(''); setError('') }}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="text-center">
        <span className="text-5xl">{selected.avatar_emoji}</span>
        <h3 className="text-lg font-bold mt-2">{selected.display_name}</h3>
        <p className="text-sm text-gray-500 mt-1">Enter your PIN</p>
      </div>

      {/* PIN dots */}
      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${
              i < pin.length ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(key => (
          <button
            key={key || 'empty'}
            onClick={() => {
              if (key === 'del') handleDelete()
              else if (key) handleDigit(key)
            }}
            disabled={!key}
            className={`h-14 rounded-xl text-xl font-medium ${
              key === 'del'
                ? 'text-gray-500 hover:bg-gray-100'
                : key
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                : ''
            } disabled:invisible`}
          >
            {key === 'del' ? <Delete size={20} className="mx-auto" /> : key}
          </button>
        ))}
      </div>
    </div>
  )
}
