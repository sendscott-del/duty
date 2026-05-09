-- 008: Family URL slugs
-- Each family gets a short, unique slug used in URLs like /f/shurtliff so
-- kids can open the app on a known family without parent setup.
ALTER TABLE chores_families ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_chores_families_slug
  ON chores_families(slug) WHERE slug IS NOT NULL;

-- Backfill the Shurtliff family
UPDATE chores_families
  SET slug = 'shurtliff'
  WHERE id = '36416e34-7b63-4d94-b581-f150221e8cc5' AND slug IS NULL;
