-- ==============================================================================
-- HINTHAR INTERNATIONAL SCHOOL — INITIAL CLOUDFLARE D1 (SQLITE) SCHEMA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `user` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL UNIQUE,
  `email_verified` integer DEFAULT 0 NOT NULL,
  `image` text,
  `role` text DEFAULT 'student' NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `title` text,
  `campus_id` text DEFAULT 'ywarma-campus',
  `grade` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_user_email` ON `user` (`email`);
CREATE INDEX IF NOT EXISTS `idx_user_role` ON `user` (`role`);
CREATE INDEX IF NOT EXISTS `idx_user_status` ON `user` (`status`);

CREATE TABLE IF NOT EXISTS `session` (
  `id` text PRIMARY KEY NOT NULL,
  `expires_at` integer NOT NULL,
  `token` text NOT NULL UNIQUE,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS `idx_session_token` ON `session` (`token`);
CREATE INDEX IF NOT EXISTS `idx_session_user` ON `session` (`user_id`);

CREATE TABLE IF NOT EXISTS `account` (
  `id` text PRIMARY KEY NOT NULL,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` integer,
  `refresh_token_expires_at` integer,
  `scope` text,
  `password` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_account_user` ON `account` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_account_provider` ON `account` (`provider_id`, `account_id`);

CREATE TABLE IF NOT EXISTS `verification` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch()),
  `updated_at` integer DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS `invitation` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `full_name` text NOT NULL,
  `role` text DEFAULT 'student' NOT NULL,
  `title` text,
  `campus_id` text DEFAULT 'ywarma-campus',
  `grade` text,
  `token` text NOT NULL UNIQUE,
  `status` text DEFAULT 'pending' NOT NULL,
  `invited_by` text REFERENCES `user`(`id`) ON DELETE SET NULL,
  `expires_at` integer NOT NULL,
  `accepted_at` integer,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_invitation_token` ON `invitation` (`token`);
CREATE INDEX IF NOT EXISTS `idx_invitation_email` ON `invitation` (`email`);
CREATE INDEX IF NOT EXISTS `idx_invitation_status` ON `invitation` (`status`);

CREATE TABLE IF NOT EXISTS `campuses` (
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
  `is_active` integer DEFAULT 1 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_campuses_city` ON `campuses` (`city`);
CREATE INDEX IF NOT EXISTS `idx_campuses_active` ON `campuses` (`is_active`);

CREATE TABLE IF NOT EXISTS `classes_courses` (
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
  `is_active` integer DEFAULT 1 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_classes_grade` ON `classes_courses` (`grade`);
CREATE INDEX IF NOT EXISTS `idx_classes_category` ON `classes_courses` (`category`);
CREATE INDEX IF NOT EXISTS `idx_classes_active` ON `classes_courses` (`is_active`);

CREATE TABLE IF NOT EXISTS `bulletin_notices` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `date` text NOT NULL,
  `type` text NOT NULL,
  `content` text NOT NULL,
  `is_pinned` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_bulletins_type` ON `bulletin_notices` (`type`);
CREATE INDEX IF NOT EXISTS `idx_bulletins_pinned` ON `bulletin_notices` (`is_pinned`);

CREATE TABLE IF NOT EXISTS `admissions` (
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
CREATE INDEX IF NOT EXISTS `idx_admissions_status` ON `admissions` (`status`);
CREATE INDEX IF NOT EXISTS `idx_admissions_grade` ON `admissions` (`grade`);
CREATE INDEX IF NOT EXISTS `idx_admissions_created` ON `admissions` (`created_at`);

CREATE TABLE IF NOT EXISTS `clubs` (
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
  `submitted_by` text REFERENCES `user`(`id`) ON DELETE SET NULL,
  `is_active` integer DEFAULT 1 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_clubs_category` ON `clubs` (`category`);
CREATE INDEX IF NOT EXISTS `idx_clubs_status` ON `clubs` (`status`);
CREATE INDEX IF NOT EXISTS `idx_clubs_active` ON `clubs` (`is_active`);

CREATE TABLE IF NOT EXISTS `activities` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `club_id` integer REFERENCES `clubs`(`id`) ON DELETE SET NULL,
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
  `featured` integer DEFAULT 0 NOT NULL,
  `review_status` text DEFAULT 'published' NOT NULL,
  `submitted_by` text REFERENCES `user`(`id`) ON DELETE SET NULL,
  `is_active` integer DEFAULT 1 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_activities_club` ON `activities` (`club_id`);
CREATE INDEX IF NOT EXISTS `idx_activities_status` ON `activities` (`status`);
CREATE INDEX IF NOT EXISTS `idx_activities_review` ON `activities` (`review_status`);
CREATE INDEX IF NOT EXISTS `idx_activities_active` ON `activities` (`is_active`);

CREATE TABLE IF NOT EXISTS `yearbook_alumni` (
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
  `submitted_by` text REFERENCES `user`(`id`) ON DELETE SET NULL,
  `reviewer_notes` text,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_yearbook_category` ON `yearbook_alumni` (`category`);
CREATE INDEX IF NOT EXISTS `idx_yearbook_status` ON `yearbook_alumni` (`status`);
CREATE INDEX IF NOT EXISTS `idx_yearbook_submitted_by` ON `yearbook_alumni` (`submitted_by`);

CREATE TABLE IF NOT EXISTS `file_assets` (
  `id` text PRIMARY KEY NOT NULL,
  `object_key` text NOT NULL UNIQUE,
  `filename` text NOT NULL,
  `mime_type` text NOT NULL,
  `size` integer NOT NULL,
  `folder` text DEFAULT 'general' NOT NULL,
  `public_url` text NOT NULL,
  `uploaded_by` text REFERENCES `user`(`id`) ON DELETE SET NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_file_assets_folder` ON `file_assets` (`folder`);
CREATE INDEX IF NOT EXISTS `idx_file_assets_uploaded_by` ON `file_assets` (`uploaded_by`);

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `actor_id` text,
  `actor_email` text,
  `actor_role` text,
  `action` text NOT NULL,
  `resource` text NOT NULL,
  `resource_id` text,
  `success` integer DEFAULT 1 NOT NULL,
  `details` text,
  `ip_address` text,
  `timestamp` text DEFAULT (datetime('now')) NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_audit_actor` ON `audit_logs` (`actor_id`);
CREATE INDEX IF NOT EXISTS `idx_audit_action` ON `audit_logs` (`action`);
CREATE INDEX IF NOT EXISTS `idx_audit_resource` ON `audit_logs` (`resource`);
CREATE INDEX IF NOT EXISTS `idx_audit_timestamp` ON `audit_logs` (`timestamp`);
