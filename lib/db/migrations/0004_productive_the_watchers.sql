ALTER TABLE "chat_sessions" ADD COLUMN "last_active_at" timestamp;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "device_info" jsonb;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "user_timezone" text;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "chat_history" jsonb;