'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { CHALLENGE_TEMPLATES } from '@/lib/gamification'
import type { Challenge } from '@/lib/types'

export function useChallenges(familyId: string | undefined) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd')

  const fetchChallenge = useCallback(async () => {
    if (!familyId) return

    const { data } = await supabase
      .from('chores_challenges')
      .select('*')
      .eq('family_id', familyId)
      .eq('week_start', weekStart)
      .single()

    if (data) {
      setChallenge(data as Challenge)
    }

    setLoading(false)
  }, [familyId, weekStart])

  useEffect(() => {
    fetchChallenge()
  }, [fetchChallenge])

  // Generate a new weekly challenge (parent action)
  const generateChallenge = async () => {
    if (!familyId) return

    const template = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)]

    const { data, error } = await supabase
      .from('chores_challenges')
      .insert({
        family_id: familyId,
        title: template.title,
        description: template.description.replace('{goal}', String(template.goal_value)),
        goal_type: template.goal_type,
        goal_value: template.goal_value,
        bonus_points: template.bonus_points,
        week_start: weekStart,
        week_end: weekEnd,
      })
      .select()
      .single()

    if (data) {
      setChallenge(data as Challenge)
    }

    return data as Challenge | null
  }

  // Mark challenge as completed
  const completeChallenge = async () => {
    if (!challenge) return

    await supabase
      .from('chores_challenges')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', challenge.id)

    setChallenge({ ...challenge, completed: true, completed_at: new Date().toISOString() })
  }

  return {
    challenge,
    loading,
    generateChallenge,
    completeChallenge,
    refresh: fetchChallenge,
  }
}
