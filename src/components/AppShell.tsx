'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { LayoutDashboard, ListChecks, Gift, Clock, Settings, LogOut, FileText } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, member, family, isParent, allMembers, loading, signOut, switchProfile } = useFamilyMember()
  const [showMenu, setShowMenu] = useState(false)
  const [showProfilePicker, setShowProfilePicker] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) return null

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
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header — clean, minimal */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Duty" className="h-9 w-9 rounded-xl shadow-sm" />
          <span className="text-lg font-semibold tracking-tight text-gray-900">Duty</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Profile switcher */}
          <button
            onClick={() => setShowProfilePicker(!showProfilePicker)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="text-sm">{member.avatar_emoji}</span>
            <span className="text-sm font-medium text-gray-700">{member.display_name}</span>
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Profile picker dropdown */}
      {showProfilePicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowProfilePicker(false)} />
          <div className="fixed right-4 top-14 z-50 bg-white rounded-2xl shadow-xl border border-gray-200/60 py-2 min-w-[200px] overflow-hidden">
            <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Switch Profile</div>
            {allMembers.filter(m => m.is_active).map(m => (
              <button
                key={m.id}
                onClick={() => {
                  switchProfile(m)
                  setShowProfilePicker(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                  m.id === member.id ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-lg">{m.avatar_emoji}</span>
                <span className="flex-1">{m.display_name}</span>
                {m.role === 'parent' && <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">Parent</span>}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Settings menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="fixed right-4 top-14 z-50 bg-white rounded-2xl shadow-xl border border-gray-200/60 py-1 min-w-[180px] overflow-hidden">
            {isParent && (
              <button
                onClick={() => { router.push('/settings'); setShowMenu(false) }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
              >
                <Settings size={16} className="text-gray-400" /> Settings
              </button>
            )}
            <button
              onClick={() => { router.push('/release-notes'); setShowMenu(false) }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
            >
              <FileText size={16} className="text-gray-400" /> Release Notes
            </button>
            <button
              onClick={async () => { await signOut(); router.push('/login') }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-3 text-red-500 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </>
      )}

      {/* Content */}
      <main className="px-5 py-5 max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom nav — iOS-style tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-gray-200/60 pb-[env(safe-area-inset-bottom)]">
        <div className="flex max-w-lg mx-auto">
          {tabs.map(tab => {
            const active = pathname === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`flex-1 flex flex-col items-center pt-2 pb-1.5 transition-colors ${
                  active ? 'text-orange-500' : 'text-gray-400 hover:text-gray-500'
                }`}
              >
                <tab.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                <span className={`text-[10px] mt-0.5 ${active ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

// Setup flow
function SetupFamily({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [familyName, setFamilyName] = useState('Shurtliff Family')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { supabase } = await import('@/lib/supabase')

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
    <div className="min-h-screen flex items-center justify-center px-5 bg-[#f8f9fa]">
      <div className="w-full max-w-sm">
        <img src="/logo.png" alt="Duty" className="h-24 w-24 mx-auto mb-4 rounded-3xl shadow-lg" />
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Welcome to Duty</h1>
        <p className="text-gray-500 text-center text-sm mb-8">Set up your family to get started</p>

        <form onSubmit={handleSetup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Family Name</label>
            <input
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              placeholder="Dad, Mom, etc."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm shadow-orange-500/20"
          >
            {saving ? 'Setting up...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  )
}
