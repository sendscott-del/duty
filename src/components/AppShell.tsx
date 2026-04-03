'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { LayoutDashboard, ListChecks, Gift, Clock, Settings, LogOut } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, member, family, isParent, loading, signOut } = useFamilyMember()
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  // If user has no family member record yet, show setup prompt
  if (!member) {
    return <SetupFamily userId={user.id} onComplete={() => window.location.reload()} />
  }

  const parentTabs = [
    { path: '/', icon: LayoutDashboard, label: 'Home' },
    { path: '/chores', icon: ListChecks, label: 'Chores' },
    { path: '/rewards', icon: Gift, label: 'Rewards' },
    { path: '/history', icon: Clock, label: 'History' },
  ]

  const childTabs = [
    { path: '/', icon: ListChecks, label: 'My Chores' },
    { path: '/rewards', icon: Gift, label: 'Rewards' },
    { path: '/history', icon: Clock, label: 'History' },
  ]

  const tabs = isParent ? parentTabs : childTabs

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-purple-700 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">💩 Duty</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80">{member.display_name}</span>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-sm opacity-80 hover:opacity-100"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="fixed right-2 top-12 z-50 bg-white rounded-lg shadow-lg border py-1 min-w-[160px]">
            {isParent && (
              <button
                onClick={() => { router.push('/settings'); setShowMenu(false) }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings size={16} /> Settings
              </button>
            )}
            <button
              onClick={async () => { await signOut(); router.push('/login') }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </>
      )}

      {/* Content */}
      <main className="px-4 py-4">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t flex">
        {tabs.map(tab => {
          const active = pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 text-xs ${
                active ? 'text-purple-700 font-medium' : 'text-gray-400'
              }`}
            >
              <tab.icon size={20} />
              <span className="mt-0.5">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// Inline setup component for first-time users
function SetupFamily({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [familyName, setFamilyName] = useState('Shurtliff Family')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { supabase } = await import('@/lib/supabase')

    // Create family
    const { data: family, error: famErr } = await supabase
      .from('chores_families')
      .insert({ name: familyName })
      .select()
      .single()

    if (famErr || !family) {
      alert('Error creating family: ' + famErr?.message)
      setSaving(false)
      return
    }

    // Add self as parent
    const { error: memErr } = await supabase
      .from('chores_family_members')
      .insert({
        family_id: family.id,
        user_id: userId,
        display_name: displayName,
        role: 'parent',
        avatar_emoji: '👨',
      })

    if (memErr) {
      alert('Error adding member: ' + memErr.message)
      setSaving(false)
      return
    }

    onComplete()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-purple-700 text-center mb-2">💩 Duty</h1>
        <p className="text-gray-500 text-center text-sm mb-8">Set up your family</p>

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
            <input
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              placeholder="Dad, Mom, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Setting up...' : 'Create Family'}
          </button>
        </form>
      </div>
    </div>
  )
}
