import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { register, createUserSession } from "~/utils/session.server";
import { prisma } from "~/utils/api.server";

export const meta: MetaFunction = () => {
    return [
        { title: "회원가입 - YkMake" },
        { name: "description", content: "YkMake에 회원가입하세요" },
    ];
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");
    const name = formData.get("name") || email;

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string"
    ) {
        return new Response(
            JSON.stringify({ errors: { email: "유효하지 않은 입력입니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    if (password !== confirmPassword) {
        return new Response(
            JSON.stringify({ errors: { password: "비밀번호가 일치하지 않습니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return new Response(
            JSON.stringify({ errors: { email: "이미 사용 중인 이메일입니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const user = await register({ email, password, name: name.toString() });
    return createUserSession(user.id, "/dashboard");
}

export default function Register() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        YkMake 계정 만들기
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        이메일 또는 소셜 계정으로 가입하세요
                    </p>
                </div>

                <Card className="p-6">
                    <Form method="post" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                            />
                            {actionData?.errors?.email && (
                                <p className="text-sm text-red-500 mt-1">{actionData.errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                            {actionData?.errors?.password && (
                                <p className="text-sm text-red-500 mt-1">{actionData.errors.password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">비밀번호 확인</Label>
                            <Input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "가입 중..." : "회원가입"}
                        </Button>
                    </Form>

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