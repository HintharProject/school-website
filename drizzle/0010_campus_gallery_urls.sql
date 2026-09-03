-- gallery_urls is already present on deployed hinthar-db (local + remote).
-- SQLite/D1 has no ADD COLUMN IF NOT EXISTS; the ADD fails with duplicate column.
-- Fresh databases get the column via scripts/ensure-campus-gallery-column.mjs after migrations.
SELECT 1;
