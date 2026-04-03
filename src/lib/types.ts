export interface Family {
  id: string
  name: string
  created_at: string
}

export interface FamilyMember {
  id: string
  family_id: string
  user_id: string | null
  display_name: string
  role: 'parent' | 'child'
  avatar_emoji: string
  pin: string | null
  is_active: boolean
  created_at: string
}

export type ChoreFrequency = 'daily' | 'weekly'

export interface Chore {
  id: string
  family_id: string
  name: string
  description: string | null
  points: number
  frequency: ChoreFrequency
  day_of_week: number | null
  assigned_to: string | null
  require_checkoff: boolean
  require_photo: boolean
  require_approval: boolean
  is_active: boolean
  sort_order: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Completion {
  id: string
  chore_id: string
  member_id: string
  completion_date: string
  checked_off: boolean
  checked_off_at: string | null
  photo_url: string | null
  photo_uploaded_at: string | null
  approved: boolean | null
  approved_by: string | null
  approved_at: string | null
  points_awarded: number
  created_at: string
  updated_at: string
}

export interface Reward {
  id: string
  family_id: string
  name: string
  description: string | null
  point_cost: number
  emoji: string
  is_active: boolean
  created_by: string
  created_at: string
}

export interface Redemption {
  id: string
  reward_id: string
  member_id: string
  points_spent: number
  redeemed_at: string
  fulfilled: boolean
  fulfilled_at: string | null
}
