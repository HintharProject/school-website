-- ==============================================================================
-- HINTHAR INTERNATIONAL SCHOOL — CLOUDFLARE D1 SEED DATA
-- ==============================================================================

-- 1. CAMPUSES SEED
INSERT INTO `campuses` (`id`, `name`, `city`, `tagline`, `address`, `phone`, `email`, `office_hours`, `grades_served`, `facilities`, `image_url`, `is_active`)
VALUES
  (
    'ywarma-campus',
    'Ywarma Campus',
    'Yangon',
    'Flagship Academic Center & Pearson Examination Hall',
    'No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon, Myanmar (11051)',
    '+95 9 894 332200 / +95 9 894 332211',
    'ywarma.admissions@hinthar.education',
    'Mon–Sat: 08:30 AM – 05:00 PM',
    'Year 7–9 · Pearson IGCSE · Pearson IAL',
    '["Pearson Official Examination Center", "Turing High-Performance Computer Lab", "Newton Physics & Franklin Chemistry Labs", "British Council Testing Suite", "Academic Auditorium & British Library"]',
    '/images/heroImg.png',
    1
  ),
  (
    'shwe-padauk-campus',
    'Shwe Padauk Campus',
    'Yangon',
    'Senior STEM, AI & Robotics Innovation Center',
    'Shwe Padauk Road, Yangon, Myanmar',
    '+95 9 894 332222',
    'shwepadauk@hinthar.education',
    'Mon–Sat: 08:30 AM – 05:00 PM',
    'Pearson IGCSE & Pearson IAL (STEM Specialized)',
    '["AI, IoT & Robotics Studio", "Advanced Molecular Chemistry Lab", "Bio-Science Research Incubator", "Collaborative Study Pods & Seminar Hall", "Student Innovation & Recreation Hub"]',
    '/images/specialisations/stemSpecialisation.png',
    1
  ),
  (
    'shwe-pone-nyet-campus',
    'Shwe Pone Nyet Campus',
    'Yangon',
    'Lower Secondary & Creative Arts Hub',
    'Shwe Pone Nyet Street, Yangon, Myanmar',
    '+95 9 894 332233',
    'shweponenyet@hinthar.education',
    'Mon–Sat: 08:30 AM – 05:00 PM',
    'Lower Secondary (Year 7–9) & Foundation Arts',
    '["Digital Media & Graphic Arts Lab", "Music & Performing Arts Studio", "Badminton & Physical Fitness Arena", "English Language Immersion Lounge", "Junior Science Inquiry Lab"]',
    '/images/specialisations/creativeSpecialisation.png',
    1
  ),
  (
    'mawlamyine-campus',
    'Mawlamyine Campus',
    'Mawlamyine',
    'Mon State Regional Center of Academic Excellence',
    'Main Strand Road, Mawlamyine, Mon State, Myanmar',
    '+95 9 894 332288 / +95 32 202 888',
    'mawlamyine@hinthar.education',
    'Mon–Sat: 08:30 AM – 05:00 PM',
    'Year 7–9 · Pearson IGCSE · Pearson IAL',
    '["Full-Scale Physics, Chem & Bio Labs", "Modern Computer Lab & High-Speed Fiber", "Extensive Curated British Library", "Multi-Purpose Outdoor Sports Arena", "Student Residence & Pastoral Support"]',
    '/images/specialisations/businessSpecialisation.png',
    1
  )
ON CONFLICT (`id`) DO UPDATE SET
  `name` = excluded.`name`,
  `city` = excluded.`city`,
  `tagline` = excluded.`tagline`,
  `address` = excluded.`address`,
  `phone` = excluded.`phone`,
  `email` = excluded.`email`,
  `grades_served` = excluded.`grades_served`,
  `facilities` = excluded.`facilities`,
  `image_url` = excluded.`image_url`;

