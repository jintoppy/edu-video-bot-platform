CREATE TYPE "public"."assignment_status" AS ENUM('open', 'assigned', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "counselor_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"counselor_id" uuid,
	"program_id" uuid,
	"conversation_id" uuid NOT NULL,
	"status" "assignment_status" DEFAULT 'open' NOT NULL,
	"notes" text,
	"priority" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"assigned_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "counselor_assignments" ADD CONSTRAINT "counselor_assignments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "counselor_assignments" ADD CONSTRAINT "counselor_assignments_counselor_id_users_id_fk" FOREIGN KEY ("counselor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "counselor_assignments" ADD CONSTRAINT "counselor_assignments_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "counselor_assignments" ADD CONSTRAINT "counselor_assignments_conversation_id_chat_sessions_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
