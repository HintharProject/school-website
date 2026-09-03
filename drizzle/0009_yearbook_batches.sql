CREATE TABLE `yearbook_batches` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `region` text NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `is_active` integer DEFAULT 1 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE INDEX `idx_yearbook_batches_region` ON `yearbook_batches` (`region`);
CREATE INDEX `idx_yearbook_batches_active` ON `yearbook_batches` (`is_active`);
CREATE UNIQUE INDEX `idx_yearbook_batches_region_name` ON `yearbook_batches` (`region`, `name`);

INSERT INTO `yearbook_batches` (`id`, `name`, `region`, `sort_order`) VALUES
  ('yangon-2026', 'Class of 2026', 'Yangon', 2026),
  ('yangon-2025', 'Class of 2025', 'Yangon', 2025),
  ('yangon-2024', 'Class of 2024', 'Yangon', 2024),
  ('mawlamyine-2026', 'Class of 2026', 'Mawlamyine', 2026),
  ('mawlamyine-2025', 'Class of 2025', 'Mawlamyine', 2025),
  ('mawlamyine-2024', 'Class of 2024', 'Mawlamyine', 2024);

DELETE FROM `yearbook_alumni`
WHERE `category` IN ('University Placements', 'Competitions');

ALTER TABLE `yearbook_alumni` ADD `batch_id` text REFERENCES `yearbook_batches`(`id`) ON DELETE RESTRICT;

UPDATE `yearbook_alumni`
SET `batch_id` = CASE
  WHEN `category` = 'Class of 2025' THEN 'yangon-2025'
  WHEN `category` = 'Class of 2024' THEN 'yangon-2024'
  ELSE 'yangon-2026'
END,
`campus` = 'yangon-all';

CREATE INDEX `idx_yearbook_batch` ON `yearbook_alumni` (`batch_id`);
