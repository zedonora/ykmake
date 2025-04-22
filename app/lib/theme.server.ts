// app/lib/theme.server.ts
import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";
import { isProduction } from "~/constant";

// 세션 저장소 생성 (쿠키 이름: "theme")
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "DEFAULT_SECRET"], // .env 파일에 SESSION_SECRET 설정 권장
    secure: isProduction(),
  }
});

// 테마 세션 리졸버 생성
export const themeSessionResolver = createThemeSessionResolver(sessionStorage);