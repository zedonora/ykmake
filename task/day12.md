# Day 12: 설정 및 관리자 페이지 개발

## 목표

오늘은 YkMake의 설정 및 관리자 페이지를 개발합니다. 사용자들이 자신의 계정 설정을 관리하고, 관리자가 전체 시스템을 모니터링하고 관리할 수 있는 기능을 구현합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성합니다:

```bash
# 설정 라우트
touch app/routes/settings._index.tsx
touch app/routes/settings.tsx
touch app/routes/settings.account.tsx
touch app/routes/settings.notifications.tsx

# 관리자 라우트
touch app/routes/admin._index.tsx
touch app/routes/admin.tsx
touch app/routes/admin.dashboard.tsx
touch app/routes/admin.users.tsx

# 네비게이션 컴포넌트
mkdir -p app/components/settings
mkdir -p app/components/admin
touch app/components/settings/settings-nav.tsx
touch app/components/admin/admin-nav.tsx

# 관리자 컴포넌트
touch app/components/admin/user-table.tsx
touch app/components/admin/stats-card.tsx

# 타입 정의 파일
touch app/lib/types/settings.ts
touch app/lib/types/admin.ts

# 목업 데이터
touch app/lib/data/mock-settings.ts
touch app/lib/data/mock-admin.ts

# profile 설정 페이지 통합
touch app/routes/profile.settings.account.tsx
touch app/routes/profile.settings.notifications.tsx
touch app/routes/profile.settings.billing.tsx
```

## shadcn 컴포넌트 추가

```bash
npx shadcn@latest add switch
npx shadcn@latest add separator
npx shadcn@latest add dropdown-menu
```

## 작업 목록

1. 루트 레이아웃 수정
2. 타입 정의
3. 목업 데이터 구현
4. 설정 레이아웃 및 인덱스 페이지 구현
5. 관리자 레이아웃 및 인덱스 페이지 구현
6. 계정 설정 페이지 구현
7. 알림 설정 페이지 구현
8. 관리자 대시보드 구현
9. 사용자 관리 페이지 구현
10. 대시보드 네비게이션 컴포넌트 구현
11. 설정 네비게이션 컴포넌트 구현
12. 관리자 네비게이션 컴포넌트 구현
13. 설정 레이아웃 컴포넌트 수정
14. 프로필 설정 페이지 통합
15. 테스트를 위한 URL 목록

## 1. 루트 레이아웃 수정

`app/components/layouts/root-layout.tsx` 파일을 수정합니다:

```typescript
import { ReactNode } from "react";
import { Link, useLocation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

interface RootLayoutProps {
    children: ReactNode;
    isLoggedIn?: boolean;
    isAdmin?: boolean;
}

export function RootLayout({ children, isLoggedIn = false, isAdmin: propIsAdmin }: RootLayoutProps) {
    const location = useLocation();
    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="font-bold text-xl">
                            YkMake
                        </Link>
                        <nav className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                asChild
                                className={cn(
                                    isActive("/products") && "bg-accent"
                                )}
                            >
                                <Link to="/products">제품</Link>
                            </Button>
                            <Button
                                variant="ghost"
                                asChild
                                className={cn(
                                    isActive("/community") && "bg-accent"
                                )}
                            >
                                <Link to="/community">커뮤니티</Link>
                            </Button>
                            {isLoggedIn && (
                                <>
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            isActive("/settings") && "bg-accent"
                                        )}
                                    >
                                        <Link to="/settings">설정</Link>
                                    </Button>
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            asChild
                                            className={cn(
                                                isActive("/admin") && "bg-accent"
                                            )}
                                        >
                                            <Link to="/admin">관리자</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <span className="sr-only">사용자 메뉴</span>
                                        <div className="h-8 w-8 rounded-full bg-muted" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile/settings/account">계정 설정</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile/settings/notifications">알림 설정</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>로그아웃</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild>
                                <Link to="/login">로그인</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="border-t bg-muted/40">
                <div className="container py-8 md:py-12">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div className="space-y-3">
                            <h3 className="text-lg font-medium">YkMake</h3>
                            <p className="text-sm text-muted-foreground">
                                개발자들의 커뮤니티 플랫폼으로, 아이디어부터 제품까지 함께 성장합니다.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-4 text-sm font-medium">제품</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/products" className="text-muted-foreground transition-colors hover:text-foreground">
                                        모든 제품
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/products/leaderboard" className="text-muted-foreground transition-colors hover:text-foreground">
                                        리더보드
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/products/submit" className="text-muted-foreground transition-colors hover:text-foreground">
                                        제품 등록
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-sm font-medium">커뮤니티</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/community" className="text-muted-foreground transition-colors hover:text-foreground">
                                        토론
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/ideas" className="text-muted-foreground transition-colors hover:text-foreground">
                                        IdeasGPT
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/jobs" className="text-muted-foreground transition-colors hover:text-foreground">
                                        구인/구직
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/teams" className="text-muted-foreground transition-colors hover:text-foreground">
                                        팀 찾기
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-sm font-medium">회사</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                                        소개
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                                        개인정보처리방침
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                                        이용약관
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} YkMake. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                GitHub
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                Twitter
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
```

