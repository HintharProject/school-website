-- ==============================================================================
-- HINTHAR INTERNATIONAL SCHOOL — COMPLETE POSTGRESQL SCHEMA & SECURITY SETUP
-- Database: Supabase PostgreSQL (Project Ref: ytmylxemqrsjxdvrthxx)
-- Safe for first-time setup or re-running on existing database instances.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS & SECURITY HELPER FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to fetch current authenticated user's role without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.user_profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, (auth.jwt() -> 'app_metadata' ->> 'role'));
END;
$$;

-- Helper function to check if current caller is Principal or Staff Admin
CREATE OR REPLACE FUNCTION public.is_admin_or_faculty()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.get_auth_user_role() IN ('principal', 'staff_admin');
END;
$$;

-- ------------------------------------------------------------------------------
-- 1. USER PROFILES TABLE (3-Tier Role-Based Access Control)
-- Roles: 'principal' (Superadmin), 'staff_admin' (Faculty/Admissions), 'student' (Data Entry Contributor)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('principal', 'staff_admin', 'student')),
  title TEXT,
  campus_id TEXT NOT NULL DEFAULT 'ywarma-campus',
  grade TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist even if user_profiles already existed from an older schema version
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS campus_id TEXT NOT NULL DEFAULT 'ywarma-campus';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- Enable RLS for Profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Staff and Principal read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Principals manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Staff manage student profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Staff update student profiles" ON public.user_profiles;

-- 1. Users can read their own profile
CREATE POLICY "Users read own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

-- 2. Principals and staff can read all profiles (Uses SECURITY DEFINER helper to prevent recursion)
CREATE POLICY "Staff and Principal read all profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (public.is_admin_or_faculty());

-- 3. Principals can manage (insert/update/delete) all profiles
CREATE POLICY "Principals manage all profiles" ON public.user_profiles
  FOR ALL TO authenticated
  USING (public.get_auth_user_role() = 'principal')
  WITH CHECK (public.get_auth_user_role() = 'principal');

-- 4. Staff can insert and update student profiles only
CREATE POLICY "Staff manage student profiles" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    role = 'student' AND public.get_auth_user_role() = 'staff_admin'
  );

CREATE POLICY "Staff update student profiles" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (
    role = 'student' AND public.get_auth_user_role() = 'staff_admin'
  )
  WITH CHECK (
    role = 'student' AND public.get_auth_user_role() = 'staff_admin'
  );

-- ------------------------------------------------------------------------------
-- AUTOMATED USER PROVISIONING TRIGGER
-- Synchronizes auth.users inserts to public.user_profiles automatically
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, title, campus_id, grade, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_app_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_app_meta_data->>'role',
      NEW.raw_user_meta_data->>'role',
      'student'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'title',
      NEW.raw_app_meta_data->>'title',
      'Student Contributor'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'campus_id',
      'ywarma-campus'
    ),
    NEW.raw_user_meta_data->>'grade',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    campus_id = EXCLUDED.campus_id,
    grade = EXCLUDED.grade,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. CAMPUSES TABLE (3 in Yangon & 1 in Mawlamyine)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campuses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL CHECK (city IN ('Yangon', 'Mawlamyine')),
  tagline TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  office_hours TEXT NOT NULL DEFAULT 'Mon–Sat: 08:30 AM – 05:00 PM',
  grades_served TEXT NOT NULL,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist on existing campuses table
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Yangon';
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS office_hours TEXT DEFAULT 'Mon–Sat: 08:30 AM – 05:00 PM';
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS grades_served TEXT;
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS facilities TEXT[] DEFAULT '{}';
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_campuses_city ON public.campuses(city);
CREATE INDEX IF NOT EXISTS idx_campuses_active ON public.campuses(is_active);

-- Enable RLS
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active campuses" ON public.campuses;
DROP POLICY IF EXISTS "Staff and Principal manage campuses" ON public.campuses;

