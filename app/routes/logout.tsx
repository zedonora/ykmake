import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // createSupabaseServerClient는 헤더도 반환하므로, 이를 받아서 리디렉션 시 사용합니다.
  const { supabase, headers } = await createSupabaseServerClient(request);

  try {
    // getSession() 대신 getUser()를 사용하여 서버에서 직접 사용자 인증 상태 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      // 사용자 정보를 가져오는 데 실패한 경우 (예: 네트워크 오류)
      console.error("Error fetching user for logout:", userError);
      // 오류가 발생해도 로그아웃 시도 또는 홈으로 리디렉션
    } else if (user) {
      // getUser()를 통해 인증된 사용자가 확인되면 로그아웃 시도
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Logout error:", signOutError);
        // 로그아웃 실패 시 사용자에게 오류 메시지를 전달하는 페이지로 리디렉션하거나,
        // 여기서는 간단히 홈으로 리디렉션합니다.
      } else {
        console.log("Logout successful for user:", user.id);
        // 로그아웃 성공 처리 (특별한 작업 필요 없음)
      }
    } else {
      // getUser() 결과 사용자가 없는 경우 (이미 로그아웃 상태 또는 세션 만료)
      console.log("No authenticated user found. Already logged out?");
      // 이미 로그아웃 상태이므로 별도 처리 없이 홈으로 리디렉션
    }
  } catch (error) {
    console.error("Sign out process failed unexpectedly:", error);
    // 예기치 못한 오류 발생 시 홈으로 리디렉션
  }

  // 최종적으로 홈페이지로 리디렉션하며, 세션 무효화를 위한 헤더 포함
  return redirect("/", { headers });
};

// 이 라우트는 UI가 없으므로 loader나 default export는 필요 없을 수 있음
// 혹은 간단한 메시지나 빈 컴포넌트를 반환할 수 있음
export default function LogoutRoute() {
  return null; // 또는 <p>Logging out...</p>
}