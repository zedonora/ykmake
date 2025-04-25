import { Link, useActionData, useNavigation } from "@remix-run/react";
import { redirect, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/supabase.server";
import { z } from "zod";
import { AuthForm } from "~/components/custom/auth-form";

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

// Zod 스키마 정의 (Name 필드 추가)
const SignUpSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  username: z.string().min(3, "사용자 이름은 3자 이상이어야 합니다."),
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});


// Action: 폼 제출 처리 (Day 8 - 작업 3에서 구현 예정)
// export async function action({ request }: ActionFunctionArgs) {
//   // ... 회원가입 로직 ...
// }

// action 함수 정의 (Name 필드 처리 추가)
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = SignUpSchema.safeParse(Object.fromEntries(formData));

  if (!submission.success) {
    const firstError = submission.error.errors[0];
    return Response.json({ error: firstError.message }, { status: 400 });
  }

  const { email, password, username, name } = submission.data;

  try {
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          name: name,
        },
      },
    });

    if (error) {
      console.error("Supabase signup error:", error.message);
      return Response.json({ error: error.message || "회원가입 중 오류가 발생했습니다." }, { status: 500 });
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return Response.json({ error: null, message: "가입 확인 이메일을 확인해주세요." });
    }

    return redirect("/login?message=signup_success");

  } catch (err) {
    console.error("Signup action error:", err);
    return Response.json({ error: "알 수 없는 오류가 발생했습니다." }, { status: 500 });
  }
};

export default function SignUpPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const errorMessage = typeof actionData === 'object' && actionData !== null && 'error' in actionData ? actionData.error : undefined;

  return (
    <AuthForm
      type="signup"
      error={errorMessage as string | undefined}
      pending={isSubmitting}
    />
  );
}