-- Campuses Policies: Public can read active campuses, Principal and staff admins can edit
CREATE POLICY "Public read active campuses" ON public.campuses
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Staff and Principal manage campuses" ON public.campuses
  FOR ALL TO authenticated
  USING (public.is_admin_or_faculty())
  WITH CHECK (public.is_admin_or_faculty());

-- ------------------------------------------------------------------------------
-- 3. YEARBOOK ALUMNI TABLE (Student Submissions & Faculty Review Workflow)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.yearbook_alumni (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Class of 2026', 'Class of 2025', 'Class of 2024', 'University Placements', 'Competitions')),
  role TEXT NOT NULL,
  destination TEXT,
  subjects TEXT,
  quote TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '/images/g5.jpg',
  badge TEXT,
  campus TEXT DEFAULT 'both-campuses',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending_review', 'archived')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist on existing yearbook_alumni table
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS subjects TEXT;
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '/images/g5.jpg';
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS campus TEXT DEFAULT 'both-campuses';
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.yearbook_alumni ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_yearbook_category ON public.yearbook_alumni(category);
CREATE INDEX IF NOT EXISTS idx_yearbook_status ON public.yearbook_alumni(status);
CREATE INDEX IF NOT EXISTS idx_yearbook_submitted_by ON public.yearbook_alumni(submitted_by);

-- Enable RLS
ALTER TABLE public.yearbook_alumni ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published yearbook alumni" ON public.yearbook_alumni;
DROP POLICY IF EXISTS "Students read own yearbook submissions" ON public.yearbook_alumni;
DROP POLICY IF EXISTS "Students submit yearbook entry for review" ON public.yearbook_alumni;
DROP POLICY IF EXISTS "Staff and Principal manage all yearbook alumni" ON public.yearbook_alumni;

-- Public can read only published yearbook alumni
CREATE POLICY "Public read published yearbook alumni" ON public.yearbook_alumni
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- Students can read their own submissions (even if pending review)
CREATE POLICY "Students read own yearbook submissions" ON public.yearbook_alumni
  FOR SELECT TO authenticated
  USING (submitted_by = (select auth.uid()));

-- Students can insert submissions with status = 'pending_review'
CREATE POLICY "Students submit yearbook entry for review" ON public.yearbook_alumni
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending_review' AND submitted_by = (select auth.uid())
  );

-- Staff and Principal have full management of yearbook alumni
CREATE POLICY "Staff and Principal manage all yearbook alumni" ON public.yearbook_alumni
  FOR ALL TO authenticated
  USING (public.is_admin_or_faculty())
  WITH CHECK (public.is_admin_or_faculty());

-- ------------------------------------------------------------------------------
-- 4. CLUBS & SOCIETIES TABLE (Student Activity Proposals & Moderation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clubs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('STEM & Tech', 'Academic & Debate', 'STEM & Science', 'Creative Arts', 'Sports & Fitness')),
  icon TEXT NOT NULL DEFAULT 'groups',
  members TEXT NOT NULL DEFAULT '25+ Scholars',
  meeting_time TEXT NOT NULL,
  leadership TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '/images/g2.jpg',
  campus TEXT DEFAULT 'both-campuses',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending_review', 'archived')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist on existing clubs table
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'groups';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS members TEXT DEFAULT '25+ Scholars';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS meeting_time TEXT DEFAULT 'Weekly';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS leadership TEXT DEFAULT 'Student Council Lead';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '/images/g2.jpg';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS campus TEXT DEFAULT 'both-campuses';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_clubs_category ON public.clubs(category);
CREATE INDEX IF NOT EXISTS idx_clubs_active ON public.clubs(is_active);
CREATE INDEX IF NOT EXISTS idx_clubs_status ON public.clubs(status);

-- Enable RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active published clubs" ON public.clubs;
DROP POLICY IF EXISTS "Students propose club activities" ON public.clubs;
DROP POLICY IF EXISTS "Staff and Principal manage clubs" ON public.clubs;