## 2. 타입 정의

타입 정의를 위한 파일을 생성합니다.

### 설정 관련 타입 정의

`app/lib/types/settings.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
export interface AccountSettings {
  email: string;
  username: string;
  twoFactorEnabled: boolean;
}

export interface NotificationSettings {
  email: {
    newMessage: boolean;
    teamInvite: boolean;
    comments: boolean;
  };
  push: {
    browser: boolean;
    desktop: boolean;
  };
  marketing: {
    newsletter: boolean;
    productUpdates: boolean;
  };
}
```

### 관리자 관련 타입 정의

`app/lib/types/admin.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalTeams: number;
  growthRate: {
    users: number;
    products: number;
    teams: number;
  };
}

export interface GrowthData {
  name: string;
  사용자: number;
  제품: number;
  팀: number;
}
```

## 3. 목업 데이터 구현

목업 데이터를 사용하여 실제 API 연동 전에 UI를 개발합니다.

### 설정 데이터 생성

`app/lib/data/mock-settings.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { AccountSettings, NotificationSettings } from "~/lib/types/settings";

export const accountSettings: AccountSettings = {
  email: "user@example.com",
  username: "홍길동",
  twoFactorEnabled: false,
};

export const notificationSettings: NotificationSettings = {
  email: {
    newMessage: true,
    teamInvite: true,
    comments: true,
  },
  push: {
    browser: true,
    desktop: false,
  },
  marketing: {
    newsletter: false,
    productUpdates: true,
  },
};

export function getAccountSettings(): AccountSettings {
  return accountSettings;
}

export function getNotificationSettings(): NotificationSettings {
  return notificationSettings;
}
```

### 관리자 데이터 생성

`app/lib/data/mock-admin.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { User, AdminStats, GrowthData } from "~/lib/types/admin";

export const users: User[] = [
  {
    id: 1,
    name: "홍길동",
    email: "hong@example.com",
    role: "관리자",
    status: "활성",
    joinedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "김영희",
    email: "kim@example.com",
    role: "사용자",
    status: "활성",
    joinedAt: "2024-02-01",
  },
  {
    id: 3,
    name: "이철수",
    email: "lee@example.com",
    role: "사용자",
    status: "비활성",
    joinedAt: "2024-02-15",
  },
];

export const adminStats: AdminStats = {
  totalUsers: 390,
  totalProducts: 52,
  totalTeams: 30,
  growthRate: {
    users: 20.5,
    products: 8.3,
    teams: 20,
  },
};

export const growthData: GrowthData[] = [
  { name: "1월", 사용자: 120, 제품: 24, 팀: 12 },
  { name: "2월", 사용자: 150, 제품: 28, 팀: 15 },
  { name: "3월", 사용자: 180, 제품: 35, 팀: 18 },
  { name: "4월", 사용자: 250, 제품: 42, 팀: 22 },
  { name: "5월", 사용자: 310, 제품: 48, 팀: 25 },
  { name: "6월", 사용자: 390, 제품: 52, 팀: 30 },
];

export function getUsers(): User[] {
  return users;
}

export function getAdminStats(): AdminStats {
  return adminStats;
}

export function getGrowthData(): GrowthData[] {
  return growthData;
}
```

## 4. 설정 레이아웃 및 인덱스 페이지 구현

### 설정 네비게이션 컴포넌트 생성