-- 2. CLASSES & COURSES SEED
INSERT INTO `classes_courses` (`id`, `name`, `code`, `grade`, `category`, `time`, `instructor`, `room`, `credits`, `description`, `is_active`)
VALUES
  ('course-ial-math', 'Pure Mathematics (P1 – P4)', 'WMA11 / WMA12', 'Pearson IAL', 'STEM', 'Mon, Wed, Fri • 08:30 AM – 10:00 AM', 'Dr. Kaung Myat Htut & U Than Win', 'Mathematics Lab 2', '4 Modules', 'Advanced calculus, differential equations, vectors, coordinate geometry, and sequence & series.', 1),
  ('course-ial-physics', 'Advanced Physics & Practical Lab (Units 1–6)', 'WPH11 / WPH14', 'Pearson IAL', 'STEM', 'Tue, Thu • 10:30 AM – 12:30 PM', 'Dr. Htet Aung Lin', 'Newton Science Lab', 'Units 1–6', 'Mechanics, electrical circuits, thermodynamics, fields, waves, nuclear physics and empirical experiments.', 1),
  ('course-igcse-cs', 'Pearson IGCSE Computer Science', '4CP0', 'Pearson IGCSE', 'Computing', 'Mon, Thu • 01:00 PM – 02:30 PM', 'Daw May Zin Thet', 'Turing Digital Lab', '2 Papers', 'Algorithms, Python software architecture, data structures, network security, and computer systems.', 1),
  ('course-igcse-bio-chem', 'Pearson IGCSE Chemistry & Biology', '4CH1 / 4BI1', 'Pearson IGCSE', 'STEM', 'Mon, Wed, Fri • 10:30 AM – 12:00 PM', 'Dr. Su Mon Kyaw', 'Chemistry & Bio Lab', 'Core & Extended', 'Chemical bonding, stoichiometry, human physiology, genetics, organic synthesis, and laboratory investigation.', 1),
  ('course-igcse-econ', 'Economics & Business Studies', '4EC1 / 4BS1', 'Pearson IGCSE', 'Business', 'Tue, Thu • 02:00 PM – 03:30 PM', 'U Myo Min Tun (MBA)', 'Economics Seminar Room', '2 Papers', 'Micro & macroeconomics, market dynamics, international trade, financial statements, and business strategy.', 1),
  ('course-sec-stem', 'Lower Secondary STEM Discovery & Math (Year 7–9)', 'SEC-MATH-08', 'Lower Secondary (Year 7–9)', 'STEM', 'Daily • 09:00 AM – 10:30 AM', 'Tr. Rachel Evans', 'Room 104 (Secondary Wing)', 'Full Year', 'Pre-algebra, introductory physics concepts, scientific inquiry, and global perspective workshops.', 1),
  ('course-sec-eng', 'Lower Secondary English & Global Perspectives (Year 7–9)', 'SEC-ENG-09', 'Lower Secondary (Year 7–9)', 'Languages', 'Daily • 11:00 AM – 12:30 PM', 'Tr. David Miller', 'Humanities Lounge', 'Full Year', 'Critical literacy, essay composition, academic speech, and global perspective analysis.', 1)
ON CONFLICT (`id`) DO UPDATE SET
  `name` = excluded.`name`,
  `code` = excluded.`code`,
  `grade` = excluded.`grade`,
  `category` = excluded.`category`,
  `time` = excluded.`time`,
  `instructor` = excluded.`instructor`,
  `room` = excluded.`room`,
  `credits` = excluded.`credits`,
  `description` = excluded.`description`;

-- 3. BULLETIN NOTICES SEED
INSERT INTO `bulletin_notices` (`id`, `title`, `date`, `type`, `content`, `is_pinned`)
VALUES
  (1, 'Pearson Edexcel May/June 2026 Examination Timetable Released', '2026-08-15', 'Official Notice', 'Official timetable schedules for Pearson IGCSE and Pearson IAL have been verified and pinned on the academic notice board.', 1),
  (2, 'Diagnostic Placement Assessments for 2026–2027 Enrollment', '2026-08-18', 'Academic', 'Prospective scholars can now book diagnostic assessments in Mathematics and English for all Yangon and Mawlamyine campuses.', 1),
  (3, 'Inter-Campus Robotics & IoT Innovation Exhibition', '2026-08-20', 'General', 'Annual showcase featuring AI autonomous robot obstacle runs, IoT weather telemetry stations, and science inquiry projects.', 0)
ON CONFLICT (`id`) DO UPDATE SET
  `title` = excluded.`title`,
  `date` = excluded.`date`,
  `type` = excluded.`type`,
  `content` = excluded.`content`,
  `is_pinned` = excluded.`is_pinned`;

