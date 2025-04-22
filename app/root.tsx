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
import { Header } from "~/components/layout/Header"; // Header 컴포넌트 가져오기
import { Footer } from "~/components/layout/Footer"; // Footer 컴포넌트 가져오기
import { themeSessionResolver } from "~/lib/theme.server"; // 테마 세션 리졸버 임포트 (경로 수정)
import {
  PreventFlashOnWrongTheme,
  ThemeProvider, // RemixThemesProvider -> ThemeProvider 로 수정
  useTheme,
} from "remix-themes"; // remix-themes 관련 임포트
import clsx from "clsx";

// 1. loader 함수에서 테마 정보 로드 추가
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
  const { data: { session } } = await supabase.auth.getSession();

  // env, session, theme 정보를 함께 반환하고, 응답 헤더에 headers 객체 포함
  return Response.json({ env, session, theme }, { headers: headers }); // theme 추가
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

// App 컴포넌트: 실제 렌더링 로직 담당
function App() {
  const data = useLoaderData<typeof loader>(); // loader 데이터 사용 (theme 포함)
  const [theme] = useTheme(); // remix-themes의 useTheme 사용

  return (
    <html lang="ko" className={clsx(theme)}> {/* html 태그에 theme 적용 */}
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} /> {/* FOUC 방지 */}
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased"> {/* body 태그에서 flex 제거 */}
        <div className="relative flex min-h-screen flex-col"> {/* 전체 레이아웃 div */}
          <Header /> {/* Header는 session을 내부적으로 받거나 prop으로 받을 수 있음 */}
          {/* session 정보 표시 (예시, Header 내부로 이동 가능) */}
          {/* {data.session && <div>로그인 상태: {data.session.user.email}</div>} */}
          <main className="flex-1"> {/* 메인 컨텐츠 영역 flex-1 -> flex-grow로 변경해도 무방 */}
            <Outlet />
          </main>
          <Footer />
        </div>
        <ScrollRestoration />
        {/* Scripts 컴포넌트에 env 객체 주입 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.env)}`,
          }}
        />
        <Scripts />
        {/* LiveReload는 개발 환경에서만 필요 */}
        {/* <LiveReload /> */}
      </body>
    </html>
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