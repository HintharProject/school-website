-- Remote hinthar-db already received some/all 0008 column additions from a
-- partial earlier apply (duplicate column errors on re-run). SQLite/D1 has no
-- ADD COLUMN IF NOT EXISTS, so we only execute idempotent DDL here.
CREATE TABLE IF NOT EXISTS admission_upload_limits (
  key text PRIMARY KEY NOT NULL,
  count integer DEFAULT 1 NOT NULL,
  reset_at integer NOT NULL
);

SELECT 1;
