-- 009: Slug aliases + atomic rename
-- Lets parents rename their family link without breaking bookmarks the
-- kids already have on their home screens. Old slug becomes an alias
-- that keeps resolving to the same family.

CREATE TABLE IF NOT EXISTS chores_family_slug_aliases (
  slug TEXT PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES chores_families(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chores_family_slug_aliases_family
  ON chores_family_slug_aliases(family_id);

ALTER TABLE chores_family_slug_aliases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members see own family aliases" ON chores_family_slug_aliases;
CREATE POLICY "Members see own family aliases"
  ON chores_family_slug_aliases FOR SELECT
  USING (family_id IN (SELECT chores_get_my_family_ids()));

CREATE OR REPLACE FUNCTION chores_change_family_slug(p_new_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_family_id UUID;
  v_old_slug TEXT;
  v_normalized TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN json_build_object('error', 'unauthenticated'); END IF;

  v_normalized := lower(trim(p_new_slug));
  IF v_normalized !~ '^[a-z0-9][a-z0-9-]{0,40}$' THEN
    RETURN json_build_object('error', 'invalid_slug');
  END IF;

  SELECT family_id INTO v_family_id
  FROM public.chores_family_members
  WHERE user_id = v_user_id AND role = 'parent'
  LIMIT 1;

  IF v_family_id IS NULL THEN
    RETURN json_build_object('error', 'not_a_parent');
  END IF;

  SELECT slug INTO v_old_slug FROM public.chores_families WHERE id = v_family_id;

  IF v_old_slug = v_normalized THEN
    RETURN json_build_object('ok', true, 'slug', v_normalized, 'noop', true);
  END IF;

  IF EXISTS (SELECT 1 FROM public.chores_families WHERE slug = v_normalized AND id != v_family_id) THEN
    RETURN json_build_object('error', 'slug_taken');
  END IF;
  IF EXISTS (SELECT 1 FROM public.chores_family_slug_aliases WHERE slug = v_normalized AND family_id != v_family_id) THEN
    RETURN json_build_object('error', 'slug_taken');
  END IF;

  DELETE FROM public.chores_family_slug_aliases
    WHERE slug = v_normalized AND family_id = v_family_id;

  IF v_old_slug IS NOT NULL THEN
    INSERT INTO public.chores_family_slug_aliases (slug, family_id)
      VALUES (v_old_slug, v_family_id)
      ON CONFLICT (slug) DO NOTHING;
  END IF;

  UPDATE public.chores_families SET slug = v_normalized WHERE id = v_family_id;

  RETURN json_build_object('ok', true, 'slug', v_normalized, 'previous', v_old_slug);
END;
$$;

GRANT EXECUTE ON FUNCTION chores_change_family_slug(TEXT) TO authenticated;
