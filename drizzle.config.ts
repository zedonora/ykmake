import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config(); // .env 파일 로드

export default {
  schema: "./app/db/schema.ts", // 스키마 파일 위치
  out: "./drizzle", // 마이그레이션 파일 출력 디렉토리
  dialect: "postgresql", // 데이터베이스 드라이버 유형 (Supabase는 PostgreSQL)
  dbCredentials: {
    url: process.env.DATABASE_URL!, // .env에서 연결 문자열 가져오기
    ssl: { rejectUnauthorized: false }, // SSL 검증 비활성
  },
  verbose: true, // 로그 상세 출력 여부
  strict: true, // 엄격 모드 사용 여부
} satisfies Config;