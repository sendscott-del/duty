'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import type { Family, FamilyMember } from '@/lib/types'

export function useFamilyMember() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [member, setMember] = useState<FamilyMember | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setMember(null)
      setFamily(null)
      setLoading(false)
      return
    }

    async function fetchMember() {
      const { data: memberData } = await supabase
        .from('chores_family_members')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (memberData) {
        setMember(memberData as FamilyMember)

        const { data: familyData } = await supabase
          .from('chores_families')
          .select('*')
          .eq('id', memberData.family_id)
          .single()

        if (familyData) {
          setFamily(familyData as Family)
        }
      }

      setLoading(false)
    }

    fetchMember()
  }, [user, authLoading])

  const isParent = member?.role === 'parent'

  return { user, member, family, isParent, loading, signOut }
}