`app/components/settings/settings-nav.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface SettingsNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SettingsNav({ className }: SettingsNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("overview");  // 기본값
    
    return (
        <nav className={cn("flex p-2", className)}>
            <ClientOnly>
                {() => {
                    useEffect(() => {
                        const currentPath = location.pathname;
                        
                        if (currentPath.includes("/settings/account")) {
                            setActiveTab("account");
                        } else if (currentPath.includes("/settings/notifications")) {
                            setActiveTab("notifications");
                        } else {
                            setActiveTab("overview");
                        }
                    }, [location.pathname]);
                    
                    return null;
                }}
            </ClientOnly>
            <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/settings">개요</Link>
            </Button>
            <Button
                variant={activeTab === "account" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/settings/account">계정 설정</Link>
            </Button>
            <Button
                variant={activeTab === "notifications" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/settings/notifications">알림 설정</Link>
            </Button>
        </nav>
    );
}
```

### 설정 인덱스 페이지 컴포넌트 생성

`app/routes/settings._index.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "설정 - YkMake" },
    { name: "description", content: "YkMake 설정을 관리하세요" },
  ];
};

export default function SettingsIndex() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">설정</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">계정 설정</h2>
          <p className="text-muted-foreground mb-4">
            계정 정보와 보안 설정을 관리하세요
          </p>
          <Button asChild>
            <Link to="/settings/account">계정 설정으로 이동</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">알림 설정</h2>
          <p className="text-muted-foreground mb-4">
            이메일, 푸시, 마케팅 알림 설정을 관리하세요
          </p>
          <Button asChild>
            <Link to="/settings/notifications">알림 설정으로 이동</Link>
          </Button>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">프로필 설정</h2>
        <Card className="p-6">
          <p className="text-muted-foreground mb-4">
            프로필 관련 설정을 관리하려면 프로필 설정 페이지로 이동하세요
          </p>
          <Button asChild>
            <Link to="/profile/settings">프로필 설정으로 이동</Link>
          </Button>
        </Card>
      </div>
    </>
  );
}
```

## 5. 관리자 레이아웃 및 인덱스 페이지 구현

### 관리자 네비게이션 컴포넌트 생성

`app/components/admin/admin-nav.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface AdminNavProps extends React.HTMLAttributes<HTMLElement> {}

export function AdminNav({ className }: AdminNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("overview");  // 기본값
    
    return (
        <nav className={cn("flex p-2", className)}>
            <ClientOnly>
                {() => {
                    useEffect(() => {
                        const currentPath = location.pathname;
                        
                        if (currentPath.includes("/admin.dashboard")) {
                            setActiveTab("dashboard");
                        } else if (currentPath.includes("/admin.users")) {
                            setActiveTab("users");
                        } else {
                            setActiveTab("overview");
                        }
                    }, [location.pathname]);
                    
                    return null;
                }}
            </ClientOnly>
            <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/admin">개요</Link>
            </Button>
            <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/admin.dashboard">대시보드</Link>
            </Button>
            <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/admin.users">사용자 관리</Link>
            </Button>
        </nav>
    );
}
```

### 관리자 레이아웃 컴포넌트 수정

`app/routes/admin.tsx` 파일을 수정합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { AdminNav } from "~/components/admin/admin-nav";
import { RootLayout } from "~/components/root-layout";

export default function AdminLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <ClientOnly>
                {() => {
                    useEffect(() => {
                        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
                        const loginState = localStorage.getItem("isLoggedIn");
                        const adminState = localStorage.getItem("isAdmin");
                        
                        setIsLoggedIn(loginState === "true");
                        setIsAdmin(adminState === "true");
                    }, []);
                    
                    return null;
                }}
            </ClientOnly>

            {/* 관리자가 아니면 접근 불가 */}
            {!isAdmin ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
                        <p className="text-muted-foreground">
                            관리자 페이지는 관리자 권한을 가진 사용자만 접근할 수 있습니다.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="container py-8">
                    <div className="bg-muted mb-8 rounded-lg overflow-hidden">
                        <AdminNav />
                    </div>
                    <Outlet />
                </div>
            )}
        </RootLayout>
    );
}
```

### 관리자 인덱스 페이지 컴포넌트 생성

`app/routes/admin._index.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "관리자 - YkMake" },
    { name: "description", content: "YkMake 시스템을 관리하세요" },
  ];
};

