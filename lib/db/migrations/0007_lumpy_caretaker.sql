CREATE TYPE "public"."enrollment_status" AS ENUM('pending', 'under_review', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "program_enrollment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"reviewer_id" uuid,
	"status" "enrollment_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"review_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program_enrollment_requests" ADD CONSTRAINT "program_enrollment_requests_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program_enrollment_requests" ADD CONSTRAINT "program_enrollment_requests_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program_enrollment_requests" ADD CONSTRAINT "program_enrollment_requests_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
