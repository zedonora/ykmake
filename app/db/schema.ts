import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Supabase auth.users 테이블 참조를 위한 가상 테이블 (실제 생성 X)
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  username: text("username").unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  website: text("website"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 타입 추론을 위한 설정 (선택적이지만 유용함)
export type Profile = typeof profiles.$inferSelect; // return type when queried
export type NewProfile = typeof profiles.$inferInsert; // insert type