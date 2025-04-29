import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import invariant from "tiny-invariant";
import { createSupabaseServerClient } from "~/lib/supabase.server"; // 서버 클라이언트 헬퍼 임포트
import { ensureUserProfileExists } from "~/lib/profile.server"; // <<<--- 프로필 유틸리티 함수 임포트

import stylesheet from "~/tailwind.css?url"; // Tailwind CSS 가져오기
import { Header } from "~/components/layout/Header"; // Header 컴포넌트 가져오기
import { Footer } from "~/components/layout/Footer"; // Footer 컴포넌트 가져오기
import { themeSessionResolver } from "~/lib/theme.server"; // 테마 세션 리졸버 임포트 (경로 수정)
import {
  PreventFlashOnWrongTheme,
  ThemeProvider, // RemixThemesProvider -> ThemeProvider 로 수정
  useTheme,
} from "remix-themes"; // remix-themes 관련 임포트
import clsx from "clsx";
import { isDevelopment } from "./constant";

// 1. loader 함수에서 테마 정보 로드 및 프로필 생성 로직 추가
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getTheme } = await themeSessionResolver(request); // 테마 리졸버 사용
  const theme = getTheme(); // 현재 테마 가져오기

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  invariant(env.SUPABASE_URL, "SUPABASE_URL is not set");
  invariant(env.SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY is not set");

  const { supabase, headers } = await createSupabaseServerClient(request);
  // 세션 정보는 UI 렌더링 등을 위해 먼저 가져옵니다.
  const { data: { session } } = await supabase.auth.getSession();

  // --- 프로필 자동 생성 로직 (별도 함수 호출) ---
  try {
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

    if (userError && userError.message !== 'Auth session missing!') {
      console.error("Error fetching authenticated user:", userError);
    } else if (authUser) {
      // 분리된 함수 호출
      await ensureUserProfileExists(supabase, authUser);
    }
  } catch (e) {
    console.error("Error during profile auto-creation process in root loader:", e);
  }
  // --- 프로필 자동 생성 로직 끝 ---

  // loader는 env, session(getSession 결과), theme 정보를 반환
  // UI 렌더링 시점에는 getSession의 session 정보를 사용하는 것이 일반적입니다.
  // 프로필 생성은 백그라운드 작업으로 간주합니다.
  return Response.json({ env, session, theme }, { headers: headers });
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

// App 컴포넌트: 실제 렌더링 로직 담당
function App() {
  const data = useLoaderData<typeof loader>(); // loader 데이터 사용 (theme 포함)
  const [theme] = useTheme(); // remix-themes의 useTheme 사용

  return (
    <html lang="ko" className={clsx(theme)}><head>
      <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      <Links />
    </head><body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.env)}`,
          }}
        />
        <Scripts />
        {isDevelopment() && <LiveReload />}
      </body></html>
  );
}

// 최상위 컴포넌트: Theme Provider로 App 감싸기
export default function AppWithProviders() {
  const { theme } = useLoaderData<typeof loader>(); // loader에서 theme 가져오기
  return (
    <ThemeProvider specifiedTheme={theme} themeAction="/action/set-theme"> {/* Provider 설정 (ThemeProvider로 수정) */}
      <App />
    </ThemeProvider>
  );
}