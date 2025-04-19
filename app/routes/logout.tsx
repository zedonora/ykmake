import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const headers = new Headers();
  // const { supabase, headers } = createSupabaseServerClient(request); // 헤더 반환 패턴 권장
  const { supabase } = await createSupabaseServerClient(request);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase signout error:", error);
    // TODO: 로그아웃 실패 처리 (예: 에러 메시지와 함께 이전 페이지로?)
    return redirect("/", { headers });
  }

  // 홈페이지로 리디렉션하며 쿠키 제거 헤더 포함
  // return redirect("/", { headers }); // 실제로는 ssr이 설정한 헤더 필요
  return redirect("/", { headers: headers }); // ssr 내부 로직에 따라 헤더 설정됨
};

// 이 라우트는 UI가 없으므로 loader나 default export는 필요 없을 수 있음
// 혹은 간단한 메시지나 빈 컴포넌트를 반환할 수 있음
export default function LogoutRoute() {
  return null; // 또는 <p>Logging out...</p>
}