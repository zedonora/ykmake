import { pgTable, serial, varchar, uuid, text, timestamp, bigserial, pgSchema, boolean, jsonb, uniqueIndex, index, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Supabase auth 스키마 정의
export const authSchema = pgSchema("auth");

// 실제 Supabase auth.users 테이블 참조 (주요 컬럼 추가)
export const users = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email"), // 사용자 이메일
  phone: text("phone"), // 사용자 전화번호
  createdAt: timestamp("created_at", { withTimezone: true }), // 생성 시각
  updatedAt: timestamp("updated_at", { withTimezone: true }), // 마지막 업데이트 시각
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }), // 마지막 로그인 시각
  rawUserMetaData: jsonb("raw_user_meta_data"), // 사용자 메타데이터 (커스텀 데이터 저장용)
  // --- 필요에 따라 추가할 수 있는 auth.users의 다른 컬럼들 ---
  // emailConfirmedAt: timestamp("email_confirmed_at", { withTimezone: true }),
  // phoneConfirmedAt: timestamp("phone_confirmed_at", { withTimezone: true }),
  // invitedAt: timestamp("invited_at", { withTimezone: true }),
  // confirmationToken: text("confirmation_token"), // 내부 사용 토큰
  // confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true }),
  // recoveryToken: text("recovery_token"), // 내부 사용 토큰
  // recoverySentAt: timestamp("recovery_sent_at", { withTimezone: true }),
  // emailChangeTokenNew: text("email_change_token_new"), // 내부 사용 토큰
  // emailChange: text("email_change"),
  // emailChangeSentAt: timestamp("email_change_sent_at", { withTimezone: true }),
  // rawAppMetaData: jsonb("raw_app_meta_data"), // 앱 메타데이터 (주로 역할 등 저장)
  // isSsoUser: boolean("is_sso_user"),
  // isAnonymous: boolean("is_anonymous").default(false).notNull(), // 익명 사용자 여부 (v2.99.0 이상)
  // --- 비밀번호 관련 컬럼 (직접 접근/수정 비권장) ---
  // encryptedPassword: text("encrypted_password"),
});

// --- profiles 테이블: auth.users 참조 ---
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  username: text("username").unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  website: text("website"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 타입 추론
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

// --- communityPosts 스키마 추가 ---
export const communityPosts = pgTable("community_posts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
});

// CommunityPosts 타입 추론
export type CommunityPost = typeof communityPosts.$inferSelect;
export type NewCommunityPost = typeof communityPosts.$inferInsert;

// --- ideasGpt 테이블 ---
export const ideasGpt = pgTable('ideas_gpt', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }), // 예시 카테고리 필드
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }), // 작성자 정보, 삭제 시 NULL 설정
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ([
  // 필요에 따라 인덱스 추가 (예: 카테고리, 사용자 ID 기준 조회 성능 향상)
  index("ideas_category_idx").on(table.category),
  index("ideas_user_idx").on(table.userId),
]));

// 필요한 타입 export
export type IdeaGpt = typeof ideasGpt.$inferSelect;
export type NewIdeaGpt = typeof ideasGpt.$inferInsert;

// --- jobs 테이블: auth.users 참조 ---
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // auth.users 테이블 외래키
  position: varchar('position', { length: 255 }).notNull(), // 기존 title 대체 또는 병기
  overview: text('overview').notNull(), // 기존 description 대체 또는 병기
  responsibilities: text('responsibilities'), // (400 chars max, comma separated)
  qualifications: text('qualifications'), // (400 chars max, comma separated)
  benefits: text('benefits'), // (400 chars max, comma separated)
  skills: text('skills'), // (400 chars max, comma separated)
  companyName: varchar('company_name', { length: 100 }), // 기존 company 대체 또는 병기
  companyLogoUrl: text('company_logo_url'),
  companyLocation: varchar('company_location', { length: 100 }), // 기존 location 대체 또는 병기
  applyUrl: varchar('apply_url', { length: 255 }), // 기존 url 대체 또는 병기
  jobType: varchar('job_type', { length: 50 }), // 예: Full-Time, Part-Time, Freelance, Internship
  jobLocationType: varchar('job_location_type', { length: 50 }), // 예: Remote, In-Person, Hybrid
  salaryRange: varchar('salary_range', { length: 50 }), // 예: $0 - $50,000
  status: varchar('status', { length: 20 }).default('Open'), // 예: Open, Closed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // 기존 인덱스 유지 및 필요시 새 인덱스 추가
  index('idx_jobs_job_type').on(table.jobType),
  index('idx_jobs_job_location_type').on(table.jobLocationType),
  index('idx_jobs_salary_range').on(table.salaryRange),
  index('idx_jobs_created_at').on(table.createdAt),
  index('idx_jobs_user_id').on(table.userId),
]);

export type Job = typeof jobs.$inferSelect; // 조회 시 타입
export type NewJob = typeof jobs.$inferInsert; // 삽입 시 타입

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(), // 팀 이름 (고유해야 함)
  description: text('description'), // 팀 설명
  // ownerId 타입을 integer에서 uuid로 변경하여 users.id 타입과 일치시킴
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }), // 팀 소유자 (사용자 삭제 시 NULL로 설정)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // name 컬럼에 대한 인덱스 추가 (조회 성능 향상)
  uniqueIndex('teams_name_idx').on(table.name),
  // ownerId 컬럼에도 인덱스를 추가하는 것이 좋습니다.
  index('teams_owner_id_idx').on(table.ownerId),
]);

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
