// XP & Level calculations
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 10)) + 1
}

export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 10
}

export function xpForNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1)
}

export function levelProgress(xp: number): number {
  const level = calculateLevel(xp)
  const currentLevelXP = xpForLevel(level)
  const nextLevelXP = xpForLevel(level + 1)
  const range = nextLevelXP - currentLevelXP
  if (range === 0) return 0
  return (xp - currentLevelXP) / range
}

// Challenge templates
export const CHALLENGE_TEMPLATES = [
  {
    title: 'Family Power Week',
    description: 'Complete {goal} chores as a family this week',
    goal_type: 'family_completions' as const,
    goal_value: 20,
    bonus_points: 15,
  },
  {
    title: 'Streak Squad',
    description: 'Every active family member must have a streak of {goal}+ days',
    goal_type: 'all_streaks' as const,
    goal_value: 3,
    bonus_points: 20,
  },
  {
    title: 'Perfect Week',
    description: 'No missed chores all week — zero misses across the family',
    goal_type: 'no_misses' as const,
    goal_value: 0,
    bonus_points: 25,
  },
  {
    title: 'Chore Blitz',
    description: 'Complete {goal} chores as a family this week',
    goal_type: 'family_completions' as const,
    goal_value: 30,
    bonus_points: 20,
  },
  {
    title: 'Streak Builders',
    description: 'Every active family member must have a streak of {goal}+ days',
    goal_type: 'all_streaks' as const,
    goal_value: 5,
    bonus_points: 25,
  },
]
