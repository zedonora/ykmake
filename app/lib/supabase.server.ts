import { createClient } from '@supabase/supabase-js';
import invariant from 'tiny-invariant';

// 환경 변수에서 Supabase URL과 Service Role Key 가져오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 환경 변수가 설정되었는지 확인 (서버 시작 시점에 확인)
invariant(supabaseUrl, 'SUPABASE_URL is not set');
invariant(supabaseServiceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY is not set');

/**
 * 서버 환경에서 사용할 Supabase 클라이언트를 생성합니다.
 * Service Role Key를 사용하여 RLS 정책을 우회하고 모든 데이터에 접근할 수 있습니다.
 * loader, action과 같은 서버 측 코드에서 사용해야 합니다.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      // 클라이언트 측 세션 관리를 비활성화하여 서버 측에서만 사용하도록 명시
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);