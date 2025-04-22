import { Form, Link, NavLink, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { loader as rootLoader } from "~/root"; // 루트 로더 타입 임포트
import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "~/components/theme-toggle";

export function Header() {
  // TODO: 사용자 로그인 상태 가져오기 (예: useLoaderData 또는 Context)
  const { session } = useLoaderData<typeof rootLoader>(); // 루트 로더에서 session 가져오기
  const isLoggedIn = !!session; // session이 있으면 true, 없으면 false

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* 로고 컴포넌트 사용 */}
        <SiteLogo />

        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          <NavLink
            to="/products"
            className={({ isActive }) => cn(
              "transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-foreground/60"
            )}
          >
            제품
          </NavLink>
          <NavLink
            to="/community"
            className={({ isActive }) => cn(
              "transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-foreground/60"
            )}
          >
            커뮤니티
          </NavLink>
          <NavLink
            to="/ideas"
            className={({ isActive }) => cn(
              "transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-foreground/60"
            )}
          >
            아이디어
          </NavLink>
          <NavLink
            to="/jobs"
            className={({ isActive }) => cn(
              "transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-foreground/60"
            )}
          >
            구인구직
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) => cn(
              "transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-foreground/60"
            )}
          >
            팀
          </NavLink>
          {/* 추가 네비게이션 링크 */}
        </nav>

        <div className="flex items-center justify-end space-x-4">
          {isLoggedIn ? (
            <>
              {/* TODO: 사용자 아바타 및 드롭다운 메뉴 추가 */}
              <span className="text-sm text-muted-foreground">
                {session.user.email} {/* 이메일 표시 (임시) */}
              </span>
              {/* 로그아웃 버튼을 Form 안에 배치 */}
              <Form action="/logout" method="post">
                <Button type="submit" variant="ghost">로그아웃</Button>
              </Form>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">회원가입</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}