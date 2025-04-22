import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { themeSessionResolver } from "~/lib/theme.server"; // 테마 세션 리졸버 임포트
import { Theme } from "remix-themes"; // Theme 타입 임포트 추가

export async function action({ request }: ActionFunctionArgs) {
  // themeSessionResolver는 request를 받아 세션 객체를 반환합니다.
  const session = await themeSessionResolver(request);

  // 폼 데이터에서 'theme' 값 추출
  const formData = await request.formData();
  const themeValue = formData.get("theme");

  // 유효성 검사: light, dark 또는 system인지 확인
  if (themeValue === Theme.LIGHT || themeValue === Theme.DARK || themeValue === "system") {
    // session.setTheme은 Theme 타입만 받지만, 'system'도 내부적으로 처리 가능
    // @ts-ignore // 타입스크립트 오류를 무시하여 'system' 문자열 전달 허용
    session.setTheme(themeValue);
  } else {
    // 유효하지 않은 값이면 오류 반환 또는 기본값 설정
    return Response.json({ success: false, message: 'Invalid theme value' }, { status: 400 });
  }

  // 변경된 세션을 커밋하고 응답 헤더에 Set-Cookie 추가
  // commit 함수는 세션 객체 자체에 포함되어 있습니다.
  return Response.json(
    { success: true },
    { headers: { "Set-Cookie": await session.commit() } }
  );
}

// 이 라우트는 UI를 렌더링하지 않으므로 loader는 불필요하거나,
// 직접 접근을 막기 위해 리다이렉트 또는 404 응답을 반환할 수 있습니다.
export function loader() {
  // 예를 들어, 루트 경로로 리다이렉트
  return redirect("/", { status: 404 });
} 