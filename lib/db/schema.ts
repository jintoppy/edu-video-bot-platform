import { InferSelectModel, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
  real,
  pgEnum,
  vector,
  integer,
  varchar
} from "drizzle-orm/pg-core";

export const createVectorExtension = sql`CREATE EXTENSION IF NOT EXISTS vector`;

export const userRoleEnum = pgEnum("userRole", [
  "super_admin",
  "org:admin",
  "org:member",
  "student",
]);

export const communicationModeEnum = pgEnum("communication_mode", [
  "video_only", // Video and audio enabled
  "audio_only", // Only audio enabled
  "text_only", // Text-based communication only
  "multiple", // Combination of modes (e.g., video + text)
]);

export const sessionCategoryEnum = pgEnum("session_category", [
  "initial_assessment", // First counseling session
  "program_review", // Specific program discussion
  "document_review", // Review of student documents/applications
  "follow_up", // Follow-up consultation
  "mock_interview", // Interview preparation
  "general_query", // General questions about programs/process
  "application_support", // Help with application process
  "visa_guidance", // Visa-related queries
  "scholarship_review", // Scholarship-related discussion
  "test_preparation", // Study/test preparation guidance
]);

export const messageTypeEnum = pgEnum("message_type", [
  "user_message", // Message from the user
  "bot_message", // Message from the AI bot
  "system_message", // System notifications/updates
  "recommendation", // Program recommendations
  "action_item", // Tasks/actions for the user
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "pending", // Initial request status
  "under_review", // Being reviewed by counselor/admin
  "approved", // Request approved
  "rejected", // Request rejected
  "cancelled", // Cancelled by student
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "open",
  "assigned",
  "in_progress",
  "completed",
]);

// Enum for document categories
export const documentCategoryEnum = pgEnum("document_category", [
  "faq", // Frequently Asked Questions
  "visa_information", // Visa-related content
  "application_guide", // Application process guides
  "program_information", // General program information
  "country_guide", // Country-specific information
  "financial_information", // Financial guidance and scholarships
  "test_preparation", // Test prep resources
  "general", // Other general content
]);

