-- v0.2.3: Support multiple days for weekly chores
-- Change day_of_week from INTEGER to JSONB to support arrays
-- Old: day_of_week = 1 (Monday)
-- New: day_of_week = [1, 3, 5] (Mon, Wed, Fri) or null (any day)

ALTER TABLE chores_chores ALTER COLUMN day_of_week TYPE JSONB USING
  CASE
    WHEN day_of_week IS NULL THEN NULL
    ELSE to_jsonb(day_of_week)
  END;
