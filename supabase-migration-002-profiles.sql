-- Migration: Kids are profiles, not auth users
-- user_id is only set for the parent; children have null user_id

-- Make user_id nullable
ALTER TABLE chores_family_members ALTER COLUMN user_id DROP NOT NULL;

-- Drop the unique constraint that requires user_id
ALTER TABLE chores_family_members DROP CONSTRAINT IF EXISTS chores_family_members_family_id_user_id_key;

-- Update insert policy to allow parents to add child profiles
DROP POLICY IF EXISTS "Members insert own record" ON chores_family_members;
DROP POLICY IF EXISTS "Members insert into own family or self" ON chores_family_members;

CREATE POLICY "Members insert into own family or self"
  ON chores_family_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR family_id IN (SELECT chores_get_my_family_ids())
  );

-- Clean up any child auth users that were accidentally created
-- (You may want to manually delete these from Supabase Auth dashboard too)
