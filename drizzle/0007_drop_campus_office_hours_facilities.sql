-- Remove office_hours and facilities columns from campuses table
-- These fields had no admin UI and were only set via hardcoded defaults
ALTER TABLE `campuses` DROP COLUMN `office_hours`;
ALTER TABLE `campuses` DROP COLUMN `facilities`;
