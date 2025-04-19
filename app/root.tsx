import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import invariant from "tiny-invariant";
import { createSupabaseServerClient } from "~/lib/supabase.server"; // 서버 클라이언트 헬퍼 임포트

import stylesheet from "~/tailwind.css?url"; // Tailwind CSS 가져오기
import { Header } from "~/components/layout/Header"; // Header 컴포넌트 가져오기 (경로 확인 필요)
import { Footer } from "~/components/layout/Footer"; // Footer 컴포넌트 가져오기 (경로 확인 필요)
import { ThemeProvider } from "~/components/theme-provider"; // ThemeProvider 및 useTheme 가져오기 (경로 확인 필요)
import { ThemeToggle } from "~/components/theme-toggle";
import clsx from "clsx";
import { useTheme } from "next-themes";

// 1. loader 함수 정의 또는 수정
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  invariant(env.SUPABASE_URL, "SUPABASE_URL is not set");
  invariant(env.SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY is not set");

  // await를 사용하여 비동기 함수 결과를 기다리고, 객체 구조 분해
  const { supabase, headers } = await createSupabaseServerClient(request);

  // 현재 세션 정보 가져오기
  const { data: { session } } = await supabase.auth.getSession();

  // env와 session 정보를 함께 반환하고, 응답 헤더에 headers 객체 포함
  return Response.json({ env, session }, { headers: headers });
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function AppWithProviders() {
  // 2. useLoaderData 훅으로 env 객체 가져오기
  const { env, session } = useLoaderData<typeof loader>(); // session 정보도 받음
  const { theme } = useTheme();
  return (
    <html lang="ko" className={clsx(theme)} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Header 컴포넌트는 이제 useLoaderData를 통해 직접 session 접근 가능 */}
          {session && <div>로그인 상태: {session.user.email}</div>}
          <Header />
          {/* 테마 토글 버튼 추가 */}
          <div className="fixed top-2 right-4 z-50">
            <ThemeToggle />
          </div>
          <main className="flex-grow">
            <Outlet />
          </main>
          <Footer />
        </ThemeProvider>
        <ScrollRestoration />
        {/* 3. Scripts 컴포넌트에 env 객체를 주입하여 클라이언트 측에서 접근 가능하게 함 */}
        <script
          dangerouslySetInnerHTML={{
            // 이제 App 컴포넌트 또는 그 하위 컴포넌트에서
            // useLoaderData 훅이나 window.ENV를 통해 환경 변수 접근 가능
            // 예: const { env } = useLoaderData<typeof loader>();
            // 예: const supabaseUrl = window.ENV.SUPABASE_URL;
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        {/* 클라이언트 측에서 세션 변화 감지를 위해 access_token 전달 (선택적, 필요 시) */}
        {/* session?.access_token && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ACCESS_TOKEN = "${session.access_token}"`,
            }}
          />
        ) */}
        <Scripts />
      </body>
    </html>
  );
}