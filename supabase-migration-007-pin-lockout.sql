-- 007: PIN-login rate limiting
-- Tracks failed PIN attempts and lockout window for kid PIN login
ALTER TABLE chores_family_members
  ADD COLUMN IF NOT EXISTS pin_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMPTZ;
