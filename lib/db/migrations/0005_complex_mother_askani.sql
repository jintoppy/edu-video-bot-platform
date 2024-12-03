CREATE TYPE "public"."document_category" AS ENUM('faq', 'visa_information', 'application_guide', 'program_information', 'country_guide', 'financial_information', 'test_preparation', 'general');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documentation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" "document_category" NOT NULL,
	"subcategory" text,
	"slug" text NOT NULL,
	"description" text,
	"keywords" jsonb,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"metadata" jsonb,
	"related_doc_ids" jsonb,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "documentation_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documentation" ADD CONSTRAINT "documentation_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documentation" ADD CONSTRAINT "documentation_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
