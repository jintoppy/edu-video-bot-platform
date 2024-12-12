CREATE TABLE IF NOT EXISTS "video_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_session_id" uuid,
	"counselor_id" uuid,
	"student_id" uuid,
	"room_name" text NOT NULL,
	"status" text NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"summary" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "counselor_profiles" RENAME COLUMN "active" TO "is_online";--> statement-breakpoint
ALTER TABLE "counselor_profiles" ADD COLUMN "last_active_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "video_sessions" ADD CONSTRAINT "video_sessions_chat_session_id_chat_sessions_id_fk" FOREIGN KEY ("chat_session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "video_sessions" ADD CONSTRAINT "video_sessions_counselor_id_counselor_profiles_id_fk" FOREIGN KEY ("counselor_id") REFERENCES "public"."counselor_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "video_sessions" ADD CONSTRAINT "video_sessions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