-- Public can read active, published clubs
CREATE POLICY "Public read active published clubs" ON public.clubs
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND status = 'published');

-- Students can insert club proposals
CREATE POLICY "Students propose club activities" ON public.clubs
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending_review' AND submitted_by = (select auth.uid())
  );

-- Staff and Principal can manage all clubs
CREATE POLICY "Staff and Principal manage clubs" ON public.clubs
  FOR ALL TO authenticated
  USING (public.is_admin_or_faculty())
  WITH CHECK (public.is_admin_or_faculty());

-- ------------------------------------------------------------------------------
-- 5. ADMISSIONS APPLICATIONS TABLE (Confidential Pipeline)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admissions (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  nationality TEXT DEFAULT 'Myanmar',
  grade TEXT NOT NULL,
  program_level TEXT,
  academic_stream TEXT,
  selected_subjects TEXT[] DEFAULT '{}',
  intended_start_term TEXT,
  study_mode TEXT DEFAULT 'Full-Time On-Campus',
  previous_school TEXT,
  parent_name TEXT,
  relationship TEXT DEFAULT 'Parent',
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  address TEXT,
  emergency_contact TEXT,
  medical_notes TEXT,
  how_heard TEXT DEFAULT 'School Website',
  submitted_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assessment Scheduled', 'Approved', 'Declined')),
  assessment_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist on existing admissions table
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Myanmar';
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS program_level TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS academic_stream TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS selected_subjects TEXT[] DEFAULT '{}';
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS intended_start_term TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS study_mode TEXT DEFAULT 'Full-Time On-Campus';
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS previous_school TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS relationship TEXT DEFAULT 'Parent';
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS medical_notes TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS how_heard TEXT DEFAULT 'School Website';
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS submitted_date TEXT DEFAULT to_char(now(), 'YYYY-MM-DD');
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS assessment_date TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_grade ON public.admissions(grade);
CREATE INDEX IF NOT EXISTS idx_admissions_created ON public.admissions(created_at DESC);

-- Enable RLS
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit admission application" ON public.admissions;
DROP POLICY IF EXISTS "Staff and Principal manage admissions" ON public.admissions;

-- Anyone can submit an admission application (INSERT only)
CREATE POLICY "Public can submit admission application" ON public.admissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated Principal and Staff Administrators can view, update, and delete applications
CREATE POLICY "Staff and Principal manage admissions" ON public.admissions
  FOR ALL TO authenticated
  USING (public.is_admin_or_faculty())
  WITH CHECK (public.is_admin_or_faculty());

-- ------------------------------------------------------------------------------
-- 6. CLASSES & COURSES TABLE (Syllabi & Timetables)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes_courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  grade TEXT NOT NULL CHECK (grade IN ('Lower Secondary (Year 7–9)', 'Pearson IGCSE', 'Pearson IAL')),
  category TEXT NOT NULL CHECK (category IN ('STEM', 'Business', 'Computing', 'Languages')),
  time TEXT NOT NULL,
  instructor TEXT NOT NULL,
  room TEXT,
  credits TEXT DEFAULT 'Core',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist on existing classes_courses table
ALTER TABLE public.classes_courses ADD COLUMN IF NOT EXISTS room TEXT;
ALTER TABLE public.classes_courses ADD COLUMN IF NOT EXISTS credits TEXT DEFAULT 'Core';
ALTER TABLE public.classes_courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.classes_courses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.classes_courses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.classes_courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_classes_grade ON public.classes_courses(grade);
CREATE INDEX IF NOT EXISTS idx_classes_category ON public.classes_courses(category);
CREATE INDEX IF NOT EXISTS idx_classes_active ON public.classes_courses(is_active);

-- Enable RLS
ALTER TABLE public.classes_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read classes" ON public.classes_courses;
DROP POLICY IF EXISTS "Staff and Principal manage classes" ON public.classes_courses;

CREATE POLICY "Public read classes" ON public.classes_courses
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Staff and Principal manage classes" ON public.classes_courses
  FOR ALL TO authenticated
  USING (public.is_admin_or_faculty())
  WITH CHECK (public.is_admin_or_faculty());

-- ------------------------------------------------------------------------------
-- 7. BULLETIN NOTICES TABLE (Announcements & Academic Updates)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bulletin_notices (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Official Notice', 'Academic', 'General')),
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist on existing bulletin_notices table
ALTER TABLE public.bulletin_notices ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.bulletin_notices ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.bulletin_notices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_bulletins_type ON public.bulletin_notices(type);
CREATE INDEX IF NOT EXISTS idx_bulletins_created ON public.bulletin_notices(created_at DESC);

-- Enable RLS
ALTER TABLE public.bulletin_notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read bulletin notices" ON public.bulletin_notices;
DROP POLICY IF EXISTS "Staff and Principal manage bulletin notices" ON public.bulletin_notices;

CREATE POLICY "Public read bulletin notices" ON public.bulletin_notices
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Staff and Principal manage bulletin notices" ON public.bulletin_notices
  FOR ALL TO authenticated
  USING (public.is_admin_or_faculty())
  WITH CHECK (public.is_admin_or_faculty());

-- ------------------------------------------------------------------------------
-- 8. STORAGE BUCKET & ASSETS POLICY
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'school-assets',
      'school-assets',
      true,
      8388608,
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']
    )
    ON CONFLICT (id) DO NOTHING;

    -- Public can read assets from school-assets bucket
    DROP POLICY IF EXISTS "Public read school assets" ON storage.objects;
    CREATE POLICY "Public read school assets" ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id = 'school-assets');

    -- Faculty & Staff can upload, update, and delete in school-assets bucket
    DROP POLICY IF EXISTS "Staff and Principal upload assets" ON storage.objects;
    CREATE POLICY "Staff and Principal upload assets" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'school-assets' AND
        public.is_admin_or_faculty()
      );

    DROP POLICY IF EXISTS "Staff and Principal update assets" ON storage.objects;
    CREATE POLICY "Staff and Principal update assets" ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'school-assets' AND
        public.is_admin_or_faculty()
      )
      WITH CHECK (
        bucket_id = 'school-assets' AND
        public.is_admin_or_faculty()
      );

    DROP POLICY IF EXISTS "Staff and Principal delete assets" ON storage.objects;
    CREATE POLICY "Staff and Principal delete assets" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'school-assets' AND
        public.is_admin_or_faculty()
      );
  END IF;
