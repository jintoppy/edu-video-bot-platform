CREATE TYPE "public"."communication_mode" AS ENUM('video_only', 'audio_only', 'text_only', 'multiple');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('user_message', 'bot_message', 'system_message', 'recommendation', 'action_item');--> statement-breakpoint
CREATE TYPE "public"."session_category" AS ENUM('initial_assessment', 'program_review', 'document_review', 'follow_up', 'mock_interview', 'general_query', 'application_support', 'visa_guidance', 'scholarship_review', 'test_preparation');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"user_id" uuid,
	"message_type" "message_type" NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"is_edited" boolean DEFAULT false,
	"edited_at" timestamp,
	"program_references" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_sessions" RENAME COLUMN "session_type" TO "communication_mode";--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "session_category" "session_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "program_id" uuid;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
