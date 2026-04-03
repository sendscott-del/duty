-- v0.2.0: Gamification — streaks, XP, levels, badges, challenges

-- Add gamification columns to family members
ALTER TABLE chores_family_members
  ADD COLUMN xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN last_all_done_date DATE;

-- Badge definitions (reference data)
CREATE TABLE chores_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL CHECK (category IN ('streak', 'milestone', 'special')),
  threshold INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Badges earned by members
CREATE TABLE chores_member_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES chores_family_members(id) ON DELETE CASCADE,
  badge_slug TEXT NOT NULL REFERENCES chores_badges(slug) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, badge_slug)
);

-- Weekly family challenges
CREATE TABLE chores_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES chores_families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('family_completions', 'all_streaks', 'no_misses')),
  goal_value INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL DEFAULT 10,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_member_badges_member ON chores_member_badges(member_id);
CREATE INDEX idx_challenges_family_week ON chores_challenges(family_id, week_start);

-- RLS
ALTER TABLE chores_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores_member_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read badges"
  ON chores_badges FOR SELECT USING (true);

CREATE POLICY "Family members access own badges"
  ON chores_member_badges FOR ALL
  USING (member_id IN (
    SELECT id FROM chores_family_members WHERE family_id IN (SELECT chores_get_my_family_ids())
  ));

CREATE POLICY "Family members access own challenges"
  ON chores_challenges FOR ALL
  USING (family_id IN (SELECT chores_get_my_family_ids()));

-- Seed badge definitions
INSERT INTO chores_badges (slug, name, description, emoji, category, threshold, sort_order) VALUES
  ('first-duty',  'First Duty',    'Complete your first chore',           '⭐', 'milestone', 1,   1),
  ('streak-3',    'Hot Streak',    'Complete all chores 3 days in a row', '🔥', 'streak',    3,   2),
  ('streak-7',    'Week Warrior',  'Complete all chores 7 days in a row', '💪', 'streak',    7,   3),
  ('streak-14',   'Unstoppable',   '14-day streak — nothing can stop you','🌋', 'streak',    14,  4),
  ('streak-30',   'Streak Master', '30 days straight. Legendary.',        '👑', 'streak',    30,  5),
  ('photo-5',     'Shutterbug',    'Submit 5 photo proofs',               '📸', 'milestone', 5,   6),
  ('points-100',  'Hundo Club',    'Earn 100 total XP',                   '💯', 'milestone', 100, 7),
  ('points-500',  'Point Stacker', 'Earn 500 total XP',                   '💰', 'milestone', 500, 8),
  ('clean-sweep', 'Clean Sweep',   'Complete all your chores in one day', '🧹', 'special',   NULL, 9),
  ('early-bird',  'Early Bird',    'Complete a chore before 8am',         '🐦', 'special',   NULL, 10),
  ('team-player', 'Team Player',   'Help out with 5 chores not assigned to you', '🤝', 'special', 5, 11);
