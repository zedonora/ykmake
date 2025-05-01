ALTER TABLE "community_posts" ADD COLUMN "category" text NOT NULL;--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "upvotes" integer DEFAULT 0 NOT NULL;