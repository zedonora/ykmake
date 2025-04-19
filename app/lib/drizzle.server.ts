import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '~/db/schema'; // 정의된 스키마 임포트
import invariant from 'tiny-invariant';

const databaseUrl = process.env.DATABASE_URL;
invariant(databaseUrl, 'DATABASE_URL environment variable is not set');

const sql = neon(databaseUrl);
// 스키마 정보를 포함하여 Drizzle 클라이언트 생성
export const db = drizzle(sql, { schema });