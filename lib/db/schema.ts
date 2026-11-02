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
// 2. SCHOOL DOMAIN ENTITIES (5-PAGE ARCHITECTURE)
// ==============================================================================

// Editable Site CMS Content (Brand, Ticker, Hero, About/Principal, Page Headers, Admissions Config, FAQs)
export const siteContent = sqliteTable(
  "site_content",
  {
    key: text("key").primaryKey(),
    value: text("value").notNull(), // JSON-encoded payload
    updatedBy: text("updated_by"),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("idx_site_content_updated").on(table.updatedAt)]
);

export const siteContents = siteContent;

// Campuses Table — bilingual EN/MY for public fields
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
    gradesServed: text("grades_served").notNull(),
    gradesServedMy: text("grades_served_my"),
    facilitiesEn: text("facilities_en").notNull().default("[]"), // JSON string array
    facilitiesMy: text("facilities_my").notNull().default("[]"), // JSON string array
    imageUrl: text("image_url").notNull(),
    galleryUrls: text("gallery_urls").notNull().default("[]"),
    mapUrl: text("map_url"),
    sortOrder: integer("sort_order").notNull().default(0),
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
    index("idx_campuses_sort").on(table.sortOrder),
  ]
);

// Unified Pearson Edexcel Academic Programs (powers Home #classes AND Admissions!)
export const academicPrograms = sqliteTable(
  "academic_programs",
  {
    id: text("id").primaryKey(), // "lower-secondary", "pearson-igcse", "pearson-ial"
    nameEn: text("name_en").notNull(),
    nameMy: text("name_my"),
    badgeEn: text("badge_en"), // e.g. "Year 10 – Year 11"
    badgeMy: text("badge_my"),
    ageRangeEn: text("age_range_en"), // e.g. "Ages 14 – 16"
    ageRangeMy: text("age_range_my"),
    summaryEn: text("summary_en"),
    summaryMy: text("summary_my"),
    descriptionEn: text("description_en"),
    descriptionMy: text("description_my"),
    highlightsEn: text("highlights_en").notNull().default("[]"), // JSON string array
    highlightsMy: text("highlights_my").notNull().default("[]"), // JSON string array
    curriculum: text("curriculum").notNull().default("Pearson Edexcel"),
    category: text("category").notNull().default("pearson"),
    duration: text("duration"),
    campus: text("campus").notNull().default("both"), // "both" | "yangon" | "mawlamyine"
    studyMode: text("study_mode"),
    programLevel: text("program_level"), // "lower_secondary" | "igcse" | "ial"
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_academic_programs_active").on(table.isActive),
    index("idx_academic_programs_campus").on(table.campus),
    index("idx_academic_programs_sort").on(table.sortOrder),
  ]
);

// Pearson Academic Subjects (linked to programs & used in Admissions)
export const academicSubjects = sqliteTable(
  "academic_subjects",
  {
    id: text("id").primaryKey(),
    nameEn: text("name_en").notNull(),
    nameMy: text("name_my"),
    code: text("code"), // e.g. "4PM1", "4PH1", "WMA11"
    level: text("level").notNull().default("Both"), // "Lower Secondary" | "IGCSE" | "IAL" | "Both"
    track: text("track").notNull().default("STEM"), // "STEM" | "Business" | "Computing" | "Languages" | "General"
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_academic_subjects_active").on(table.isActive),
    index("idx_academic_subjects_track").on(table.track),
  ]
);

export const programSubjectLinks = sqliteTable(
  "program_subject_links",
  {
    programId: text("program_id")
      .notNull()
      .references(() => academicPrograms.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => academicSubjects.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("idx_program_subject_unique").on(table.programId, table.subjectId)]
);

// Testimonials from parents & alumni (Home page)
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

// Region-specific, Admin-managed Yearbook Batches
export const yearbookBatches = sqliteTable(
  "yearbook_batches",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    region: text("region").notNull(), // "Yangon" | "Mawlamyine"
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_yearbook_batches_region").on(table.region),
    index("idx_yearbook_batches_active").on(table.isActive),
    uniqueIndex("idx_yearbook_batches_region_name").on(table.region, table.name),
  ]
);

