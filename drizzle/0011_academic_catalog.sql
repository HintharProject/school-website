CREATE TABLE `academic_programs` (
	`id` text PRIMARY KEY NOT NULL,
	`name_en` text NOT NULL,
	`name_my` text,
	`summary_en` text,
	`summary_my` text,
	`description_en` text,
	`description_my` text,
	`curriculum` text DEFAULT 'Pearson' NOT NULL,
	`category` text DEFAULT 'pearson' NOT NULL,
	`duration` text,
	`campus` text DEFAULT 'both' NOT NULL,
	`study_mode` text,
	`program_level` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_academic_programs_active` ON `academic_programs` (`is_active`);
--> statement-breakpoint
CREATE INDEX `idx_academic_programs_category` ON `academic_programs` (`category`);
--> statement-breakpoint
CREATE INDEX `idx_academic_programs_campus` ON `academic_programs` (`campus`);
--> statement-breakpoint
CREATE TABLE `academic_subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`name_en` text NOT NULL,
	`name_my` text,
	`code` text,
	`track` text DEFAULT 'STEM' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_academic_subjects_active` ON `academic_subjects` (`is_active`);
--> statement-breakpoint
CREATE INDEX `idx_academic_subjects_track` ON `academic_subjects` (`track`);
--> statement-breakpoint
CREATE TABLE `program_subject_links` (
	`program_id` text NOT NULL,
	`subject_id` text NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `academic_programs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `academic_subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_program_subject_unique` ON `program_subject_links` (`program_id`,`subject_id`);
--> statement-breakpoint
ALTER TABLE `admissions` ADD COLUMN `target_program_id` text;
