-- Production hinthar-db already has office_hours/facilities removed.
-- SQLite/D1 has no DROP COLUMN IF EXISTS, so re-running the drops fails with
-- "no such column: office_hours". Local databases that still have the legacy
-- columns were cleaned up when this migration first applied locally.
SELECT 1;
