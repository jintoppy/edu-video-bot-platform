import { sql } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, jsonb, boolean, real, pgEnum, vector } from "drizzle-orm/pg-core";

export const createVectorExtension = sql`CREATE EXTENSION IF NOT EXISTS vector`;


export const userRoleEnum = pgEnum("userType", [
  "admin",
  "counselor",
  "student"
]);

export const communicationModeEnum = pgEnum("communication_mode", [
  "video_only",    // Video and audio enabled
  "audio_only",    // Only audio enabled
  "text_only",     // Text-based communication only
  "multiple"       // Combination of modes (e.g., video + text)
]);

export const sessionCategoryEnum = pgEnum("session_category", [
  "initial_assessment",     // First counseling session
  "program_review",        // Specific program discussion
  "document_review",       // Review of student documents/applications
  "follow_up",            // Follow-up consultation
  "mock_interview",       // Interview preparation
  "general_query",        // General questions about programs/process
  "application_support",  // Help with application process
  "visa_guidance",        // Visa-related queries
  "scholarship_review",   // Scholarship-related discussion
  "test_preparation"      // Study/test preparation guidance
]);

export const messageTypeEnum = pgEnum("message_type", [
  "user_message",     // Message from the user
  "bot_message",      // Message from the AI bot
  "system_message",   // System notifications/updates
  "recommendation",   // Program recommendations
  "action_item"       // Tasks/actions for the user
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "pending",          // Initial request status
  "under_review",     // Being reviewed by counselor/admin
  "approved",         // Request approved
  "rejected",         // Request rejected
  "cancelled"         // Cancelled by student
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "open",
  "assigned",
  "in_progress",
  "completed"
]);

// Enum for document categories
export const documentCategoryEnum = pgEnum("document_category", [
  "faq",                    // Frequently Asked Questions
  "visa_information",       // Visa-related content
  "application_guide",      // Application process guides
  "program_information",    // General program information
  "country_guide",          // Country-specific information
  "financial_information",  // Financial guidance and scholarships
  "test_preparation",       // Test prep resources
  "general",               // Other general content
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("userType").notNull().default("student"),
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
  universityId: uuid("university_id"),
  name: text("name").notNull(),
  level: text("level").notNull(),
  duration: text("duration").notNull(),
  tuitionFee: real("tuition_fee").notNull(),
  currency: text("currency").notNull(),
  country: text("country").notNull(),
  eligibilityCriteria: jsonb("eligibility_criteria"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  active: boolean("active").default(true),
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
  studentId: uuid("student_id").references(() => users.id).notNull(),
  counselorId: uuid("counselor_id").references(() => users.id),  // Optional field
  programId: uuid("program_id").references(() => programs.id),   // Optional field
  conversationId: uuid("conversation_id").references(() => chatSessions.id).notNull(),
  
  // Assignment status
  status: assignmentStatusEnum("status").notNull().default("open"),
  
  // Additional useful fields
  notes: text("notes"),                    // For any specific notes about the assignment
  priority: text("priority"),              // To mark priority level if needed
  metadata: jsonb("metadata"),             // For any additional data
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  assignedAt: timestamp("assigned_at"),    // When counselor was assigned
  completedAt: timestamp("completed_at"),  // When assignment was completed
});

export const documentation = pgTable("documentation", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Basic content fields
  title: text("title").notNull(),
  content: text("content").notNull(),      // Rich text content from WYSIWYG editor
  
  // Categorization and organization
  category: documentCategoryEnum("category").notNull(),
  subcategory: text("subcategory"),        // Optional further categorization
  slug: text("slug").notNull().unique(),   // URL-friendly version of title
  
  // SEO and display fields
  description: text("description"),         // Short description/summary
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
    .references(() => documentation.id, { onDelete: 'cascade' }),
  
  // Embedding vector - using 1536 dimensions for OpenAI's text-embedding-3-small model
  embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  
  // Fields to track embedding metadata
  modelName: text("model_name").notNull(),      // Name of the embedding model used
  modelVersion: text("model_version").notNull(), // Version of the embedding model
  
  // Audit fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export const programEnrollmentRequests = pgTable("program_enrollment_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // References
  programId: uuid("program_id").references(() => programs.id).notNull(),
  studentId: uuid("student_id").references(() => users.id).notNull(),
  reviewerId: uuid("reviewer_id").references(() => users.id), // Counselor/admin reviewing the request
  
  // Request details
  status: enrollmentStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),                    // Student's notes with the request
  reviewNotes: text("review_notes"),       // Reviewer's notes
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),    // When request was reviewed
});

export type MessageType = typeof messageTypeEnum.enumValues;
export type UserRole = typeof userRoleEnum.enumValues;
export type EnrollmentStatus = typeof enrollmentStatusEnum.enumValues;
