ALTER TABLE "programs" ALTER COLUMN "organization_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "program_schema" jsonb;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "data" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "university_id";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "level";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "duration";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "tuition_fee";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "currency";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "country";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "eligibility_criteria";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "description";