import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code"); // URL에서 인증 코드 가져오기
  const next = requestUrl.searchParams.get("next") || "/"; // 리디렉션 후 이동할 경로 (옵션)

  const { supabase, headers } = await createSupabaseServerClient(request);

  if (code) {
    // 받은 인증 코드를 사용하여 Supabase와 세션 교환
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 성공 시, 사용자를 원래 의도했던 페이지 또는 기본 페이지로 리디렉션
      // exchangeCodeForSession이 성공하면 필요한 쿠키가 자동으로 설정됨
      return redirect(next, { headers });
    } else {
      console.error("Session exchange error:", error);
      // 에러 처리: 로그인 페이지 등으로 리디렉션 (에러 메시지 포함 가능)
      return redirect("/auth/login?error=auth_callback_failed", { headers });
    }
  }

  // 코드가 없는 경우 (잘못된 접근 등)
  console.error("No code found in callback URL");
  return redirect("/auth/login?error=invalid_callback", { headers });
};

// 이 라우트 역시 보통 UI를 직접 렌더링하지 않음
export default function AuthCallback() {
  return null; // 혹은 로딩 스피너 등을 잠시 보여줄 수 있음
}