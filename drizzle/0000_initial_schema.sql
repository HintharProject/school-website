CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`issuer` text DEFAULT 'local:credential' NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_account_user` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_account_provider` ON `account` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `idx_account_issuer` ON `account` (`issuer`);--> statement-breakpoint
CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`club_id` integer,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`date` text NOT NULL,
	`month` text NOT NULL,
	`day` text NOT NULL,
	`time` text NOT NULL,
	`location` text NOT NULL,
	`description` text NOT NULL,
	`image` text DEFAULT '/images/engineering.avif' NOT NULL,
	`status` text DEFAULT 'Upcoming' NOT NULL,
	`campus` text DEFAULT 'both-campuses',
	`featured` integer DEFAULT false NOT NULL,
	`review_status` text DEFAULT 'published' NOT NULL,
	`submitted_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`submitted_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_activities_club` ON `activities` (`club_id`);--> statement-breakpoint
CREATE INDEX `idx_activities_status` ON `activities` (`status`);--> statement-breakpoint
CREATE INDEX `idx_activities_review` ON `activities` (`review_status`);--> statement-breakpoint
CREATE INDEX `idx_activities_active` ON `activities` (`is_active`);--> statement-breakpoint
CREATE TABLE `admissions` (
	`id` text PRIMARY KEY NOT NULL,
	`student_name` text NOT NULL,
	`date_of_birth` text,
	`gender` text,
	`nationality` text DEFAULT 'Myanmar',
	`grade` text NOT NULL,
	`program_level` text,
	`academic_stream` text,
	`selected_subjects` text DEFAULT '[]',
	`intended_start_term` text,
	`study_mode` text DEFAULT 'Full-Time On-Campus',
	`previous_school` text,
	`parent_name` text,
	`relationship` text DEFAULT 'Parent',
	`parent_email` text NOT NULL,
	`parent_phone` text NOT NULL,
	`address` text,
	`emergency_contact` text,
	`medical_notes` text,
	`how_heard` text DEFAULT 'School Website',
	`submitted_date` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`assessment_date` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admissions_status` ON `admissions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_admissions_grade` ON `admissions` (`grade`);--> statement-breakpoint
CREATE INDEX `idx_admissions_created` ON `admissions` (`created_at`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_id` text,
	`actor_email` text,
	`actor_role` text,
	`action` text NOT NULL,
	`resource` text NOT NULL,
	`resource_id` text,
	`success` integer DEFAULT true NOT NULL,
	`details` text,
	`ip_address` text,
	`timestamp` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_actor` ON `audit_logs` (`actor_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_action` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `idx_audit_resource` ON `audit_logs` (`resource`);--> statement-breakpoint
CREATE INDEX `idx_audit_timestamp` ON `audit_logs` (`timestamp`);--> statement-breakpoint
CREATE TABLE `bulletin_notices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_bulletins_type` ON `bulletin_notices` (`type`);--> statement-breakpoint
CREATE INDEX `idx_bulletins_pinned` ON `bulletin_notices` (`is_pinned`);--> statement-breakpoint
CREATE TABLE `campuses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`tagline` text NOT NULL,
	`address` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`office_hours` text DEFAULT 'Mon–Sat: 08:30 AM – 05:00 PM' NOT NULL,
	`grades_served` text NOT NULL,
	`facilities` text DEFAULT '[]' NOT NULL,
	`image_url` text NOT NULL,
	`map_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_campuses_city` ON `campuses` (`city`);--> statement-breakpoint
CREATE INDEX `idx_campuses_active` ON `campuses` (`is_active`);--> statement-breakpoint
CREATE TABLE `classes_courses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`grade` text NOT NULL,
	`category` text NOT NULL,
	`time` text NOT NULL,
	`instructor` text NOT NULL,
	`room` text,
	`credits` text DEFAULT 'Core',
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_classes_grade` ON `classes_courses` (`grade`);--> statement-breakpoint
CREATE INDEX `idx_classes_category` ON `classes_courses` (`category`);--> statement-breakpoint
CREATE INDEX `idx_classes_active` ON `classes_courses` (`is_active`);--> statement-breakpoint
CREATE TABLE `clubs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`icon` text DEFAULT 'groups' NOT NULL,
	`members` text DEFAULT '25+ Scholars' NOT NULL,
	`meeting_time` text NOT NULL,
	`leadership` text NOT NULL,
	`description` text NOT NULL,
	`image` text DEFAULT '/images/g2.jpg' NOT NULL,
	`campus` text DEFAULT 'both-campuses',
	`status` text DEFAULT 'published' NOT NULL,
	`submitted_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`submitted_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_clubs_category` ON `clubs` (`category`);--> statement-breakpoint
CREATE INDEX `idx_clubs_status` ON `clubs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_clubs_active` ON `clubs` (`is_active`);--> statement-breakpoint
CREATE TABLE `file_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`folder` text DEFAULT 'general' NOT NULL,
	`public_url` text NOT NULL,
	`uploaded_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `file_assets_object_key_unique` ON `file_assets` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_file_assets_folder` ON `file_assets` (`folder`);--> statement-breakpoint
CREATE INDEX `idx_file_assets_uploaded_by` ON `file_assets` (`uploaded_by`);--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`title` text,
	`campus_id` text DEFAULT 'ywarma-campus',
	`grade` text,
	`token` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`invited_by` text,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`invited_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_token_unique` ON `invitation` (`token`);--> statement-breakpoint
CREATE INDEX `idx_invitation_token` ON `invitation` (`token`);--> statement-breakpoint
CREATE INDEX `idx_invitation_email` ON `invitation` (`email`);--> statement-breakpoint
CREATE INDEX `idx_invitation_status` ON `invitation` (`status`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `idx_session_token` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `idx_session_user` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'student' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`title` text,
	`campus_id` text DEFAULT 'ywarma-campus',
	`grade` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `idx_user_email` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `idx_user_role` ON `user` (`role`);--> statement-breakpoint
CREATE INDEX `idx_user_status` ON `user` (`status`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `yearbook_alumni` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`role` text NOT NULL,
	`destination` text,
	`subjects` text,
	`quote` text NOT NULL,
	`image` text DEFAULT '/images/g5.jpg' NOT NULL,
	`badge` text,
	`campus` text DEFAULT 'both-campuses',
	`status` text DEFAULT 'published' NOT NULL,
	`submitted_by` text,
	`reviewer_notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`submitted_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_yearbook_category` ON `yearbook_alumni` (`category`);--> statement-breakpoint
CREATE INDEX `idx_yearbook_status` ON `yearbook_alumni` (`status`);--> statement-breakpoint
CREATE INDEX `idx_yearbook_submitted_by` ON `yearbook_alumni` (`submitted_by`);