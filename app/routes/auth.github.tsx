import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server"; // Supabase 서버 클라이언트 생성 유틸

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = await createSupabaseServerClient(request);

  // Github OAuth 로그인 시작
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      // redirectTo: `${process.env.BASE_URL}/auth/callback` // 예: 환경 변수 사용
      // 우선 로컬 개발 환경 및 루트 경로로 가정
      // 중요: 이 URL은 Supabase 대시보드 > Authentication > URL Configuration > Redirect URLs에 등록되어야 함
      redirectTo: `${process.env.BASE_URL}/auth/callback`, // Supabase가 처리 후 여기로 최종 리디렉션
    },
  });

  if (error) {
    console.error("Github OAuth Error:", error);
    // 사용자에게 에러 메시지를 보여주는 페이지로 리디렉션하거나 에러 처리
    // 여기서는 간단히 루트로 리디렉션 (실제 앱에서는 에러 처리 개선 필요)
    return redirect('/', { headers });
  }

  // 성공 시, signInWithOAuth는 사용자를 Github 인증 페이지로 리디렉션하는 URL을 반환
  if (data.url) {
    // data.url로 리디렉션 응답 반환
    // 헤더에 Supabase 클라이언트에서 반환된 세션 관련 헤더를 포함해야 할 수 있음
    return redirect(data.url, { headers });
  }

  // data.url이 없는 경우 (예: 설정 오류 등)
  // 적절한 에러 처리 필요
  return redirect('/', { headers });
}

// 이 라우트는 UI를 렌더링하지 않으므로 loader나 default export는 필요 없음
// export const loader = () => { throw new Response(null, { status: 404 }); };
// export default function AuthGithubCallback() { return null; }