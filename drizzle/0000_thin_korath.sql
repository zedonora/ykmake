-- 스키마 생성 시 IF NOT EXISTS 추가
CREATE SCHEMA IF NOT EXISTS "auth";
--> statement-breakpoint
-- 테이블 생성 시 IF NOT EXISTS 추가
CREATE TABLE IF NOT EXISTS "community_posts" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "title" text NOT NULL,
    "content" text,
    "user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" uuid,
    "title" varchar(255) NOT NULL,
    "description" text NOT NULL,
    "company" varchar(100),
    "location" varchar(100),
    "url" varchar(255),
    "category" varchar(50),
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" uuid PRIMARY KEY NOT NULL,
    "updated_at" timestamp with time zone,
    "username" text,
    "full_name" text,
    "avatar_url" text,
    "website" text,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "owner_id" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "teams_name_unique" UNIQUE("name")
);
--> statement-breakpoint
-- auth.users 테이블은 Supabase가 관리하므로 직접 생성하지 않습니다.
-- 만약 Drizzle이 이 구문을 생성했다면 주석 처리하거나 삭제해야 합니다.
-- CREATE TABLE IF NOT EXISTS "auth"."users" (
--     "id" uuid PRIMARY KEY NOT NULL,
--     "email" text,
--     "phone" text,
--     "created_at" timestamp with time zone,
--     "updated_at" timestamp with time zone,
--     "last_sign_in_at" timestamp with time zone,
--     "raw_user_meta_data" jsonb
-- );
--> statement-breakpoint

-- 외래 키 제약 조건 추가 (ALTER TABLE)
-- 일반적으로 ALTER TABLE ADD CONSTRAINT에는 IF NOT EXISTS를 직접 사용하기 어렵습니다.
-- 제약 조건 이름이 고유해야 하므로, 이미 존재하면 오류가 발생하는 것이 일반적입니다.
-- 만약 오류를 무시하고 싶다면, 별도의 PL/pgSQL 블록을 사용해야 하지만 마이그레이션 스크립트에서는 권장되지 않습니다.
-- Drizzle이 생성한 그대로 두는 것이 좋습니다.
-- ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- 인덱스 생성 시 IF NOT EXISTS 추가
CREATE INDEX IF NOT EXISTS "idx_jobs_category" ON "jobs" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_jobs_created_at" ON "jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_jobs_user_id" ON "jobs" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teams_name_idx" ON "teams" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teams_owner_id_idx" ON "teams" USING btree ("owner_id");
