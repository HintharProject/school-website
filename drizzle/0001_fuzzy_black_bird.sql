CREATE TABLE `club_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`club_id` integer NOT NULL,
	`student_name` text NOT NULL,
	`grade` text,
	`contact_email` text,
	`contact_phone` text,
	`notes` text,
	`status` text DEFAULT 'active' NOT NULL,
	`added_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`added_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_club_members_club` ON `club_members` (`club_id`);--> statement-breakpoint
CREATE INDEX `idx_club_members_status` ON `club_members` (`status`);