-- 4. CLUBS SEED
INSERT INTO `clubs` (`id`, `name`, `category`, `icon`, `members`, `meeting_time`, `leadership`, `description`, `image`, `campus`, `status`, `is_active`)
VALUES
  (1, 'Robotics, IoT & AI Club', 'STEM & Tech', 'smart_toy', '35+ Scholars', 'Wednesdays · 03:45 PM – 05:15 PM', 'Student Lead: Min Khant | Advisor: Dr. Htet Aung Lin', 'Designing microcontroller-driven robotics, computer vision AI agents, and environmental telemetry sensor kits.', '/images/engineering.avif', 'both-campuses', 'published', 1),
  (2, 'Model United Nations & Debate Society', 'Academic & Debate', 'gavel', '28+ Scholars', 'Tuesdays · 04:00 PM – 05:30 PM', 'Student Lead: Thinzar Myat | Advisor: Tr. David Miller', 'Fostering geopolitical analysis, persuasive academic rhetoric, global crisis resolution, and parliamentary debate skills.', '/images/business.jpg', 'both-campuses', 'published', 1),
  (3, 'Newton Science Discovery Society', 'STEM & Science', 'science', '30+ Scholars', 'Thursdays · 03:45 PM – 05:00 PM', 'Student Lead: Aung Kaung Set | Advisor: Dr. Su Mon Kyaw', 'Empirical laboratory inquiries, titration masterclasses, astronomical observations, and pre-university research papers.', '/images/g2.jpg', 'both-campuses', 'published', 1),
  (4, 'Digital Arts & Yearbook Guild', 'Creative Arts', 'palette', '22+ Scholars', 'Mondays · 03:30 PM – 05:00 PM', 'Student Lead: Hnin Wint Wah | Advisor: Daw May Zin Thet', 'Digital illustration, photographic photojournalism, UI design, and editing the annual Hinthar Alumni Chronicle.', '/images/g8.jpg', 'both-campuses', 'published', 1),
  (5, 'Badminton & Athletic Society', 'Sports & Fitness', 'sports_tennis', '40+ Scholars', 'Fridays · 04:00 PM – 06:00 PM', 'Student Lead: Kyaw Swar Win | Advisor: Coach Myo Min', 'Fitness conditioning, agility drills, inter-house badminton leagues, and physical excellence development.', '/images/g7.jpg', 'both-campuses', 'published', 1)
ON CONFLICT (`id`) DO UPDATE SET
  `name` = excluded.`name`,
  `category` = excluded.`category`,
  `icon` = excluded.`icon`,
  `members` = excluded.`members`,
  `meeting_time` = excluded.`meeting_time`,
  `leadership` = excluded.`leadership`,
  `description` = excluded.`description`,
  `image` = excluded.`image`,
  `campus` = excluded.`campus`;

-- 5. ACTIVITIES SEED
INSERT INTO `activities` (`id`, `club_id`, `title`, `category`, `date`, `month`, `day`, `time`, `location`, `description`, `image`, `status`, `campus`, `featured`, `review_status`, `is_active`)
VALUES
  (1, 1, 'Annual STEM & Robotics Innovation Fair 2026', 'science', 'September 18, 2026', 'SEP', '18', '09:00 AM – 03:30 PM', 'Main Auditorium & Innovation Labs', 'Showcasing student-engineered AI models, IoT environmental sensors, physics experiments, and autonomous robot obstacle runs.', '/images/engineering.avif', 'Active Registration', 'both-campuses', 1, 'published', 1),
  (2, 3, 'Pearson Edexcel IGCSE & IAL Mock Exam Series', 'academic', 'October 05, 2026', 'OCT', '05', '08:30 AM – 01:00 PM', 'Exam Hall A & B (Hlaing Campus)', 'Comprehensive British Council & Pearson standard trial examinations with full examiner mark schemes and personalized feedback sessions.', '/images/g4.jpg', 'Upcoming', 'both-campuses', 1, 'published', 1),
  (3, 5, 'Inter-House Badminton & Table Tennis Tournament', 'sports', 'November 12, 2026', 'NOV', '12', '01:00 PM – 05:00 PM', 'Hinthar Sports Complex', 'Annual house championship featuring singles, doubles, and faculty-student exhibition matches to build camaraderie and sportsmanship.', '/images/g7.jpg', 'Upcoming', 'both-campuses', 0, 'published', 1),
  (4, 2, 'Global Perspectives & Model United Nations (MUN)', 'cultural', 'November 25, 2026', 'NOV', '25', '10:00 AM – 04:00 PM', 'Conference Hall', 'Student delegates debate geopolitical solutions, climate resilience, and economic sustainability in a formal diplomatic simulation.', '/images/business.jpg', 'Upcoming', 'both-campuses', 0, 'published', 1),
  (5, 4, 'International Cultural Diversity Festival', 'cultural', 'December 15, 2026', 'DEC', '15', '09:00 AM – 04:00 PM', 'Campus Courtyard', 'Celebrating world cultures with traditional culinary booths, musical performances, national attire parades, and art displays.', '/images/g6.jpg', 'Upcoming', 'both-campuses', 0, 'published', 1),
  (6, NULL, 'Class of 2026 Graduation & Academic Awards Ceremony', 'academic', 'July 20, 2026', 'JUL', '20', '10:00 AM – 02:00 PM', 'Grand Ballroom & Live Stream', 'Honoring our Pearson Edexcel IGCSE and International A-Level graduates with distinction medals and university scholarship recognition.', '/images/graduation.jpg', 'Past Highlight', 'both-campuses', 1, 'published', 1)
