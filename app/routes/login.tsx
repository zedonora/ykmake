import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server"; // 헬퍼 함수 임포트
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."), // 최소 길이만 체크
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = LoginSchema.safeParse(Object.fromEntries(formData));

  if (!submission.success) {
    return Response.json({ error: submission.error.errors[0].message }, { status: 400 });
  }

  const { email, password } = submission.data;

  // createSupabaseServerClient 호출하여 supabase와 headers 객체 모두 받기
  const { supabase, headers } = await createSupabaseServerClient(request);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase login error:", error.message);
    // 오류 시에도 headers를 전달할 수 있지만, Set-Cookie 내용은 없을 가능성이 높음
    return Response.json({ error: "이메일 또는 비밀번호가 잘못되었습니다." }, { status: 401, headers });
  }

  // 로그인 성공 시 홈으로 리디렉션, 응답에 Set-Cookie 헤더 포함
  return redirect("/", { headers: headers });
};

export default function Logipnpage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>이메일과 비밀번호로 로그인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" required />
              {/* TODO: 비밀번호 찾기 링크 추가? */}
            </div>
            {/* 에러 메시지 표시 */}
            {actionData?.error ? (
              <p className="text-sm font-medium text-destructive">{actionData.error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "로그인 중..." : "로그인"}
            </Button>
          </Form>
          {/* TODO: 소셜 로그인 버튼 추가 (Day 9) */}
          <div className="mt-4 text-center text-sm">
            계정이 없으신가요?{" "}
            <Link to="/signup" className="underline">
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}