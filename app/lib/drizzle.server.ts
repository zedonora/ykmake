import { drizzle } from 'drizzle-orm/postgres-js'; // 'neon-http' 또는 'node-postgres' 대신 'postgres-js' 사용
import postgres from 'postgres'; // 'neon' 또는 'pg' 대신 'postgres' 라이브러리 사용
import * as schema from '~/db/schema'; // 정의된 스키마 임포트
import invariant from 'tiny-invariant';

const connectionString = process.env.DATABASE_URL;
invariant(connectionString, 'DATABASE_URL environment variable is not set');

// 'postgres' 클라이언트 생성
// Supabase의 Transaction pool mode 사용 시 prepare: false 필요
const client = postgres(connectionString, { prepare: false });

// 'postgres' 클라이언트와 스키마를 사용하여 Drizzle 클라이언트 생성
export const db = drizzle(client, { schema });