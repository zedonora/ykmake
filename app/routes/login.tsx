import { useActionData, useNavigation } from "@remix-run/react";
import { redirect, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { z } from "zod";
import { AuthForm } from "~/components/custom/auth-form";

export const meta: MetaFunction = () => {
  return [{ title: "로그인 | YkMake" }];
};

const LoginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = LoginSchema.safeParse(Object.fromEntries(formData));

  if (!submission.success) {
    return Response.json({ error: submission.error.errors[0].message }, { status: 400 });
  }

  const { email, password } = submission.data;
  const { supabase, headers } = await createSupabaseServerClient(request);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase login error:", error.message);
    return Response.json({ error: "이메일 또는 비밀번호가 잘못되었습니다." }, { status: 401, headers });
  }

  return redirect("/", { headers: headers });
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
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