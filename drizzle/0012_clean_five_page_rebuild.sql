-- ==============================================================================
-- 0012: 5-Page Architecture Rebuild, Pearson Edexcel Catalog & Bilingual Fields
-- ==============================================================================

-- 1. Drop removed legacy tables cleanly
DROP TABLE IF EXISTS `notice_reads`;
--> statement-breakpoint
DROP TABLE IF EXISTS `notices`;
--> statement-breakpoint
DROP TABLE IF EXISTS `bulletin_notices`;
--> statement-breakpoint
DROP TABLE IF EXISTS `classes_courses`;
--> statement-breakpoint
DROP TABLE IF EXISTS `news_posts`;
--> statement-breakpoint
DROP TABLE IF EXISTS `staff_profiles`;
--> statement-breakpoint
DROP TABLE IF EXISTS `newsletter_subscribers`;
--> statement-breakpoint

-- 2. Wipe stale site_content test overrides (e.g. "99% OVERRIDE TEST")
DELETE FROM `site_content`;
--> statement-breakpoint

-- 3. Remove non-Pearson legacy academic program categories if present
DELETE FROM `academic_programs` WHERE `category` != 'pearson';
--> statement-breakpoint

-- 4. Add new bilingual & display columns to campuses
ALTER TABLE `campuses` ADD COLUMN `grades_served_my` text;
--> statement-breakpoint
ALTER TABLE `campuses` ADD COLUMN `facilities_en` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `campuses` ADD COLUMN `facilities_my` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `campuses` ADD COLUMN `sort_order` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_campuses_sort` ON `campuses` (`sort_order`);
--> statement-breakpoint

-- 5. Add new display & bilingual columns to academic_programs & academic_subjects
ALTER TABLE `academic_programs` ADD COLUMN `badge_en` text;
--> statement-breakpoint
ALTER TABLE `academic_programs` ADD COLUMN `badge_my` text;
--> statement-breakpoint
ALTER TABLE `academic_programs` ADD COLUMN `age_range_en` text;
--> statement-breakpoint
ALTER TABLE `academic_programs` ADD COLUMN `age_range_my` text;
--> statement-breakpoint
ALTER TABLE `academic_programs` ADD COLUMN `highlights_en` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `academic_programs` ADD COLUMN `highlights_my` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `academic_programs` ADD COLUMN `image_url` text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_academic_programs_sort` ON `academic_programs` (`sort_order`);
--> statement-breakpoint
ALTER TABLE `academic_subjects` ADD COLUMN `level` text DEFAULT 'Both' NOT NULL;
--> statement-breakpoint

-- 6. Add bilingual columns to yearbook_alumni, clubs, and activities
ALTER TABLE `yearbook_alumni` ADD COLUMN `role_my` text;
--> statement-breakpoint
ALTER TABLE `yearbook_alumni` ADD COLUMN `quote_my` text;
--> statement-breakpoint
ALTER TABLE `yearbook_alumni` ADD COLUMN `badge_my` text;
--> statement-breakpoint
ALTER TABLE `clubs` ADD COLUMN `meeting_time_my` text;
--> statement-breakpoint
ALTER TABLE `clubs` ADD COLUMN `leadership_my` text;
--> statement-breakpoint
ALTER TABLE `activities` ADD COLUMN `title_my` text;
--> statement-breakpoint
ALTER TABLE `activities` ADD COLUMN `location_my` text;
--> statement-breakpoint
ALTER TABLE `activities` ADD COLUMN `description_my` text;