export default function AdminIndex() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">관리자</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">대시보드</h2>
          <p className="text-muted-foreground mb-4">
            시스템 현황과 성장 추이를 확인하세요
          </p>
          <Button asChild>
            <Link to="/admin.dashboard">대시보드로 이동</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">사용자 관리</h2>
          <p className="text-muted-foreground mb-4">
            사용자 계정과 권한을 관리하세요
          </p>
          <Button asChild>
            <Link to="/admin.users">사용자 관리로 이동</Link>
          </Button>
        </Card>
      </div>
    </>
  );
}
```

## 6. 계정 설정 페이지 구현

사용자가 자신의 계정 정보와 보안 설정을 관리할 수 있는 페이지를 구현합니다.

### 계정 설정 페이지 컴포넌트 생성

`app/routes/settings.account.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { getAccountSettings } from "~/lib/data/mock-settings";
import type { AccountSettings } from "~/lib/types/settings";

export const meta: MetaFunction = () => {
  return [
    { title: "계정 설정 - YkMake" },
    { name: "description", content: "YkMake 계정 설정을 관리하세요" },
  ];
};

export async function loader() {
  const settings = getAccountSettings();
  return { settings };
}

export default function AccountSettings() {
  const { settings } = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">계정 설정</h1>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                disabled
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">사용자명</Label>
              <Input
                id="username"
                defaultValue={settings.username}
              />
            </div>

            <Button>변경사항 저장</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">보안</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
              />
            </div>

            <Button>비밀번호 변경</Button>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">2단계 인증</p>
                <p className="text-sm text-muted-foreground">
                  로그인 시 추가 보안 코드를 요구합니다
                </p>
              </div>
              <Switch checked={settings.twoFactorEnabled} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-destructive">위험 구역</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">계정 삭제</p>
              <p className="text-sm text-muted-foreground">
                계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다
              </p>
            </div>
            <Button variant="destructive">계정 삭제</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
```

## 7. 알림 설정 페이지 구현

사용자가 알림 설정을 관리할 수 있는 페이지를 구현합니다.

### 알림 설정 페이지 컴포넌트 생성

`app/routes/settings.notifications.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getNotificationSettings } from "~/lib/data/mock-settings";
import type { NotificationSettings } from "~/lib/types/settings";

export const meta: MetaFunction = () => {
  return [
    { title: "알림 설정 - YkMake" },
    { name: "description", content: "YkMake 알림 설정을 관리하세요" },
  ];
};

export async function loader() {
  const settings = getNotificationSettings();
  return { settings };
}

export default function NotificationSettings() {
  const { settings } = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">알림 설정</h1>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">이메일 알림</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">새 메시지</p>
                <p className="text-sm text-muted-foreground">
                  새로운 메시지가 도착하면 알림을 받습니다
                </p>
              </div>
              <Switch checked={settings.email.newMessage} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">팀 초대</p>
                <p className="text-sm text-muted-foreground">
                  새로운 팀 초대가 있을 때 알림을 받습니다
                </p>
              </div>
              <Switch checked={settings.email.teamInvite} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">댓글</p>
                <p className="text-sm text-muted-foreground">
                  내 게시글에 새 댓글이 달리면 알림을 받습니다
                </p>
              </div>
              <Switch checked={settings.email.comments} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">푸시 알림</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">브라우저 알림</p>
                <p className="text-sm text-muted-foreground">
                  브라우저를 통해 실시간 알림을 받습니다
                </p>
              </div>
              <Switch checked={settings.push.browser} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">데스크톱 알림</p>
                <p className="text-sm text-muted-foreground">
                  데스크톱 앱을 통해 알림을 받습니다
                </p>
              </div>
              <Switch checked={settings.push.desktop} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">마케팅 알림</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">뉴스레터</p>
                <p className="text-sm text-muted-foreground">
                  주간 뉴스레터를 이메일로 받습니다
                </p>
              </div>
              <Switch checked={settings.marketing.newsletter} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">제품 업데이트</p>
                <p className="text-sm text-muted-foreground">
                  새로운 기능과 업데이트 소식을 받습니다
                </p>
              </div>
              <Switch checked={settings.marketing.productUpdates} />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
```

## 8. 관리자 대시보드 구현

관리자가 전체 시스템을 모니터링할 수 있는 대시보드를 구현합니다.

### 관리자 대시보드 컴포넌트 생성

`app/routes/admin.dashboard.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAdminStats, getGrowthData } from "~/lib/data/mock-admin";

export const meta: MetaFunction = () => {
  return [
    { title: "관리자 대시보드 - YkMake" },
    { name: "description", content: "YkMake 시스템을 관리하세요" },
  ];
};

