import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import stylesheet from "~/tailwind.css?url"; // Tailwind CSS 가져오기
import { Header } from "~/components/layout/Header"; // Header 컴포넌트 가져오기 (경로 확인 필요)
import { Footer } from "~/components/layout/Footer"; // Footer 컴포넌트 가져오기 (경로 확인 필요)
import { ThemeProvider } from "~/components/theme-provider"; // ThemeProvider 및 useTheme 가져오기 (경로 확인 필요)
import clsx from "clsx";
import { useTheme } from "next-themes";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function AppWithProviders() {
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
        <ThemeProvider attribute="class" defaultTheme="System" enableSystem>
          <Header />
          <main className="flex-grow">
            <Outlet />
          </main>
          <Footer />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}