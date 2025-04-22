import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { redirect, ActionFunctionArgs } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/supabase.server";
import { z } from "zod";
import { Github, Key, MessageCircle } from "lucide-react";

// Zod 스키마 정의 (Name 필드 추가)
const SignUpSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  username: z.string().min(3, "사용자 이름은 3자 이상이어야 합니다."),
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

// action 함수 정의 (Name 필드 처리 추가)
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = SignUpSchema.safeParse(Object.fromEntries(formData));

  if (!submission.success) {
    const firstError = submission.error.errors[0];
    return Response.json({ error: firstError.message, message: null }, { status: 400 });
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
      return Response.json({ error: error.message || "회원가입 중 오류가 발생했습니다.", message: null }, { status: 500 });
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return Response.json({ error: null, message: "가입 확인 이메일을 확인해주세요." });
    }

    return redirect("/login?message=signup_success");

  } catch (err) {
    console.error("Signup action error:", err);
    return Response.json({ error: "알 수 없는 오류가 발생했습니다.", message: null }, { status: 500 });
  }
};

export default function SignUpPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
        </div>
        <div className="relative z-20 mt-auto">
        </div>
      </div>
      <div className="lg:p-8 flex items-center justify-center h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
          </div>
          <Form method="post" className="space-y-4">
            <div>
              <Label htmlFor="name" className="sr-only">Name</Label>
              <Input id="name" name="name" type="text" placeholder="Enter your name" required />
            </div>
            <div>
              <Label htmlFor="username" className="sr-only">Username</Label>
              <Input id="username" name="username" type="text" placeholder="Enter your username" required />
            </div>
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Enter your email address" required />
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter your password" required minLength={8} />
            </div>

            {actionData?.error ? (
              <p className="px-1 text-xs font-medium text-destructive">{actionData.error}</p>
            ) : null}
            {actionData?.message ? (
              <p className="px-1 text-xs font-medium text-green-600">{actionData.message}</p>
            ) : null}

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
            <Button variant="outline" type="button" disabled={isSubmitting}>
              <MessageCircle className="ml-2 h-4 w-4" /> Kakao Talk
            </Button>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              <Github className="mr-2 h-4 w-4" /> Github
            </Button>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              <Key className="mr-2 h-4 w-4" /> OTP
            </Button>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
            <br />
            Already have an account?{" "}
            <Link to="/login" className="underline underline-offset-4 hover:text-primary font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}