import { sql, relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ==============================================================================
// 1. BETTER AUTH CORE SCHEMA (SQLite / D1)
// ==============================================================================

export const users = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    image: text("image"),
    role: text("role").notNull().default("student"), // "admin" | "student"
    status: text("status").notNull().default("active"), // "active" | "inactive" | "suspended"
    title: text("title"),
    campusId: text("campus_id").default("ywarma-campus"),
    grade: text("grade"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_user_email").on(table.email),
    index("idx_user_role").on(table.role),
    index("idx_user_status").on(table.status),
  ]
);

export const sessions = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("idx_session_token").on(table.token),
    index("idx_session_user").on(table.userId),
  ]
);

export const accounts = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    issuer: text("issuer").notNull().default("local:credential"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_account_user").on(table.userId),
    index("idx_account_provider").on(table.providerId, table.accountId),
    index("idx_account_issuer").on(table.issuer),
  ]
);

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const invitations = sqliteTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    role: text("role").notNull().default("student"), // "admin" | "student"
    title: text("title"),
    campusId: text("campus_id").default("ywarma-campus"),
    grade: text("grade"),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"), // "pending" | "accepted" | "cancelled" | "expired"
    invitedBy: text("invited_by").references(() => users.id, { onDelete: "set null" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    acceptedAt: integer("accepted_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_invitation_token").on(table.token),
    index("idx_invitation_email").on(table.email),
    index("idx_invitation_status").on(table.status),
  ]
);

// ==============================================================================
// 2. SCHOOL APPLICATION DOMAIN ENTITIES
// ==============================================================================

// Campuses Table — bilingual EN/MY for public fields (MY optional, fallback to EN)
export const campuses = sqliteTable(
  "campuses",
  {
    id: text("id").primaryKey(), // "ywarma-campus", "shwe-padauk-campus", etc.
    name: text("name").notNull(),
    nameMy: text("name_my"),
    city: text("city").notNull(), // "Yangon" | "Mawlamyine"
    tagline: text("tagline").notNull(),
    taglineMy: text("tagline_my"),
    address: text("address").notNull(),
    addressMy: text("address_my"),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    officeHours: text("office_hours").notNull().default("Mon–Sat: 08:30 AM – 05:00 PM"),
    gradesServed: text("grades_served").notNull(),
    facilities: text("facilities").notNull().default("[]"), // JSON string array
    imageUrl: text("image_url").notNull(),
    mapUrl: text("map_url"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_campuses_city").on(table.city),
    index("idx_campuses_active").on(table.isActive),
  ]
);

// Classes & Courses Table
export const classesCourses = sqliteTable(
  "classes_courses",
  {
    id: text("id").primaryKey(), // "course-ial-math", etc.
    name: text("name").notNull(),
    code: text("code").notNull(),
    grade: text("grade").notNull(), // "Lower Secondary (Year 7–9)" | "Pearson IGCSE" | "Pearson IAL"
    category: text("category").notNull(), // "STEM" | "Business" | "Computing" | "Languages"
    time: text("time").notNull(),
    instructor: text("instructor").notNull(),
    room: text("room"),
    credits: text("credits").default("Core"),
    description: text("description"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_classes_grade").on(table.grade),
    index("idx_classes_category").on(table.category),
    index("idx_classes_active").on(table.isActive),
  ]
);

// Bulletin Notices Table
export const bulletinNotices = sqliteTable(
  "bulletin_notices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    date: text("date").notNull(),
    type: text("type").notNull(), // "Official Notice" | "Academic" | "General"
    content: text("content").notNull(),
    isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_bulletins_type").on(table.type),
    index("idx_bulletins_pinned").on(table.isPinned),
  ]
);

// Admissions Pipeline Table
export const admissions = sqliteTable(
  "admissions",
  {
    id: text("id").primaryKey(), // "HIS-2026-XXXX"
    studentName: text("student_name").notNull(),
    dateOfBirth: text("date_of_birth"),
    gender: text("gender"), // "Male" | "Female" | "Other"
    nationality: text("nationality").default("Myanmar"),
    grade: text("grade").notNull(),
    programLevel: text("program_level"),
    academicStream: text("academic_stream"),
    selectedSubjects: text("selected_subjects").default("[]"), // JSON string array
    intendedStartTerm: text("intended_start_term"),
    studyMode: text("study_mode").default("Full-Time On-Campus"),
    previousSchool: text("previous_school"),
    parentName: text("parent_name"),
    relationship: text("relationship").default("Parent"),
    parentEmail: text("parent_email").notNull(),
    parentPhone: text("parent_phone").notNull(),
    address: text("address"),
    emergencyContact: text("emergency_contact"),
    medicalNotes: text("medical_notes"),
    howHeard: text("how_heard").default("School Website"),
    submittedDate: text("submitted_date").notNull(),
    status: text("status").notNull().default("Pending"), // "Pending" | "Assessment Scheduled" | "Approved" | "Declined"
    assessmentDate: text("assessment_date"),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_admissions_status").on(table.status),
    index("idx_admissions_grade").on(table.grade),
    index("idx_admissions_created").on(table.createdAt),
  ]
);

// Clubs Table — bilingual EN/MY for description (name stays EN per no-translate rule)
export const clubs = sqliteTable(
  "clubs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    category: text("category").notNull(), // "STEM & Tech" | "Academic & Debate" | "STEM & Science" | "Creative Arts" | "Sports & Fitness"
    icon: text("icon").notNull().default("groups"),
    members: text("members").notNull().default("25+ Scholars"),
    meetingTime: text("meeting_time").notNull(),
    leadership: text("leadership").notNull(),
    description: text("description").notNull(),
    descriptionMy: text("description_my"),
    image: text("image").notNull().default("/images/g2.jpg"),
    campus: text("campus").default("both-campuses"),
    status: text("status").notNull().default("published"), // "published" | "pending_review" | "archived"
    submittedBy: text("submitted_by").references(() => users.id, { onDelete: "set null" }),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_clubs_category").on(table.category),
    index("idx_clubs_status").on(table.status),
    index("idx_clubs_active").on(table.isActive),
  ]
);

