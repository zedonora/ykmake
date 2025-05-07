DROP INDEX "idx_jobs_category";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "position" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "overview" text NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "responsibilities" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "qualifications" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "benefits" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "skills" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "company_name" varchar(100);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "company_logo_url" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "company_location" varchar(100);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "apply_url" varchar(255);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "job_type" varchar(50);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "job_location_type" varchar(50);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "salary_range" varchar(50);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "status" varchar(20) DEFAULT 'Open';--> statement-breakpoint
CREATE INDEX "idx_jobs_job_type" ON "jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "idx_jobs_job_location_type" ON "jobs" USING btree ("job_location_type");--> statement-breakpoint
CREATE INDEX "idx_jobs_salary_range" ON "jobs" USING btree ("salary_range");--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "company";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "category";