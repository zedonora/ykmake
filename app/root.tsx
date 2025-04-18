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

import stylesheet from "~/tailwind.css?url"; // Tailwind CSS 가져오기
import { Header } from "~/components/layout/Header"; // Header 컴포넌트 가져오기 (경로 확인 필요)
import { Footer } from "~/components/layout/Footer"; // Footer 컴포넌트 가져오기 (경로 확인 필요)
import { ThemeProvider } from "~/components/theme-provider"; // ThemeProvider 및 useTheme 가져오기 (경로 확인 필요)
import { ThemeToggle } from "~/components/theme-toggle";
import clsx from "clsx";
import { useTheme } from "next-themes";

// 1. loader 함수 정의 또는 수정
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 서버 환경 변수 읽기
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // 환경 변수 존재 확인
  invariant(supabaseUrl, "SUPABASE_URL is not set");
  invariant(supabaseAnonKey, "SUPABASE_ANON_KEY is not set");

  // 공개해도 안전한 환경 변수들을 객체로 묶어 반환
  const env = {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
  };

  return Response.json({ env }); // env 객체를 json으로 반환
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function AppWithProviders() {
  // 2. useLoaderData 훅으로 env 객체 가져오기
  const { env } = useLoaderData<typeof loader>();
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
        <Scripts />
      </body>
    </html>
  );
}