// Activities Table (Linked to Clubs)
export const activities = sqliteTable(
  "activities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clubId: integer("club_id").references(() => clubs.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    category: text("category").notNull(), // "academic" | "sports" | "cultural" | "science"
    date: text("date").notNull(),
    month: text("month").notNull(),
    day: text("day").notNull(),
    time: text("time").notNull(),
    location: text("location").notNull(),
    description: text("description").notNull(),
    image: text("image").notNull().default("/images/engineering.avif"),
    status: text("status").notNull().default("Upcoming"), // "Upcoming" | "Active Registration" | "Past Highlight"
    campus: text("campus").default("both-campuses"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    reviewStatus: text("review_status").notNull().default("published"), // "published" | "pending_review" | "archived"
    submittedBy: text("submitted_by").references(() => users.id, { onDelete: "set null" }),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_activities_club").on(table.clubId),
    index("idx_activities_status").on(table.status),
    index("idx_activities_review").on(table.reviewStatus),
    index("idx_activities_active").on(table.isActive),
  ]
);

// Yearbook & Alumni Table
export const yearbookAlumni = sqliteTable(
  "yearbook_alumni",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    category: text("category").notNull(), // "Class of 2026" | "Class of 2025" | "Class of 2024" | "University Placements" | "Competitions"
    role: text("role").notNull(),
    destination: text("destination"),
    subjects: text("subjects"),
    quote: text("quote").notNull(),
    image: text("image").notNull().default("/images/g5.jpg"),
    badge: text("badge"),
    campus: text("campus").default("both-campuses"),
    status: text("status").notNull().default("published"), // "published" | "pending_review" | "archived"
    submittedBy: text("submitted_by").references(() => users.id, { onDelete: "set null" }),
    reviewerNotes: text("reviewer_notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_yearbook_category").on(table.category),
    index("idx_yearbook_status").on(table.status),
    index("idx_yearbook_submitted_by").on(table.submittedBy),
  ]
);