ON CONFLICT (`id`) DO UPDATE SET
  `title` = excluded.`title`,
  `category` = excluded.`category`,
  `date` = excluded.`date`,
  `month` = excluded.`month`,
  `day` = excluded.`day`,
  `time` = excluded.`time`,
  `location` = excluded.`location`,
  `description` = excluded.`description`,
  `image` = excluded.`image`,
  `status` = excluded.`status`,
  `campus` = excluded.`campus`,
  `featured` = excluded.`featured`;

-- 6. YEARBOOK ALUMNI SEED
INSERT INTO `yearbook_alumni` (`id`, `name`, `category`, `role`, `destination`, `subjects`, `quote`, `image`, `badge`, `campus`, `status`)
VALUES
  (1, 'Lin Myat Thu', 'Class of 2026', 'Valedictorian & Student Council President', 'Imperial College London · Aeronautical Eng', 'Pure Maths (A*), Further Maths (A*), Physics (A*)', 'At Hinthar, rigorous British education paired with passionate faculty mentorship gave me the foundation to reach global engineering frontiers.', '/images/g4.jpg', 'World Top Scorer', 'both-campuses', 'published'),
  (2, 'Su Myat Noe', 'Class of 2026', 'High Distinction Scholar & Debate Captain', 'National University of Singapore (NUS) · Computer Science', 'Maths (A*), Computer Science (A*), Physics (A*)', 'The Turing Computing Lab and coding societies at Hinthar taught me not just syntax, but structural analytical thinking.', '/images/g6.jpg', 'Top Distinction', 'both-campuses', 'published'),
  (3, 'Kaung Sithu', 'Class of 2025', 'ASEAN Scholar & Newton Society Lead', 'University of Melbourne · Biomedical Science', 'Biology (A*), Chemistry (A*), Pure Maths (A)', 'Hands-on lab experiments and individual research papers gave me an immense head start in international university medicine pathways.', '/images/g5.jpg', 'ASEAN Scholar Candidate', 'both-campuses', 'published'),
  (4, 'Yamin Shwe Yee', 'Class of 2025', 'Senior Prefect & Arts Guild Curator', 'King''s College London · Economics & International Relations', 'Economics (A*), Business Studies (A*), Maths (A)', 'Hinthar is a family where every student is challenged to discover their authentic academic voice and lead with global purpose.', '/images/g8.jpg', 'Dean''s Honour Roll', 'both-campuses', 'published'),
  (5, 'Aung Phone Myint', 'Class of 2024', 'Pearson World Medal Winner in Pure Mathematics', 'University of Manchester · Actuarial Science', 'Pure Maths (A*), Physics (A*), Chemistry (A*)', 'Scoring the highest mark in Myanmar for Pearson Pure Mathematics was only possible through our teachers'' relentless dedication.', '/images/g7.jpg', 'Pearson World Distinction', 'both-campuses', 'published')
ON CONFLICT (`id`) DO UPDATE SET
  `name` = excluded.`name`,
  `category` = excluded.`category`,
  `role` = excluded.`role`,
  `destination` = excluded.`destination`,
  `subjects` = excluded.`subjects`,
  `quote` = excluded.`quote`,
  `image` = excluded.`image`,
  `badge` = excluded.`badge`,
  `campus` = excluded.`campus`;
