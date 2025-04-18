import { createBrowserClient } from '@supabase/ssr'; // @supabase/ssr 사용 권장
import type { SupabaseClient } from '@supabase/supabase-js';

// 클라이언트 인스턴스를 저장할 변수 (싱글톤 패턴)
let browserClient: SupabaseClient | null = null;

/**
 * 브라우저 환경에서 사용할 Supabase 클라이언트를 생성하거나 기존 인스턴스를 반환합니다.
 * 이 함수는 클라이언트 측 컴포넌트에서만 호출되어야 합니다.
 * @returns {SupabaseClient} Supabase 브라우저 클라이언트 인스턴스
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  // 클라이언트 측에서만 실행되도록 window 객체 존재 여부 확인
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseBrowserClient should only be called on the client');
  }

  // 이미 생성된 클라이언트가 있다면 반환
  if (browserClient) {
    return browserClient;
  }

  // window.ENV 에서 환경 변수 가져오기 (root.tsx에서 주입됨)
  const supabaseUrl = window.ENV?.SUPABASE_URL;
  const supabaseAnonKey = window.ENV?.SUPABASE_ANON_KEY;

  // 환경 변수 존재 확인
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing in window.ENV');
  }

  // 새 클라이언트 생성 및 저장
  // @supabase/ssr의 createBrowserClient 사용 시 Remix/Next.js 등에서 쿠키 기반 세션 처리 용이
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

  return browserClient;
}

// window 객체 타입 확장 (선택 사항, 타입스크립트 사용 시)
declare global {
  interface Window {
    ENV: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}