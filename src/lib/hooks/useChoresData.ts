'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Chore, Completion, FamilyMember } from '@/lib/types'
import { completionKey } from '@/lib/dates'

export function useChoresData(familyId: string | undefined) {
  const [chores, setChores] = useState<Chore[]>([])
  const [completions, setCompletions] = useState<Map<string, Completion>>(new Map())
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!familyId) return

    const [choresRes, membersRes, completionsRes] = await Promise.all([
      supabase
        .from('chores_chores')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('chores_family_members')
        .select('*')
        .eq('family_id', familyId),
      supabase
        .from('chores_completions')
        .select('*')
    ])

    if (choresRes.data) setChores(choresRes.data as Chore[])
    if (membersRes.data) setMembers(membersRes.data as FamilyMember[])

    if (completionsRes.data) {
      const map = new Map<string, Completion>()
      for (const c of completionsRes.data as Completion[]) {
        map.set(completionKey(c.chore_id, c.member_id, c.completion_date), c)
      }
      setCompletions(map)
    }

    setLoading(false)
  }, [familyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const upsertCompletion = async (
    choreId: string,
    memberId: string,
    date: string,
    updates: Partial<Completion>
  ) => {
    const key = completionKey(choreId, memberId, date)
    const existing = completions.get(key)

    const record = {
      chore_id: choreId,
      member_id: memberId,
      completion_date: date,
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // Optimistic update
    const newMap = new Map(completions)
    newMap.set(key, record as Completion)
    setCompletions(newMap)

    const { data, error } = await supabase
      .from('chores_completions')
      .upsert(record, { onConflict: 'chore_id,member_id,completion_date' })
      .select()
      .single()

    if (error) {
      // Revert on error
      fetchData()
    } else if (data) {
      const revertMap = new Map(completions)
      revertMap.set(key, data as Completion)
      setCompletions(revertMap)
    }
  }

  return { chores, completions, members, loading, refresh: fetchData, upsertCompletion }
}
