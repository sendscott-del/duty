-- Duty: Chores Tracking App
-- All tables prefixed with chores_ to share Supabase project with Steward

-- Families
CREATE TABLE chores_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Family',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Family members (linked to Supabase auth users)
CREATE TABLE chores_family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES chores_families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  avatar_emoji TEXT NOT NULL DEFAULT '😊',
  pin TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Chores definitions
CREATE TABLE chores_chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES chores_families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  day_of_week INTEGER,
  assigned_to UUID REFERENCES chores_family_members(id) ON DELETE SET NULL,
  require_checkoff BOOLEAN NOT NULL DEFAULT true,
  require_photo BOOLEAN NOT NULL DEFAULT false,
  require_approval BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chore completions (sparse: only created when kid interacts)
CREATE TABLE chores_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_id UUID NOT NULL REFERENCES chores_chores(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES chores_family_members(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  checked_off BOOLEAN NOT NULL DEFAULT false,
  checked_off_at TIMESTAMPTZ,
  photo_url TEXT,
  photo_uploaded_at TIMESTAMPTZ,
  approved BOOLEAN,
  approved_by UUID REFERENCES chores_family_members(id),
  approved_at TIMESTAMPTZ,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(chore_id, member_id, completion_date)
);

-- Rewards catalog
CREATE TABLE chores_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES chores_families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  point_cost INTEGER NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎁',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reward redemptions
CREATE TABLE chores_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES chores_rewards(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES chores_family_members(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fulfilled BOOLEAN NOT NULL DEFAULT false,
  fulfilled_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_chores_family ON chores_chores(family_id);
CREATE INDEX idx_chores_assigned ON chores_chores(assigned_to);
CREATE INDEX idx_completions_chore_date ON chores_completions(chore_id, completion_date);
CREATE INDEX idx_completions_member_date ON chores_completions(member_id, completion_date);
CREATE INDEX idx_rewards_family ON chores_rewards(family_id);
CREATE INDEX idx_redemptions_member ON chores_redemptions(member_id);
CREATE INDEX idx_family_members_family ON chores_family_members(family_id);
CREATE INDEX idx_family_members_user ON chores_family_members(user_id);

-- Row Level Security
ALTER TABLE chores_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores_family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores_chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: family-scoped access
CREATE POLICY "Family members access own family"
  ON chores_families FOR ALL
  USING (id IN (SELECT family_id FROM chores_family_members WHERE user_id = auth.uid()));

CREATE POLICY "Family members access own family members"
  ON chores_family_members FOR ALL
  USING (family_id IN (SELECT family_id FROM chores_family_members WHERE user_id = auth.uid()));

CREATE POLICY "Family members access own family chores"
  ON chores_chores FOR ALL
  USING (family_id IN (SELECT family_id FROM chores_family_members WHERE user_id = auth.uid()));

CREATE POLICY "Family members access own family completions"
  ON chores_completions FOR ALL
  USING (chore_id IN (
    SELECT id FROM chores_chores WHERE family_id IN (
      SELECT family_id FROM chores_family_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Family members access own family rewards"
  ON chores_rewards FOR ALL
  USING (family_id IN (SELECT family_id FROM chores_family_members WHERE user_id = auth.uid()));

CREATE POLICY "Family members access own family redemptions"
  ON chores_redemptions FOR ALL
  USING (member_id IN (
    SELECT id FROM chores_family_members WHERE family_id IN (
      SELECT family_id FROM chores_family_members WHERE user_id = auth.uid()
    )
  ));

-- Allow new users to create a family (no existing membership yet)
CREATE POLICY "Authenticated users can create families"
  ON chores_families FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow new users to add themselves as first member
CREATE POLICY "Authenticated users can join family"
  ON chores_family_members FOR INSERT
  WITH CHECK (user_id = auth.uid());
