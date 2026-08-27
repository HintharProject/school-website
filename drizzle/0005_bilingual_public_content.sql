-- Bilingual public content: MY optional columns (fallback to EN)
-- Campuses
ALTER TABLE `campuses` ADD COLUMN `name_my` text;
--> statement-breakpoint
ALTER TABLE `campuses` ADD COLUMN `tagline_my` text;
--> statement-breakpoint
ALTER TABLE `campuses` ADD COLUMN `address_my` text;
--> statement-breakpoint
-- News posts
ALTER TABLE `news_posts` ADD COLUMN `title_my` text;
--> statement-breakpoint
ALTER TABLE `news_posts` ADD COLUMN `excerpt_my` text;
--> statement-breakpoint
ALTER TABLE `news_posts` ADD COLUMN `body_my` text;
--> statement-breakpoint
-- Staff directory (name stays EN per no-translate rule)
ALTER TABLE `staff_profiles` ADD COLUMN `role_my` text;
--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD COLUMN `department_my` text;
--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD COLUMN `qualifications_my` text;
--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD COLUMN `bio_my` text;
--> statement-breakpoint
-- Testimonials (authorName stays EN)
ALTER TABLE `testimonials` ADD COLUMN `author_role_my` text;
--> statement-breakpoint
ALTER TABLE `testimonials` ADD COLUMN `quote_my` text;
--> statement-breakpoint
-- Clubs (name stays EN)
ALTER TABLE `clubs` ADD COLUMN `description_my` text;
