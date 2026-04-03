'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import type { Family, FamilyMember } from '@/lib/types'

export function useFamilyMember() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [parentMember, setParentMember] = useState<FamilyMember | null>(null)
  const [activeProfile, setActiveProfile] = useState<FamilyMember | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) {
      setParentMember(null)
      setActiveProfile(null)
      setFamily(null)
      setAllMembers([])
      setLoading(false)
      return
    }

    // Find the parent member record for this auth user
    const { data: memberData } = await supabase
      .from('chores_family_members')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (memberData) {
      const parent = memberData as FamilyMember
      setParentMember(parent)

      // If no active profile set, default to parent
      if (!activeProfile) {
        setActiveProfile(parent)
      }

      const { data: familyData } = await supabase
        .from('chores_families')
        .select('*')
        .eq('id', parent.family_id)
        .single()

      if (familyData) {
        setFamily(familyData as Family)
      }

      // Fetch all family members
      const { data: membersData } = await supabase
        .from('chores_family_members')
        .select('*')
        .eq('family_id', parent.family_id)

      if (membersData) {
        setAllMembers(membersData as FamilyMember[])
      }
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    fetchData()
  }, [user, authLoading, fetchData])

  // Switch to a different profile (kid or parent)
  const switchProfile = (member: FamilyMember) => {
    setActiveProfile(member)
  }

  // The "member" is whichever profile is active
  const member = activeProfile
  const isParent = activeProfile?.role === 'parent'
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