END $$;

-- ==============================================================================
-- 9. INITIAL SEED DATA
-- ==============================================================================

-- Campuses Seed
INSERT INTO public.campuses (id, name, city, tagline, address, phone, email, office_hours, grades_served, facilities, image_url, is_active)
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
    ARRAY['Pearson Exam Center', 'Turing Computer Lab', 'Newton Physics & Chemistry Labs', 'British Council Testing Suite', 'Auditorium & Library'],
    '/images/heroImg.png',
    true
  ),
  (
    'shwe-padauk-campus',
    'Shwe Padauk Campus',
    'Yangon',
    'Senior STEM & Robotics Innovation Center',
    'Shwe Padauk Road, Yangon, Myanmar',
    '+95 9 894 332222',
    'shwepadauk@hinthar.education',
    'Mon–Sat: 08:30 AM – 05:00 PM',
    'Pearson IGCSE & Pearson IAL (STEM Specialized)',
    ARRAY['AI & Robotics Studio', 'Advanced Chemistry Lab', 'Bio-Science Incubator', 'Collaborative Study Pods', 'Student Recreation Hub'],
    '/images/specialisations/stemSpecialisation.png',
    true
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
    ARRAY['Digital Media Lab', 'Music & Performing Arts Studio', 'Badminton & Fitness Arena', 'Language Immersion Lounge', 'Junior Science Hub'],
    '/images/specialisations/creativeSpecialisation.png',
    true
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
    ARRAY['Full-Scale Science Labs', 'Computer Lab & Fiber Network', 'Extensive British Library', 'Multi-Purpose Sports Court', 'Hostel Facilities'],
    '/images/specialisations/businessSpecialisation.png',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  tagline = EXCLUDED.tagline,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  grades_served = EXCLUDED.grades_served,
  facilities = EXCLUDED.facilities,
  image_url = EXCLUDED.image_url;

-- Courses Seed
INSERT INTO public.classes_courses (id, name, code, grade, category, time, instructor, room, credits, description, is_active)
VALUES
  ('course-ial-math', 'Pure Mathematics (P1 – P4)', 'WMA11 / WMA12', 'Pearson IAL', 'STEM', 'Mon, Wed, Fri • 08:30 AM – 10:00 AM', 'Dr. Kaung Myat Htut & U Than Win', 'Mathematics Lab 2', '4 Modules', 'Advanced calculus, differential equations, vectors, coordinate geometry, and sequence & series.', true),
  ('course-ial-physics', 'Advanced Physics & Practical Lab (Units 1–6)', 'WPH11 / WPH14', 'Pearson IAL', 'STEM', 'Tue, Thu • 10:30 AM – 12:30 PM', 'Dr. Htet Aung Lin', 'Newton Science Lab', 'Units 1–6', 'Mechanics, electrical circuits, thermodynamics, fields, waves, nuclear physics and empirical experiments.', true),
  ('course-igcse-cs', 'Pearson IGCSE Computer Science', '4CP0', 'Pearson IGCSE', 'Computing', 'Mon, Thu • 01:00 PM – 02:30 PM', 'Daw May Zin Thet', 'Turing Digital Lab', '2 Papers', 'Algorithms, Python software architecture, data structures, network security, and computer systems.', true),
  ('course-igcse-bio-chem', 'Pearson IGCSE Chemistry & Biology', '4CH1 / 4BI1', 'Pearson IGCSE', 'STEM', 'Mon, Wed, Fri • 10:30 AM – 12:00 PM', 'Dr. Su Mon Kyaw', 'Chemistry & Bio Lab', 'Core & Extended', 'Chemical bonding, stoichiometry, human physiology, genetics, organic synthesis, and laboratory investigation.', true),
  ('course-igcse-econ', 'Economics & Business Studies', '4EC1 / 4BS1', 'Pearson IGCSE', 'Business', 'Tue, Thu • 02:00 PM – 03:30 PM', 'U Myo Min Tun (MBA)', 'Economics Seminar Room', '2 Papers', 'Micro & macroeconomics, market dynamics, international trade, financial statements, and business strategy.', true),
  ('course-sec-stem', 'Lower Secondary STEM Discovery & Math (Year 7–9)', 'SEC-MATH-08', 'Lower Secondary (Year 7–9)', 'STEM', 'Daily • 09:00 AM – 10:30 AM', 'Tr. Rachel Evans', 'Room 104 (Secondary Wing)', 'Full Year', 'Pre-algebra, introductory physics concepts, scientific inquiry, and global perspective workshops.', true),
  ('course-sec-eng', 'Lower Secondary English & Global Perspectives (Year 7–9)', 'SEC-ENG-09', 'Lower Secondary (Year 7–9)', 'Languages', 'Daily • 11:00 AM – 12:30 PM', 'Tr. David Miller', 'Humanities Lounge', 'Full Year', 'Critical literacy, essay composition, academic speech, and global perspective analysis.', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  grade = EXCLUDED.grade,
  category = EXCLUDED.category,
  time = EXCLUDED.time,
  instructor = EXCLUDED.instructor,
  room = EXCLUDED.room,
  credits = EXCLUDED.credits,
  description = EXCLUDED.description;
