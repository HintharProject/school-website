ALTER TABLE `admissions` ADD `finished_grade` text;
ALTER TABLE `admissions` ADD `suggested_entry_year` text;
ALTER TABLE `admissions` ADD `preferred_region` text;
ALTER TABLE `admissions` ADD `document_urls` text DEFAULT '[]';
ALTER TABLE `campuses` ADD `gallery_urls` text DEFAULT '[]' NOT NULL;
ALTER TABLE `clubs` ADD `gallery_urls` text DEFAULT '[]' NOT NULL;
CREATE TABLE `admission_upload_limits` (
  `key` text PRIMARY KEY NOT NULL,
  `count` integer DEFAULT 1 NOT NULL,
  `reset_at` integer NOT NULL
);