export const orgStatusEnum = pgEnum("org_status", [
  "active",
  "inactive",
  "suspended",
  "pending",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  customDomain: text("custom_domain").unique(),
  status: orgStatusEnum("status").notNull().default("pending"),

  // Contact Information
  email: text("email").notNull(),
  phone: text("phone"),
  address: jsonb("address"),

  // Subscription/Billing (basic fields - can be expanded)
  planType: text("plan_type").notNull().default("free"),
  subscriptionStatus: text("subscription_status").notNull().default("active"),
  
  programSchema: jsonb("program_schema"), 

  // Metadata
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizationSettings = pgTable("organization_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),

  // Branding
  logo: text("logo_url"),
  favicon: text("favicon_url"),

  // Theme
  theme: jsonb("theme").default({
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    accentColor: "#6366F1",
    fontFamily: "Inter",
  }),

  // Features Configuration
  features: jsonb("features").default({
    videoBot: true,
    liveChat: true,
    programManagement: true,
    analytics: true,
  }),

  // Custom Scripts/Tracking
  scripts: jsonb("scripts").$type<{
    header?: string[];
    body?: string[];
  }>(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

export const landingPages = pgTable("landing_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),

  // Page Content
  sections: jsonb("sections").$type<
    {
      id: string;
      type: string;
      content: Record<string, any>;
      order: number;
    }[]
  >(),

  // SEO
  seo: jsonb("seo").default({
    title: "",
    description: "",
    keywords: [],
    ogImage: "",
  }),

  // Publishing
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),

  // Versioning
  version: text("version").notNull().default("1.0"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id), // Optional for platform-level users
  clerkId: text("clerk_id").unique(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("userRole").notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizationInvitations = pgTable("organization_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("userRole").notNull(),
  status: text("status").notNull().default("pending"),
  invitedBy: uuid("invited_by").references(() => users.id),
  clerkInvitationId: text("clerk_invitation_id").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  currentEducation: text("current_education").notNull(),
  desiredLevel: text("desired_level").notNull(),
  preferredCountries: jsonb("preferred_countries").$type<string[]>(),
  testScores: jsonb("test_scores"),
  budgetRange: text("budget_range"),
  workExperience: jsonb("work_experience"),
  extraCurricular: jsonb("extra_curricular"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  data: jsonb("data").notNull(), // Stores the program data in org-specific structure
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// db/schema.ts

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Contact Information
  contactName: varchar("contact_name", { length: 100 }).notNull(),
  consultancyName: varchar("consultancy_name", { length: 200 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  
  // Business Details
  operationsScale: text("operations_scale").notNull(),
  challenges: text("challenges").notNull(),
  
  // Status and Tracking
  status: varchar("status", { length: 50 })
    .notNull()
    .default('new'), // new, contacted, qualified, converted, rejected
  
  // Optional Additional Data
  notes: text("notes"),
  metadata: jsonb("metadata"), // For any additional fields we might want to store
  
  // Tracking Fields
  followUpDate: timestamp("follow_up_date"),
  lastContactedAt: timestamp("last_contacted_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => users.id),

  // Communication type
  communicationMode: communicationModeEnum("communication_mode").notNull(),

  // Session categorization
  category: sessionCategoryEnum("session_category").notNull(),

  // Program reference (optional)
  programId: uuid("program_id").references(() => programs.id),

  // Session timing
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),

  // Session data
  summary: text("summary"),
  recommendations: jsonb("recommendations"),
  sentimentScore: real("sentiment_score"),

  // Session status
  status: text("status").notNull().default("active"), // active, completed, cancelled, scheduled

  // Metadata for additional properties
  metadata: jsonb("metadata"), // For storing session-specific data

  lastActiveAt: timestamp("last_active_at"),
  deviceInfo: jsonb("device_info"),
  userTimezone: text("user_timezone"),
  chatHistory: jsonb("chat_history"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => chatSessions.id),
  userId: uuid("user_id").references(() => users.id),
  messageType: messageTypeEnum("message_type").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For storing additional message-specific data
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  programReferences: jsonb("program_references").$type<string[]>(), // Store referenced program IDs
  createdAt: timestamp("created_at").defaultNow(),
});

export const counselorProfiles = pgTable("counselor_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  specializations: jsonb("specializations").$type<string[]>(),
  availability: jsonb("availability"), // Store availability schedule
  biography: text("biography"),
  isOnline: boolean("is_online").default(false),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videoSessions = pgTable("video_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatSessionId: uuid("chat_session_id").references(() => chatSessions.id),
  counselorId: uuid("counselor_id").references(() => counselorProfiles.id),
  studentId: uuid("student_id").references(() => users.id),
  roomName: text("room_name").notNull(),
  status: text("status").notNull(), // requested, accepted, ongoing, completed, declined
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const counselorInvitations = pgTable("counselor_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name"),
  status: text("status").notNull().default("pending"), // pending, accepted, expired
  invitedBy: uuid("invited_by").references(() => users.id),
  clerkInvitationId: text("clerk_invitation_id").notNull().unique(), // Store Clerk's invitation ID
  clerkId: text("clerk_id"), // Will be populated when invitation is accepted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const counselorAssignments = pgTable("counselor_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),

  // References to other tables
  studentId: uuid("student_id")
    .references(() => users.id)
    .notNull(),
  counselorId: uuid("counselor_id").references(() => users.id), // Optional field
  programId: uuid("program_id").references(() => programs.id), // Optional field
  conversationId: uuid("conversation_id")
    .references(() => chatSessions.id)
    .notNull(),

  // Assignment status
  status: assignmentStatusEnum("status").notNull().default("open"),

  // Additional useful fields
  notes: text("notes"), // For any specific notes about the assignment
  priority: text("priority"), // To mark priority level if needed
  metadata: jsonb("metadata"), // For any additional data

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  assignedAt: timestamp("assigned_at"), // When counselor was assigned
  completedAt: timestamp("completed_at"), // When assignment was completed
});

export const documentation = pgTable("documentation", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Basic content fields
  title: text("title").notNull(),
  content: text("content").notNull(), // Rich text content from WYSIWYG editor

  // Categorization and organization
  category: documentCategoryEnum("category").notNull(),
  subcategory: text("subcategory"), // Optional further categorization
  slug: text("slug").notNull().unique(), // URL-friendly version of title

  // SEO and display fields
  description: text("description"), // Short description/summary
  keywords: jsonb("keywords").$type<string[]>(), // SEO keywords

  // Publishing status
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),

  // Metadata for any additional properties
  metadata: jsonb("metadata"),

  // Related content
  relatedDocIds: jsonb("related_doc_ids").$type<string[]>(),

  // Audit fields
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentEmbeddings = pgTable("document_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Reference to the documentation table
  documentId: uuid("document_id")
    .notNull()
    .references(() => documentation.id, { onDelete: "cascade" }),

  // Embedding vector - using 1536 dimensions for OpenAI's text-embedding-3-small model
  embedding: vector("embedding", { dimensions: 1536 }).notNull(),

  // Fields to track embedding metadata
  modelName: text("model_name").notNull(), // Name of the embedding model used
  modelVersion: text("model_version").notNull(), // Version of the embedding model

  // Audit fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// For managing API keys
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),

  // API Key details
  name: text("name").notNull(),
  key: text("key").notNull().unique(), // Hashed API key
  prefix: text("prefix").notNull(), // Visible part of the key (e.g., EDU_xxxx)

  // Security settings
  allowedDomains: jsonb("allowed_domains").$type<string[]>(), // List of domains that can use this key
  allowedIps: jsonb("allowed_ips").$type<string[]>(), // Optional IP whitelist

  // Usage limits
  monthlyQuota: integer("monthly_quota"), // Number of chats allowed per month

  // Status
  isActive: boolean("is_active").default(true),

  // Timestamps
  expiresAt: timestamp("expires_at"), // Optional expiration
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// For tracking API key usage
export const apiKeyUsage = pgTable("api_key_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  apiKeyId: uuid("api_key_id")
    .references(() => apiKeys.id)
    .notNull(),

  // Usage details
  sessionId: uuid("session_id").references(() => chatSessions.id),
  domain: text("domain").notNull(),
  ip: text("ip"),

  timestamp: timestamp("timestamp").defaultNow(),
});

export const createHNSWIndex = sql`
  CREATE INDEX ON document_embeddings 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64)
`;

export type DocumentCategory = typeof documentCategoryEnum.enumValues;
export type AssignmentStatus = typeof assignmentStatusEnum.enumValues;
export type CommunicationMode = typeof communicationModeEnum.enumValues;
export type SessionCategory = typeof sessionCategoryEnum.enumValues;
export const programEnrollmentRequests = pgTable(
  "program_enrollment_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // References
    programId: uuid("program_id")
      .references(() => programs.id)
      .notNull(),
    studentId: uuid("student_id")
      .references(() => users.id)
      .notNull(),
    reviewerId: uuid("reviewer_id").references(() => users.id), // Counselor/admin reviewing the request

    // Request details
    status: enrollmentStatusEnum("status").notNull().default("pending"),
    notes: text("notes"), // Student's notes with the request
    reviewNotes: text("review_notes"), // Reviewer's notes

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    reviewedAt: timestamp("reviewed_at"), // When request was reviewed
  }
);

export type MessageType = typeof messageTypeEnum.enumValues;
export type UserRole = typeof userRoleEnum.enumValues;
export type EnrollmentStatus = typeof enrollmentStatusEnum.enumValues;
export type Organization = InferSelectModel<typeof organizations>;
export type LandingPage = InferSelectModel<typeof landingPages>;
