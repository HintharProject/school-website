-- Run in Cloudflare Dashboard → D1 → hinthar-db → Console after migrations.
-- Confirms admission/gallery/yearbook schema expected by the current app.

SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (
  'admission_upload_limits',
  'yearbook_batches'
);

PRAGMA table_info(admissions);
PRAGMA table_info(campuses);
PRAGMA table_info(clubs);
PRAGMA table_info(yearbook_alumni);

SELECT region, name, is_active FROM yearbook_batches ORDER BY region, sort_order DESC;