// Student Yearbook Table (Strictly Students & Alumni)
export const yearbookAlumni = sqliteTable(
  "yearbook_alumni",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    batchId: text("batch_id").references(() => yearbookBatches.id, { onDelete: "restrict" }),
    role: text("role").notNull(),
    roleMy: text("role_my"),
    destination: text("destination"),
    subjects: text("subjects"),
    quote: text("quote").notNull(),
    quoteMy: text("quote_my"),
    image: text("image").notNull().default("/images/g5.jpg"),
    badge: text("badge"),
    badgeMy: text("badge_my"),
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
    index("idx_yearbook_batch").on(table.batchId),
    index("idx_yearbook_status").on(table.status),
    index("idx_yearbook_submitted_by").on(table.submittedBy),
  ]
);

// Student Clubs Table
export const clubs = sqliteTable(
  "clubs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    category: text("category").notNull(), // "STEM & Tech" | "Academic & Debate" | "STEM & Science" | "Creative Arts" | "Sports & Fitness"
    icon: text("icon").notNull().default("users"),
    members: text("members").notNull().default("25+ Scholars"),
    meetingTime: text("meeting_time").notNull(),
    meetingTimeMy: text("meeting_time_my"),
    leadership: text("leadership").notNull(),
    leadershipMy: text("leadership_my"),
    description: text("description").notNull(),
    descriptionMy: text("description_my"),
    image: text("image").notNull().default("/images/g2.jpg"),
    galleryUrls: text("gallery_urls").notNull().default("[]"),
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

// Club Members Roster (Admin-managed)
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

// School Activities & Events Table (Optionally Linked to Clubs)
export const activities = sqliteTable(
  "activities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clubId: integer("club_id").references(() => clubs.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    titleMy: text("title_my"),
    category: text("category").notNull(), // "academic" | "sports" | "cultural" | "science"
    date: text("date").notNull(),
    month: text("month").notNull(),
    day: text("day").notNull(),
    time: text("time").notNull(),
    location: text("location").notNull(),
    locationMy: text("location_my"),
    description: text("description").notNull(),
    descriptionMy: text("description_my"),
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

// Admissions Pipeline Table
export const admissions = sqliteTable(
  "admissions",
  {
    id: text("id").primaryKey(), // "HIS-2026-XXXXXX"
    studentName: text("student_name").notNull(),
    dateOfBirth: text("date_of_birth"),
    gender: text("gender"),
    nationality: text("nationality").default("Myanmar"),
    grade: text("grade").notNull(),
    programLevel: text("program_level"),
    targetProgramId: text("target_program_id"),
    finishedGrade: text("finished_grade"),
    suggestedEntryYear: text("suggested_entry_year"),
    preferredRegion: text("preferred_region"),
    academicStream: text("academic_stream"),
    selectedSubjects: text("selected_subjects").default("[]"),
    documentUrls: text("document_urls").default("[]"),
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

export const admissionUploadLimits = sqliteTable("admission_upload_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  resetAt: integer("reset_at").notNull(),
});

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
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    resourceId: text("resource_id"),
    success: integer("success", { mode: "boolean" }).notNull().default(true),
    details: text("details"),
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
  membersList: many(clubMembers),
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
  batch: one(yearbookBatches, {
    fields: [yearbookAlumni.batchId],
    references: [yearbookBatches.id],
  }),
}));

export const yearbookBatchesRelations = relations(yearbookBatches, ({ many }) => ({
  entries: many(yearbookAlumni),
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

// Singular aliases for Better Auth compatibility
export const user = users;
export const session = sessions;
export const account = accounts;
export const verification = verifications;
export const invitation = invitations;

// ==============================================================================
// 4. TYPES
// ==============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;

export type Campus = typeof campuses.$inferSelect;
export type NewCampus = typeof campuses.$inferInsert;

export type AcademicProgram = typeof academicPrograms.$inferSelect;
export type NewAcademicProgram = typeof academicPrograms.$inferInsert;

export type AcademicSubject = typeof academicSubjects.$inferSelect;
export type NewAcademicSubject = typeof academicSubjects.$inferInsert;

export type ProgramSubjectLink = typeof programSubjectLinks.$inferSelect;

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

export type YearbookScholar = typeof yearbookAlumni.$inferSelect;
export type NewYearbookScholar = typeof yearbookAlumni.$inferInsert;
export type YearbookBatch = typeof yearbookBatches.$inferSelect;
export type NewYearbookBatch = typeof yearbookBatches.$inferInsert;

export type Club = typeof clubs.$inferSelect;
export type NewClub = typeof clubs.$inferInsert;

export type ClubMember = typeof clubMembers.$inferSelect;
export type NewClubMember = typeof clubMembers.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Admission = typeof admissions.$inferSelect;
export type NewAdmission = typeof admissions.$inferInsert;

export type FileAsset = typeof fileAssets.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
