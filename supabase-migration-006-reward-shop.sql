-- v0.3.0: Reward Shop — categories, wishlists, inventory

-- Add category and shop features to rewards
ALTER TABLE chores_rewards
  ADD COLUMN category TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN image_url TEXT,
  ADD COLUMN is_limited BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN stock INTEGER;

-- Wishlists: kids bookmark rewards they're saving for
CREATE TABLE chores_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES chores_family_members(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES chores_rewards(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, reward_id)
);

-- Add status workflow to redemptions
ALTER TABLE chores_redemptions
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN parent_note TEXT;

-- Indexes
CREATE INDEX idx_wishlists_member ON chores_wishlists(member_id);
CREATE INDEX idx_redemptions_status ON chores_redemptions(status);

-- RLS
ALTER TABLE chores_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members access own wishlists"
  ON chores_wishlists FOR ALL
  USING (member_id IN (
    SELECT id FROM chores_family_members WHERE family_id IN (SELECT chores_get_my_family_ids())
  ));
