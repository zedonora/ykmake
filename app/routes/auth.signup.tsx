import { AuthForm } from "~/components/custom/auth-form";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
// import { authenticator } from "~/services/auth.server"; // 추후 사용
import { useActionData, useNavigation } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "회원가입 | YkMake" }];
};

// Loader: 회원가입 페이지도 로그인된 사용자는 접근 못하게 (추후 구현)
// export async function loader({ request }: LoaderFunctionArgs) {
//   await authenticator.isAuthenticated(request, {
//     successRedirect: "/dashboard", // 예시 경로
//   });
//   return null;
// }

// Action: 폼 제출 처리 (Day 8 - 작업 3에서 구현 예정)
// export async function action({ request }: ActionFunctionArgs) {
//   // ... 회원가입 로직 ...
// }

export default function SignupPage() {
  // Action 함수에서 반환된 에러 데이터 가져오기 (추후 구현)
  const actionData = useActionData<{ error?: string }>();
  // 폼 제출 상태 확인
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <AuthForm
      type="signup"
      error={actionData?.error}
      pending={isSubmitting}
    />
  );
}