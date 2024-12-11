CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_name" varchar(100) NOT NULL,
	"consultancy_name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"operations_scale" text NOT NULL,
	"challenges" text NOT NULL,
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"follow_up_date" timestamp,
	"last_contacted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
