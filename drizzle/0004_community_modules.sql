-- Community modules: news/blog, staff directory, testimonials, newsletter

CREATE TABLE `news_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`excerpt` text,
	`body` text NOT NULL,
	`category` text DEFAULT 'Announcement' NOT NULL,
	`image` text,
	`status` text DEFAULT 'published' NOT NULL, -- "published" | "draft" | "archived"
	`published_at` text,
	`created_by` text,
	`created_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
	`updated_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_news_status` ON `news_posts` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_news_published` ON `news_posts` (`published_at`);
--> statement-breakpoint
CREATE TABLE `staff_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`department` text DEFAULT 'General' NOT NULL,
	`qualifications` text,
	`bio` text,
	`email` text,
	`phone` text,
	`image` text,
	`campus_id` text DEFAULT 'both-campuses' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'published' NOT NULL, -- "published" | "archived"
	`created_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
	`updated_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
--> statement-breakpoint
CREATE INDEX `idx_staff_status` ON `staff_profiles` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_staff_sort` ON `staff_profiles` (`sort_order`);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_name` text NOT NULL,
	`author_role` text,
	`quote` text NOT NULL,
	`image` text,
	`rating` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'published' NOT NULL, -- "published" | "archived"
	`created_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
	`updated_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
--> statement-breakpoint
CREATE INDEX `idx_testimonials_status` ON `testimonials` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_testimonials_sort` ON `testimonials` (`sort_order`);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL UNIQUE,
	`status` text DEFAULT 'active' NOT NULL, -- "active" | "unsubscribed"
	`source` text DEFAULT 'footer' NOT NULL,
	`created_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_newsletter_email` ON `newsletter_subscribers` (`email`);
