'use client'

import { useEffect, useState } from 'react'
import { Copy, Pencil, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Family } from '@/lib/types'

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 41)
}

interface FamilyLinkCardProps {
  family: Family & { slug?: string | null }
  onUpdated: () => void
}

export function FamilyLinkCard({ family, onUpdated }: FamilyLinkCardProps) {
  const [origin, setOrigin] = useState('')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  const currentSlug = family.slug ?? ''
  const familyUrl = currentSlug ? `${origin}/f/${currentSlug}` : ''

  const handleCopy = async () => {
    if (!familyUrl) return
    try {
      await navigator.clipboard.writeText(familyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const startEdit = () => {
    setDraft(currentSlug)
    setError('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft('')
    setError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const next = draft.trim().toLowerCase()
    if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(next)) {
      setError('1–41 characters, lowercase letters/numbers/dashes, must start with a letter or number.')
      return
    }
    if (next === currentSlug) {
      setEditing(false)
      return
    }
    setSaving(true)
    const { data, error: rpcErr } = await supabase.rpc('chores_change_family_slug', { p_new_slug: next })
    setSaving(false)

    if (rpcErr) {
      setError(rpcErr.message)
      return
    }
    const code = (data as { error?: string } | null)?.error
    if (code === 'slug_taken') { setError(`The link /f/${next} is already taken.`); return }
    if (code === 'invalid_slug') { setError('That link format is invalid.'); return }
    if (code === 'not_a_parent') { setError('Only parents can change the family link.'); return }
    if (code === 'unauthenticated') { setError('Please sign in again.'); return }
    if (code) { setError(code); return }

    setEditing(false)
    setDraft('')
    onUpdated()
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-sm font-medium text-gray-700">Family Link</div>
        {!editing && currentSlug && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-500 hover:bg-orange-50 rounded-lg"
          >
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>

      {!editing ? (
        <>
          {currentSlug ? (
            <>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-gray-800 break-all font-mono">{familyUrl}</code>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Kids open this URL once and Add to Home Screen. Change it any time — old links keep working.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">No family link set yet.</p>
              <button
                onClick={startEdit}
                className="mt-2 text-sm text-orange-500 font-medium hover:underline"
              >
                Set a family link
              </button>
            </>
          )}
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex items-stretch border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-500/40 focus-within:border-orange-400 transition-shadow">
            <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 font-mono">/f/</span>
            <input
              value={draft}
              onChange={e => setDraft(slugify(e.target.value))}
              autoFocus
              maxLength={41}
              className="flex-1 px-3 py-2 text-sm font-mono focus:outline-none placeholder:text-gray-400"
              placeholder="smith"
            />
          </div>
          <p className="text-xs text-gray-500">
            New URL: <span className="font-mono">{origin}/f/{draft || '...'}</span>
          </p>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
