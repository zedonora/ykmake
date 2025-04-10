# Day 9: 인증 및 프로필 페이지 개발

## 목표

오늘은 YkMake의 사용자 인증 시스템과 프로필 페이지를 개발합니다. 사용자들이 안전하게 로그인하고 자신의 정보를 관리할 수 있는 기능을 구현합니다.

## 작업 목록

1. 로그인 페이지 구현
2. 회원가입 페이지 구현
3. OTP 및 소셜 로그인 UI 구현
4. 프로필 편집 페이지 구현

## 주요 구현 내용:

로그인 페이지 - 이메일/비밀번호 로그인과 소셜 로그인(Github, Google, Kakao) 기능
회원가입 페이지 - 이메일 회원가입과 소셜 계정 연동
OTP 인증 페이지 - 6자리 숫자 입력 방식의 OTP 인증
프로필 편집 페이지 - 기본 정보와 기술 스택 정보 관리

모든 컴포넌트는 Remix와 Shadcn UI를 활용하여 구현되었으며, TailwindCSS를 사용하여 반응형 디자인을 적용했습니다. 특히 소셜 로그인 기능은 spec.md에서 요구하는 Github, Kakao, Google 인증을 모두 포함하고 있습니다.

## 1. 로그인 페이지 구현

로그인 페이지는 사용자가 이메일/비밀번호 또는 소셜 계정으로 로그인할 수 있는 페이지입니다.

### 로그인 페이지 컴포넌트 생성

`app/routes/auth.login.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => {
  return [
    { title: "로그인 - YkMake" },
    { name: "description", content: "YkMake에 로그인하세요" },
  ];
};

export default function Login() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            YkMake에 오신 것을 환영합니다
          </h1>
          <p className="text-sm text-muted-foreground">
            이메일 또는 소셜 계정으로 로그인하세요
          </p>
        </div>

        <Card className="p-6">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                required
              />
            </div>
            <Button className="w-full" type="submit">
              로그인
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button variant="outline" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0z"
                  fill="#2E3440"
                />
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  fill="#fff"
                />
              </svg>
              Github로 계속하기
            </Button>
            <Button variant="outline" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google로 계속하기
            </Button>
            <Button variant="outline" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zM5.8 12c0-3.4 2.8-6.2 6.2-6.2s6.2 2.8 6.2 6.2-2.8 6.2-6.2 6.2S5.8 15.4 5.8 12z"
                  fill="#FEE500"
                />
                <path
                  d="M12 5.8c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2S15.4 5.8 12 5.8zm0 9.8c-2 0-3.6-1.6-3.6-3.6s1.6-3.6 3.6-3.6 3.6 1.6 3.6 3.6-1.6 3.6-3.6 3.6z"
                  fill="#000000"
                />
              </svg>
              Kakao로 계속하기
            </Button>
          </div>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground">
          아직 계정이 없으신가요?{" "}
          <Link
            to="/auth/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
```

## 2. 회원가입 페이지 구현

회원가입 페이지는 새로운 사용자가 계정을 만들 수 있는 페이지입니다.

### 회원가입 페이지 컴포넌트 생성

`app/routes/auth.register.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => {
  return [
    { title: "회원가입 - YkMake" },
    { name: "description", content: "YkMake에 회원가입하세요" },
  ];
};

export default function Register() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            계정 만들기
          </h1>
          <p className="text-sm text-muted-foreground">
            이메일로 새 계정을 만들거나 소셜 계정으로 가입하세요
          </p>
        </div>

        <Card className="p-6">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
              />
            </div>
            <Button className="w-full" type="submit">
              회원가입
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button variant="outline" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0z"
                  fill="#2E3440"
                />
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  fill="#fff"
                />
              </svg>
              Github로 계속하기
            </Button>
            <Button variant="outline" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google로 계속하기
            </Button>
            <Button variant="outline" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zM5.8 12c0-3.4 2.8-6.2 6.2-6.2s6.2 2.8 6.2 6.2-2.8 6.2-6.2 6.2S5.8 15.4 5.8 12z"
                  fill="#FEE500"
                />
                <path
                  d="M12 5.8c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2S15.4 5.8 12 5.8zm0 9.8c-2 0-3.6-1.6-3.6-3.6s1.6-3.6 3.6-3.6 3.6 1.6 3.6 3.6-1.6 3.6-3.6 3.6z"
                  fill="#000000"
                />
              </svg>
              Kakao로 계속하기
            </Button>
          </div>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link
            to="/auth/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
```

## 3. OTP 및 소셜 로그인 UI 구현

OTP 인증 페이지와 소셜 로그인 버튼을 구현합니다.

### OTP 인증 페이지 컴포넌트 생성

`app/routes/auth.otp.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

export const meta: MetaFunction = () => {
  return [
    { title: "OTP 인증 - YkMake" },
    { name: "description", content: "OTP 코드를 입력하세요" },
  ];
};

export default function OTP() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            OTP 인증
          </h1>
          <p className="text-sm text-muted-foreground">
            이메일로 전송된 6자리 코드를 입력하세요
          </p>
        </div>

        <Card className="p-6">
          <form className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              <Input
                className="w-full text-center"
                maxLength={1}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <Input
                className="w-full text-center"
                maxLength={1}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <Input
                className="w-full text-center"
                maxLength={1}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <Input
                className="w-full text-center"
                maxLength={1}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <Input
                className="w-full text-center"
                maxLength={1}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <Input
                className="w-full text-center"
                maxLength={1}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <Button className="w-full" type="submit">
              확인
            </Button>
          </form>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground">
          코드를 받지 못하셨나요?{" "}
          <button
            className="underline underline-offset-4 hover:text-primary"
          >
            재전송
          </button>
        </p>
      </div>
    </div>
  );
}
```

## 4. 프로필 편집 페이지 구현

프로필 편집 페이지는 사용자가 자신의 정보를 수정할 수 있는 페이지입니다.

### 프로필 편집 페이지 컴포넌트 생성

`app/routes/profile.edit.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export const meta: MetaFunction = () => {
  return [
    { title: "프로필 편집 - YkMake" },
    { name: "description", content: "프로필 정보를 수정하세요" },
  ];
};

export default function ProfileEdit() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            프로필 편집
          </h1>
          <p className="text-sm text-muted-foreground">
            프로필 정보를 수정하세요
          </p>
        </div>

        <Card className="p-6">
          <form className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Button variant="outline">프로필 이미지 변경</Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  placeholder="자기소개를 입력하세요"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">기술 스택</Label>
                <Input
                  id="skills"
                  placeholder="기술 스택을 입력하세요 (쉼표로 구분)"
                />
              </div>
            </div>

            <Button className="w-full" type="submit">
              저장하기
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
```

## 다음 단계

이제 인증 및 프로필 페이지의 기본적인 UI가 완성되었습니다! 다음 단계에서는 알림 및 메시지 페이지를 개발하여 사용자들이 서로 소통하고 중요한 알림을 받을 수 있도록 만들 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL들을 통해 새로 만든 페이지들을 확인할 수 있습니다:
- `http://localhost:3000/auth/login`
- `http://localhost:3000/auth/register`
- `http://localhost:3000/auth/otp`
- `http://localhost:3000/profile/edit`