'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Delete } from 'lucide-react'

interface PinFace {
  id: string
  display_name: string
  avatar_emoji: string
  photo_url: string | null
}

interface PinLoginProps {
  familyId: string
  onSignedIn: () => void
  onSwitchToEmail: () => void
}

export function PinLogin({ familyId, onSignedIn, onSwitchToEmail }: PinLoginProps) {
  const [faces, setFaces] = useState<PinFace[]>([])
  const [selected, setSelected] = useState<PinFace | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchFaces() {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('kid-list-faces', {
        body: { family_id: familyId },
      })
      if (cancelled) return
      if (error) {
        setError('Could not load profiles')
      } else {
        setFaces((data?.faces ?? []) as PinFace[])
      }
      setLoading(false)
    }
    fetchFaces()
    return () => { cancelled = true }
  }, [familyId])

  const handleDigit = async (digit: string) => {
    if (verifying || pin.length >= 4 || !selected) return
    const newPin = pin + digit
    setPin(newPin)
    setError('')

    if (newPin.length === 4) {
      setVerifying(true)
      const { data, error: fnErr } = await supabase.functions.invoke('kid-pin-login', {
        body: { member_id: selected.id, pin: newPin },
      })

      if (fnErr || !data?.token_hash) {
        const code = (data as { error?: string } | null)?.error
        const attemptsLeft = (data as { attempts_left?: number } | null)?.attempts_left
        if (code === 'locked') {
          setError('Too many tries. Wait 5 minutes and try again.')
        } else if (code === 'wrong_pin') {
          setError(typeof attemptsLeft === 'number' ? `Wrong PIN — ${attemptsLeft} tries left` : 'Wrong PIN')
        } else if (code === 'not_provisioned') {
          setError('Ask a parent to finish setting up your login')
        } else {
          setError('Login failed — try again')
        }
        setPin('')
        setVerifying(false)
        return
      }

      const { error: otpErr } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: 'magiclink',
      })

      if (otpErr) {
        setError('Login failed — try again')
        setPin('')
        setVerifying(false)
        return
      }

      onSignedIn()
    }
  }

  const handleDelete = () => {
    if (verifying) return
    setPin(pin.slice(0, -1))
    setError('')
  }

  if (loading) {
    return <div className="text-gray-400 text-center py-8 text-sm">Loading profiles...</div>
  }

  if (faces.length === 0) {
    return (
      <div className="text-center py-6 space-y-3">
        <p className="text-sm text-gray-500">No kid profiles with PIN login yet</p>
        <button
          onClick={onSwitchToEmail}
          className="text-sm text-orange-500 font-medium hover:underline"
        >
          Use email login
        </button>
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-center text-gray-800">Who are you?</h3>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {faces.map(f => (
            <button
              key={f.id}
              onClick={() => { setSelected(f); setPin(''); setError('') }}
              className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition"
            >
              {f.photo_url ? (
                <img src={f.photo_url} alt="" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <span className="text-4xl">{f.avatar_emoji}</span>
              )}
              <span className="text-sm font-medium text-gray-700">{f.display_name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onSwitchToEmail}
          className="block mx-auto text-sm text-orange-500 hover:underline"
        >
          Parent? Use email instead
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xs mx-auto">
      <button
        onClick={() => { setSelected(null); setPin(''); setError('') }}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="text-center">
        {selected.photo_url ? (
          <img src={selected.photo_url} alt="" className="w-16 h-16 rounded-full object-cover mx-auto" />
        ) : (
          <span className="text-5xl">{selected.avatar_emoji}</span>
        )}
        <h3 className="text-lg font-bold mt-2">{selected.display_name}</h3>
        <p className="text-sm text-gray-500 mt-1">Enter your PIN</p>
      </div>

      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-orange-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      {verifying && !error && <p className="text-gray-400 text-sm text-center">Signing in...</p>}

      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, idx) => (
          <button
            key={key || `empty-${idx}`}
            onClick={() => {
              if (key === 'del') handleDelete()
              else if (key) handleDigit(key)
            }}
            disabled={!key || verifying}
            className={`h-14 rounded-xl text-xl font-medium ${
              key === 'del'
                ? 'text-gray-500 hover:bg-gray-100'
                : key
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                : ''
            } disabled:opacity-50 ${!key ? 'invisible' : ''}`}
          >
            {key === 'del' ? <Delete size={20} className="mx-auto" /> : key}
          </button>
        ))}
      </div>
    </div>
  )
}
