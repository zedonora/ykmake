CREATE TABLE "ideas_gpt" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50),
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ideas_gpt" ADD CONSTRAINT "ideas_gpt_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ideas_category_idx" ON "ideas_gpt" USING btree ("category");--> statement-breakpoint
CREATE INDEX "ideas_user_idx" ON "ideas_gpt" USING btree ("user_id");