export async function loader() {
  const stats = getAdminStats();
  const growthData = getGrowthData();
  return { stats, growthData };
}

export default function AdminDashboard() {
  const { stats, growthData } = useLoaderData<typeof loader>();

  return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <Button variant="outline" asChild>
            <Link to="/dashboard">사용자 대시보드로 이동</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="font-semibold text-muted-foreground">총 사용자</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground mt-1">
            전월 대비 +{stats.growthRate.users}%
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-muted-foreground">총 제품</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
            <p className="text-sm text-muted-foreground mt-1">
            전월 대비 +{stats.growthRate.products}%
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-muted-foreground">총 팀</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalTeams}</p>
            <p className="text-sm text-muted-foreground mt-1">
            전월 대비 +{stats.growthRate.teams}%
            </p>
          </Card>
        </div>

        <div className="grid gap-6 mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">성장 추이</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                data={growthData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="사용자"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="제품"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="팀"
                    stroke="#ffc658"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
  );
}
```

## 9. 사용자 관리 페이지 구현

관리자가 사용자 계정을 관리할 수 있는 페이지를 구현합니다.

### 사용자 관리 페이지 컴포넌트 생성

`app/routes/admin.users.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { getUsers } from "~/lib/data/mock-admin";
import type { User } from "~/lib/types/admin";

export const meta: MetaFunction = () => {
  return [
    { title: "사용자 관리 - YkMake" },
    { name: "description", content: "YkMake 사용자를 관리하세요" },
  ];
};

export async function loader() {
  const users = getUsers();
  return { users };
}

export default function UserManagement() {
  const { users } = useLoaderData<typeof loader>();

  return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">사용자 관리</h1>
          <div className="flex items-center gap-4">
            <Input
              className="w-[300px]"
              placeholder="이름 또는 이메일로 검색"
            />
            <Button>새 사용자</Button>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "관리자" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                  <Badge variant={user.status === "활성" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.joinedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                      <Button variant="destructive" size="sm">
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
  );
}
```

## 10. 대시보드 네비게이션 컴포넌트 구현

대시보드 내의 페이지들을 탐색할 수 있는 네비게이션 컴포넌트를 구현합니다.

### 대시보드 네비게이션 컴포넌트

`app/components/dashboard/dashboard-nav.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> {}

