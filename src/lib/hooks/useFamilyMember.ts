'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import type { Family, FamilyMember } from '@/lib/types'

const ACTIVE_PROFILE_KEY = 'duty_active_profile_id'

export function useFamilyMember() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [parentMember, setParentMember] = useState<FamilyMember | null>(null)
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACTIVE_PROFILE_KEY)
    }
    return null
  })
  const [family, setFamily] = useState<Family | null>(null)
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) {
      setParentMember(null)
      setActiveProfileId(null)
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
        const storedId = localStorage.getItem(ACTIVE_PROFILE_KEY)
        if (!storedId || !membersData.find(m => m.id === storedId)) {
          setActiveProfileId(parent.id)
          localStorage.setItem(ACTIVE_PROFILE_KEY, parent.id)
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
    setActiveProfileId(member.id)
    localStorage.setItem(ACTIVE_PROFILE_KEY, member.id)
  }

  // Resolve the active member from allMembers using the stored ID
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
