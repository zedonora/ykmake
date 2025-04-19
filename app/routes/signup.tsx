import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { redirect, ActionFunctionArgs } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/supabase.server";
import { z } from "zod";

// Zod 스키마 정의 (유효성 검사 규칙)
const SignUpSchema = z.object({
  username: z.string().min(3, "사용자 이름은 3자 이상이어야 합니다."),
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

// action 함수 정의 (동일한 파일 내에)
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = SignUpSchema.safeParse(Object.fromEntries(formData));

  // 유효성 검사 실패 시 에러 반환
  if (!submission.success) {
    const firstError = submission.error.errors[0];
    return Response.json({ error: firstError.message }, { status: 400 });
  }

  const { email, password, username } = submission.data;

  try {
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        // emailRedirectTo 설정 (Supabase 설정에서 이메일 확인 활성화 시)
        // emailRedirectTo: `${new URL(request.url).origin}/welcome`, 
        data: {
          username: username, // profiles 테이블 트리거에서 사용
        },
      },
    });

    if (error) {
      console.error("Supabase signup error:", error.message);
      return Response.json({ error: error.message || "회원가입 중 오류가 발생했습니다." }, { status: 500 });
    }

    // 이메일 확인이 필요한 경우 (Supabase 설정에 따라 다름)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return Response.json({ message: "가입 확인 이메일을 확인해주세요." });
    }

    // 바로 로그인 처리 또는 로그인 페이지로 리디렉션
    // 이메일 확인이 필요 없거나 자동 확인된 경우 (예: 개발 환경)
    return process.env.NODE_ENV === "production" ? Response.json({ message: "회원가입이 완료되었습니다. 로그인해주세요." }) : redirect("/login?message=signup_success");

  } catch (err) {
    console.error("Signup action error:", err);
    return Response.json({ error: "알 수 없는 오류가 발생했습니다." }, { status: 500 });
  }
};

export default function SignUpPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription>이메일과 비밀번호로 YkMake에 가입하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            {/* 사용자 이름 필드 (선택 사항, profiles 테이블 스키마에 따라 추가) */}
            <div>
              <Label htmlFor="username">사용자 이름</Label>
              <Input id="username" name="username" type="text" required />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            {/* 에러 메시지 표시 */}
            {actionData?.error ? (
              <p className="text-sm font-medium text-destructive">{actionData.error}</p>
            ) : null}
            {/* 가입 확인 이메일 안내 메시지 (선택 사항) */}
            {actionData?.message ? (
              <p className="text-sm font-medium text-green-600">{actionData.message}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "가입 진행 중..." : "회원가입"}
            </Button>
          </Form>
          <div className="mt-4 text-center text-sm">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="underline">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}