export function DashboardNav({ className }: DashboardNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("overview");  // 기본값
    
    return (
        <nav className={cn("flex p-2", className)}>
            <ClientOnly>
                {() => {
                    useEffect(() => {
                        const currentPath = location.pathname;
                        
                        if (currentPath.includes("/dashboard/products")) {
                            setActiveTab("products");
                        } else if (currentPath.includes("/dashboard/teams")) {
                            setActiveTab("teams");
                        } else if (currentPath.includes("/dashboard/activity")) {
                            setActiveTab("activity");
                        } else {
                            setActiveTab("overview");
                        }
                    }, [location.pathname]);
                    
                    return null;
                }}
            </ClientOnly>
            <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/dashboard">대시보드</Link>
            </Button>
            <Button
                variant={activeTab === "products" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/dashboard/products">제품 분석</Link>
            </Button>
            <Button
                variant={activeTab === "teams" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/dashboard/teams">팀 분석</Link>
            </Button>
            <Button
                variant={activeTab === "activity" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/dashboard/activity">활동 분석</Link>
            </Button>
        </nav>
    );
}
```

### 설정 네비게이션 컴포넌트 생성

`app/components/settings/settings-nav.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface SettingsNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SettingsNav({ className }: SettingsNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("overview");  // 기본값
    
    useEffect(() => {
        const currentPath = location.pathname;
        
        if (currentPath.includes("/settings/account")) {
            setActiveTab("account");
        } else if (currentPath.includes("/settings/notifications")) {
            setActiveTab("notifications");
        } else {
            setActiveTab("overview");
        }
    }, [location.pathname]);
    
    return (
        <nav className={cn("flex p-2", className)}>
            <ClientOnly>
                {() => {
                    return null;
                }}
            </ClientOnly>
            <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/settings">개요</Link>
            </Button>
            <Button
                variant={activeTab === "account" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/settings/account">계정 설정</Link>
            </Button>
            <Button
                variant={activeTab === "notifications" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/settings/notifications">알림 설정</Link>
            </Button>
        </nav>
    );
}
```

### 관리자 네비게이션 컴포넌트 생성

`app/components/admin/admin-nav.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface AdminNavProps extends React.HTMLAttributes<HTMLElement> {}

export function AdminNav({ className }: AdminNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("overview");  // 기본값
    
    return (
        <nav className={cn("flex p-2", className)}>
            <ClientOnly>
                {() => {
                    useEffect(() => {
                        const currentPath = location.pathname;
                        
                        if (currentPath.includes("/admin.dashboard")) {
                            setActiveTab("dashboard");
                        } else if (currentPath.includes("/admin.users")) {
                            setActiveTab("users");
                        } else {
                            setActiveTab("overview");
                        }
                    }, [location.pathname]);
                    
                    return null;
                }}
            </ClientOnly>
            <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/admin">개요</Link>
            </Button>
            <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/admin.dashboard">대시보드</Link>
            </Button>
            <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/admin.users">사용자 관리</Link>
            </Button>
        </nav>
    );
}
```

### 설정 레이아웃 컴포넌트 수정

`app/routes/settings.tsx` 파일을 수정합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { SettingsNav } from "~/components/settings/settings-nav";
import { RootLayout } from "~/components/layouts/root-layout";

export default function SettingsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <ClientOnly>
                {() => {
                    useEffect(() => {
                        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
                        const loginState = localStorage.getItem("isLoggedIn");
                        const adminState = localStorage.getItem("isAdmin");
                        
                        setIsLoggedIn(loginState === "true");
                        setIsAdmin(adminState === "true");
                    }, []);
                    
                    return null;
                }}
            </ClientOnly>
            <div className="container py-8">
                <div className="bg-muted mb-8 rounded-lg overflow-hidden">
                    <SettingsNav />
                </div>
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

## 14. 프로필 설정 페이지 통합

기존에 구현된 프로필 설정 페이지와 새로 만든 설정 페이지를 통합하여 사용자가 두 경로를 모두 이용할 수 있도록 합니다.

### 프로필 설정 페이지 구현

`app/routes/profile.settings._index.tsx`에 이미 구현된 프로필 설정 인덱스 페이지가 있습니다. 이 페이지에서 다음 프로필 설정 페이지로 이동할 수 있습니다:

1. 계정 정보 - `/profile/settings/account`
2. 알림 설정 - `/profile/settings/notifications`
3. 결제 정보 - `/profile/settings/billing`

### 프로필 설정 레이아웃 컴포넌트 생성

사용자 경험의 일관성을 위해 `/profile/settings` 경로에도 공통 레이아웃을 적용합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { RootLayout } from "~/components/layouts/root-layout";
import { ProfileSettingsNav } from "~/components/profile/profile-settings-nav";

export default function ProfileSettingsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <ClientOnly>
                {() => {
                    useEffect(() => {
                        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
                        const loginState = localStorage.getItem("isLoggedIn");
                        const adminState = localStorage.getItem("isAdmin");
                        
                        setIsLoggedIn(loginState === "true");
                        setIsAdmin(adminState === "true");
                    }, []);
                    
                    return null;
                }}
            </ClientOnly>
            <div className="container py-8">
                <div className="bg-muted mb-8 rounded-lg overflow-hidden">
                    <ProfileSettingsNav />
                </div>
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

이를 통해 사용자는 `/settings` 경로와 `/profile/settings` 경로 모두를 통해 설정 페이지에 접근할 수 있습니다. 드롭다운 메뉴에서는 사용자가 `/profile/settings` 경로로 이동하여 프로필 설정을 관리할 수 있습니다.

## 15. 테스트를 위한 URL 목록

개발 환경에서 다음 URL을 통해 구현한 페이지들을 테스트할 수 있습니다:

1. 설정 페이지:
   - `/settings` - 설정 인덱스 페이지
   - `/settings/account` - 계정 설정
   - `/settings/notifications` - 알림 설정

2. 프로필 설정 페이지:
   - `/profile/settings` - 프로필 설정 인덱스 페이지
   - `/profile/settings/account` - 프로필 계정 정보
   - `/profile/settings/notifications` - 프로필 알림 설정
   - `/profile/settings/billing` - 결제 정보

3. 관리자 페이지:
   - `/admin` - 관리자 인덱스 페이지
   - `/admin/dashboard` - 관리자 대시보드
   - `/admin/users` - 사용자 관리 페이지