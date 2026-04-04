'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import type { Family, FamilyMember } from '@/lib/types'

const ACTIVE_PROFILE_KEY = 'duty_active_profile_id'

// Shared reactive store for active profile ID so all hook instances stay in sync
let listeners: (() => void)[] = []
function getActiveProfileId() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_PROFILE_KEY)
}
function setActiveProfileIdStore(id: string) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id)
  listeners.forEach(l => l())
}
function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => { listeners = listeners.filter(l => l !== listener) }
}

export function useFamilyMember() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [parentMember, setParentMember] = useState<FamilyMember | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  // Reactive: all hook instances see the same active profile ID
  const activeProfileId = useSyncExternalStore(subscribe, getActiveProfileId, () => null)

  const fetchData = useCallback(async () => {
    if (!user) {
      setParentMember(null)
      setFamily(null)
      setAllMembers([])
      setLoading(false)
      return
    }

    const { data: memberData } = await supabase
      .from('chores_family_members')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (memberData) {
      const parent = memberData as FamilyMember
      setParentMember(parent)

      const { data: familyData } = await supabase
        .from('chores_families')
        .select('*')
        .eq('id', parent.family_id)
        .single()

      if (familyData) {
        setFamily(familyData as Family)
      }

      const { data: membersData } = await supabase
        .from('chores_family_members')
        .select('*')
        .eq('family_id', parent.family_id)

      if (membersData) {
        setAllMembers(membersData as FamilyMember[])

        // If no stored profile or stored profile no longer valid, default to parent
        const storedId = getActiveProfileId()
        if (!storedId || !membersData.find(m => m.id === storedId)) {
          setActiveProfileIdStore(parent.id)
        }
      }
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    fetchData()
  }, [user, authLoading, fetchData])

  const switchProfile = (member: FamilyMember) => {
    setActiveProfileIdStore(member.id)
  }

  const member = allMembers.find(m => m.id === activeProfileId) || parentMember
  const isParent = member?.role === 'parent'
  const isActualParent = parentMember?.role === 'parent'

  return {
    user,
    member,
    family,
    isParent,
    isActualParent,
    parentMember,
    allMembers,
    loading,
    signOut,
    switchProfile,
    refresh: fetchData,
  }
}
