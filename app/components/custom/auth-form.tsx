import { Form, Link } from "@remix-run/react";
import { Github, MessageCircle, KeyRound } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import AnimatedBackground from "./animated-background";

interface AuthFormProps {
  type: "login" | "signup";
  error?: string | null;
  pending?: boolean;
}

export function AuthForm({ type, error, pending }: AuthFormProps) {
  const isLogin = type === "login";
  const title = isLogin ? "계정에 로그인" : "계정 만들기";
  const description = isLogin
    ? "이메일과 비밀번호를 입력하여 로그인하세요."
    : "계속하려면 아래에 정보를 입력하세요.";
  const buttonText = isLogin ? "로그인" : "계정 만들기";
  const actionPath = isLogin ? "/auth/login" : "/auth/signup";
  const linkPath = isLogin ? "/signup" : "/login";
  const linkText = isLogin ? "회원가입" : "로그인";
  const linkPrompt = isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?";

  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="hidden lg:block relative">
        <AnimatedBackground />
      </div>
      <div className="flex items-center justify-center py-12 min-h-screen lg:min-h-0 bg-background">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="absolute top-4 right-4">
            <Button variant="ghost" asChild>
              <Link to={linkPath}>{linkText}</Link>
            </Button>
          </div>
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-balance text-muted-foreground">{description}</p>
          </div>
          <Form method="post" action={actionPath} className="grid gap-4">
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="홍길동"
                  required
                  autoComplete="name"
                />
              </div>
            )}
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="username">사용자 이름</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="gildong"
                  required
                  autoComplete="username"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">비밀번호</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" disabled={pending}>
              {pending ? (isLogin ? "로그인 중..." : "가입 중...") : buttonText}
            </Button>
          </Form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는 계속하기
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <Button variant="outline" className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" /> Kakao Talk
            </Button>
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" /> Github
            </Button>
            <Button variant="outline" className="w-full">
              <KeyRound className="mr-2 h-4 w-4" /> OTP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}