// File Assets Metadata Table (Backed by R2)
export const fileAssets = sqliteTable(
  "file_assets",
  {
    id: text("id").primaryKey(),
    objectKey: text("object_key").notNull().unique(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    folder: text("folder").notNull().default("general"),
    publicUrl: text("public_url").notNull(),
    uploadedBy: text("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_file_assets_folder").on(table.folder),
    index("idx_file_assets_uploaded_by").on(table.uploadedBy),
  ]
);

// Audit Logs Table
export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actorId: text("actor_id"),
    actorEmail: text("actor_email"),
    actorRole: text("actor_role"),
    action: text("action").notNull(), // e.g. "ADMIN_CREATED_CLUB", "ADMIN_INVITED_USER", etc.
    resource: text("resource").notNull(), // "campuses", "classes", "clubs", "users", etc.
    resourceId: text("resource_id"),
    success: integer("success", { mode: "boolean" }).notNull().default(true),
    details: text("details"), // JSON serialized string
    ipAddress: text("ip_address"),
    timestamp: text("timestamp")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_audit_actor").on(table.actorId),
    index("idx_audit_action").on(table.action),
    index("idx_audit_resource").on(table.resource),
    index("idx_audit_timestamp").on(table.timestamp),
  ]
);

// Club Members Table (admin-managed roster; no user account required)
export const clubMembers = sqliteTable(
  "club_members",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clubId: integer("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    studentName: text("student_name").notNull(),
    grade: text("grade"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    notes: text("notes"),
    status: text("status").notNull().default("active"), // "active" | "left"
    addedBy: text("added_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  },
  (table) => [
    index("idx_club_members_club").on(table.clubId),
    index("idx_club_members_status").on(table.status),
  ]
);

// Noticeboard: messages and tasks published by admins (e.g. from the
// Principal's office) to administrators and student contributors.
export const notices = sqliteTable(
  "notices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    priority: text("priority").notNull().default("normal"), // "normal" | "urgent"
    targetType: text("target_type").notNull().default("all"), // "all" | "admins" | "contributors"
    isTask: integer("is_task", { mode: "boolean" }).notNull().default(false),
    dueDate: text("due_date"),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  },
  (table) => [
    index("idx_notices_target").on(table.targetType),
    index("idx_notices_created").on(table.createdAt),
  ]
);

// Per-user acknowledgement/completion of a notice task.
export const noticeReads = sqliteTable(
  "notice_reads",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    noticeId: integer("notice_id")
      .notNull()
      .references(() => notices.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    completedAt: text("completed_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  },
  (table) => [uniqueIndex("idx_notice_read_unique").on(table.noticeId, table.userId)]
);

// ==============================================================================
// 3. RELATIONS DEFINITIONS
// ==============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  invitations: many(invitations),
  clubs: many(clubs),
  activities: many(activities),
  yearbookEntries: many(yearbookAlumni),
  uploadedAssets: many(fileAssets),
}));

export const userRelations = usersRelations;

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const sessionRelations = sessionsRelations;

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const accountRelations = accountsRelations;

export const invitationsRelations = relations(invitations, ({ one }) => ({
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const invitationRelations = invitationsRelations;

export const clubsRelations = relations(clubs, ({ one, many }) => ({
  author: one(users, {
    fields: [clubs.submittedBy],
    references: [users.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  club: one(clubs, {
    fields: [activities.clubId],
    references: [clubs.id],
  }),
  author: one(users, {
    fields: [activities.submittedBy],
    references: [users.id],
  }),
}));

export const yearbookAlumniRelations = relations(yearbookAlumni, ({ one }) => ({
  author: one(users, {
    fields: [yearbookAlumni.submittedBy],
    references: [users.id],
  }),
}));

export const clubMembersRelations = relations(clubMembers, ({ one }) => ({
  club: one(clubs, {
    fields: [clubMembers.clubId],
    references: [clubs.id],
  }),
  adder: one(users, {
    fields: [clubMembers.addedBy],
    references: [users.id],
  }),
}));

export const noticesRelations = relations(notices, ({ one, many }) => ({
  author: one(users, {
    fields: [notices.createdBy],
    references: [users.id],
  }),
  reads: many(noticeReads),
}));

export const noticeReadsRelations = relations(noticeReads, ({ one }) => ({
  notice: one(notices, {
    fields: [noticeReads.noticeId],
    references: [notices.id],
  }),
  user: one(users, {
    fields: [noticeReads.userId],
    references: [users.id],
  }),
}));

// Singular aliases for Better Auth compatibility
export const user = users;
export const session = sessions;
export const account = accounts;
export const verification = verifications;
export const invitation = invitations;

// Editable site content (hero stats, announcements, FAQs, programs, contact info)
export const siteContent = sqliteTable("site_content", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON-encoded payload
  updatedBy: text("updated_by"),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_site_content_updated").on(table.updatedAt),
]);

export const siteContents = siteContent;

// News / Blog / Announcements (admin-managed public posts) — bilingual EN/MY (MY optional)
export const newsPosts = sqliteTable(
  "news_posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    titleMy: text("title_my"),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    excerptMy: text("excerpt_my"),
    body: text("body").notNull(),
    bodyMy: text("body_my"),
    category: text("category").notNull().default("Announcement"),
    image: text("image"),
    status: text("status").notNull().default("published"), // "published" | "draft" | "archived"
    publishedAt: text("published_at"),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  },
  (table) => [
    index("idx_news_status").on(table.status),
    index("idx_news_published").on(table.publishedAt),
  ]
);

// Staff & Teacher Directory (public profiles, admin-managed) — bilingual EN/MY (name stays EN, other fields MY optional)
export const staffProfiles = sqliteTable(
  "staff_profiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    roleMy: text("role_my"),
    department: text("department").notNull().default("General"),
    departmentMy: text("department_my"),
    qualifications: text("qualifications"),
    qualificationsMy: text("qualifications_my"),
    bio: text("bio"),
    bioMy: text("bio_my"),
    email: text("email"),
    phone: text("phone"),
    image: text("image"),
    campusId: text("campus_id").notNull().default("both-campuses"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("published"), // "published" | "archived"
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  },
  (table) => [
    index("idx_staff_status").on(table.status),
    index("idx_staff_sort").on(table.sortOrder),
  ]
);

// Testimonials from parents / alumni (homepage carousel, admin-managed) — bilingual EN/MY (authorName stays EN)
export const testimonials = sqliteTable(
  "testimonials",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    authorName: text("author_name").notNull(),
    authorRole: text("author_role"),
    authorRoleMy: text("author_role_my"),
    quote: text("quote").notNull(),
    quoteMy: text("quote_my"),
    image: text("image"),
    rating: integer("rating"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("published"), // "published" | "archived"
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  },
  (table) => [
    index("idx_testimonials_status").on(table.status),
    index("idx_testimonials_sort").on(table.sortOrder),
  ]
);

// Newsletter subscribers (public footer signup)
export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    status: text("status").notNull().default("active"), // "active" | "unsubscribed"
    source: text("source").notNull().default("footer"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  },
  (table) => [uniqueIndex("idx_newsletter_email").on(table.email)]
);

// ==============================================================================
// 4. TYPES
// ==============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;

export type Campus = typeof campuses.$inferSelect;
export type NewCampus = typeof campuses.$inferInsert;

export type ClassCourse = typeof classesCourses.$inferSelect;
export type NewClassCourse = typeof classesCourses.$inferInsert;

export type BulletinNotice = typeof bulletinNotices.$inferSelect;
export type NewBulletinNotice = typeof bulletinNotices.$inferInsert;

export type Admission = typeof admissions.$inferSelect;
export type NewAdmission = typeof admissions.$inferInsert;

export type Club = typeof clubs.$inferSelect;
export type NewClub = typeof clubs.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type YearbookScholar = typeof yearbookAlumni.$inferSelect;
export type NewYearbookScholar = typeof yearbookAlumni.$inferInsert;

export type ClubMember = typeof clubMembers.$inferSelect;
export type NewClubMember = typeof clubMembers.$inferInsert;

export type Notice = typeof notices.$inferSelect;
export type NewNotice = typeof notices.$inferInsert;

export type NoticeRead = typeof noticeReads.$inferSelect;
export type NewNoticeRead = typeof noticeReads.$inferInsert;

export type FileAsset = typeof fileAssets.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type NewsPost = typeof newsPosts.$inferSelect;
export type NewNewsPost = typeof newsPosts.$inferInsert;

export type StaffProfile = typeof staffProfiles.$inferSelect;
export type NewStaffProfile = typeof staffProfiles.$inferInsert;

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
