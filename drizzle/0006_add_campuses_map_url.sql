-- Fix campuses missing map_url column (remote D1 was deployed before mapUrl was added in schema)
ALTER TABLE `campuses` ADD COLUMN `map_url` text;
