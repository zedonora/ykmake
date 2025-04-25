import { AuthForm } from "~/components/custom/auth-form";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
// import { authenticator } from "~/services/auth.server"; // 추후 사용
// import { getSession, commitSession } from "~/services/session.server"; // 추후 사용
import { useActionData, useNavigation } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "로그인 | YkMake" }];
};

// Loader: 로그인 페이지는 보통 로그인된 사용자는 접근 못하게 리다이렉트 (추후 구현)
// export async function loader({ request }: LoaderFunctionArgs) {
//   await authenticator.isAuthenticated(request, {
//     successRedirect: "/dashboard", // 예시 경로
//   });
//   return null;
// }

// Action: 폼 제출 처리 (Day 8 - 작업 4에서 구현 예정)
// export async function action({ request }: ActionFunctionArgs) {
//   // ... 로그인 로직 ...
// }

export default function LoginPage() {
  // Action 함수에서 반환된 에러 데이터 가져오기 (추후 구현)
  const actionData = useActionData<{ error?: string }>();
  // 폼 제출 상태 확인 (네비게이션 상태)
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <AuthForm
      type="login"
      error={actionData?.error}
      pending={isSubmitting}
    />
  );
}