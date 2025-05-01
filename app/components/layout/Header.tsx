import { Form, Link, NavLink, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { loader as rootLoader } from "~/root"; // 루트 로더 타입 임포트
import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "~/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import * as React from "react";

export function Header() {
  // TODO: 사용자 로그인 상태 가져오기 (예: useLoaderData 또는 Context)
  const { session } = useLoaderData<typeof rootLoader>(); // 루트 로더에서 session 가져오기
  const isLoggedIn = !!session; // session이 있으면 true, 없으면 false

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* 로고와 네비게이션 메뉴를 묶는 div 추가 (선택적이지만 구조 명확화) */}
        <div className="flex items-center">
          <SiteLogo />
          {/* NavigationMenu에서 flex-1 제거, justify-start 제거하고 ml-6 유지 */}
          <NavigationMenu className="ml-6">
            <NavigationMenuList>
              {/* 제품 메뉴 (단순 링크 예시) */}
              <NavigationMenuItem>
                <NavLink
                  to="/products"
                  className={({ isActive }) => cn(
                    navigationMenuTriggerStyle(), // 스타일 적용
                    "transition-colors hover:text-foreground/80",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  제품
                </NavLink>
              </NavigationMenuItem>

              {/* 커뮤니티 메뉴 (드롭다운) */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>커뮤니티</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid grid-cols-2 gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    {/* 불필요한 왼쪽 컬럼 주석 제거 */}
                    <ListItem href="/community" title="All Posts">
                      See all posts in our community
                    </ListItem>
                    {/* Top Posts 주석 해제 (링크는 기능 구현 후 연결) */}
                    <ListItem href="/community?sort=top" title="Top Posts">
                      See the top posts in our community
                    </ListItem>
                    {/* New Posts 주석 해제 (링크는 기능 구현 후 연결) */}
                    <ListItem href="/community?sort=new" title="New Posts">
                      See the new posts in our community
                    </ListItem>
                    <ListItem href="/community/new" title="Create a Post">
                      Create a post in our community
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* 아이디어 메뉴 (단순 링크 예시) */}
              <NavigationMenuItem>
                <NavLink
                  to="/ideas"
                  className={({ isActive }) => cn(
                    navigationMenuTriggerStyle(),
                    "transition-colors hover:text-foreground/80",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  아이디어
                </NavLink>
              </NavigationMenuItem>

              {/* 구인구직 메뉴 (단순 링크 예시) */}
              <NavigationMenuItem>
                <NavLink
                  to="/jobs"
                  className={({ isActive }) => cn(
                    navigationMenuTriggerStyle(),
                    "transition-colors hover:text-foreground/80",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  구인구직
                </NavLink>
              </NavigationMenuItem>

              {/* 팀 메뉴 (단순 링크 예시) */}
              <NavigationMenuItem>
                <NavLink
                  to="/teams"
                  className={({ isActive }) => cn(
                    navigationMenuTriggerStyle(),
                    "transition-colors hover:text-foreground/80",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  팀
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

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

// NavigationMenu 내부 리스트 아이템 스타일링을 위한 헬퍼 컴포넌트
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        {/* 내부 링크는 Remix의 Link 사용 */}
        <Link
          to={href ?? "#"} // href가 없으면 "#" 사용
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";