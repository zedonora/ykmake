# Day 2: CursorAI 활용 및 UI 기본 구성

## 목표

오늘은 CursorAI의 사용법을 익히고, 프로젝트의 UI 기본 구성을 확장합니다. 내비게이션 바를 구현하고 기본 레이아웃 컴포넌트를 작성하여 사이트의 뼈대를 완성합니다.

## 작업 목록

1. CursorAI 사용법 학습
2. 내비게이션 바 구현
3. 기본 레이아웃 컴포넌트 작성
4. 페이지 레이아웃 설계
5. Remix 라우팅 이해 및 설정

## 1. CursorAI 사용법 학습

CursorAI는 개발 생산성을 크게 향상시키는 AI 도구입니다. 이를 효율적으로 활용하는 방법을 알아봅시다.

### CursorAI 기본 사용법

CursorAI는 여러 가지 방식으로 사용할 수 있습니다:

1. **인라인 모드**: 코드 작성 중에 Tab 키를 눌러 AI의 제안을 받을 수 있습니다.
2. **채팅 모드**: Cmd+L 또는 Ctrl+L을 눌러 AI와 직접 대화할 수 있습니다.
3. **Composer 모드**: Cmd+K 또는 Ctrl+K를 눌러 새로운 코드를 생성하거나 수정할 수 있습니다.

### CursorAI 규칙 및 팁

- 명확하고 구체적인 질문이나 요청을 하면 더 좋은 결과를 얻을 수 있습니다.
- 코드 블록을 선택한 상태에서 AI에게 수정을 요청하면 해당 부분만 수정됩니다.
- 복잡한 컴포넌트나 로직을 구현할 때 단계별로 설명하면 AI가 더 정확히 도와줄 수 있습니다.
- 에러 메시지나 문제 상황을 복사하여 AI에게 제공하면 디버깅에 도움을 받을 수 있습니다.

## 2. 내비게이션 바 구현

전체 사이트에서 사용할 내비게이션 바를 구현합니다. 모바일 대응 및 사용자 인증 상태에 따른 UI 변화도 반영합니다.

### 모바일 대응 내비게이션 컴포넌트 생성

`app/components/layouts/navigation.tsx` 파일을 생성합니다:

```typescript
import { useState } from "react";
import { Link } from "@remix-run/react";
import { Menu, X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface NavigationProps {
  isLoggedIn?: boolean;
}

export function Navigation({ isLoggedIn = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-xl">YkMake</Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">제품</Link>
            <Link to="/community" className="text-sm font-medium transition-colors hover:text-primary">커뮤니티</Link>
            <Link to="/ideas" className="text-sm font-medium transition-colors hover:text-primary">IdeasGPT</Link>
            <Link to="/jobs" className="text-sm font-medium transition-colors hover:text-primary">구인/구직</Link>
            <Link to="/teams" className="text-sm font-medium transition-colors hover:text-primary">팀</Link>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link to="/notifications" className="text-sm font-medium">
                알림
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">대시보드</Button>
              </Link>
              <Link to="/profile">
                <Button size="sm">프로필</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="outline" size="sm">로그인</Button>
              </Link>
              <Link to="/auth/register">
                <Button size="sm">회원가입</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* 모바일 메뉴 버튼 */}
        <button 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 flex flex-col space-y-4">
            <Link to="/products" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">제품</Link>
            <Link to="/community" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">커뮤니티</Link>
            <Link to="/ideas" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">IdeasGPT</Link>
            <Link to="/jobs" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">구인/구직</Link>
            <Link to="/teams" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">팀</Link>
            
            <div className="pt-4 border-t flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link to="/notifications" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">알림</Link>
                  <Link to="/dashboard" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">대시보드</Link>
                  <Link to="/profile" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">프로필</Link>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="w-full">
                    <Button variant="outline" className="w-full">로그인</Button>
                  </Link>
                  <Link to="/auth/register" className="w-full">
                    <Button className="w-full">회원가입</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
```

## 3. 기본 레이아웃 컴포넌트 작성

이제 day1에서 만든 기본 레이아웃을 개선하여 내비게이션 컴포넌트를 적용하고, 푸터도 확장합니다.

### 개선된 루트 레이아웃 컴포넌트

`app/components/layouts/root-layout.tsx` 파일을 수정합니다:

```typescript
import { ReactNode } from "react";
import { Link } from "@remix-run/react";
import { Navigation } from "./navigation";

interface RootLayoutProps {
  children: ReactNode;
  isLoggedIn?: boolean;
}

export function RootLayout({ children, isLoggedIn = false }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation isLoggedIn={isLoggedIn} />
      
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

## 5. Remix 라우팅 이해 및 설정

Remix는 강력한 파일 기반 라우팅 시스템을 제공합니다. 정확한 라우팅 동작을 이해하는 것이 중요합니다.

### Remix 파일 기반 라우팅 이해하기

Remix v2에서는 두 가지 라우팅 방식을 지원합니다:

1. **중첩 디렉토리 방식**: 전통적인 파일 시스템 기반 구조
   ```
   app/routes/
     ├── _index.tsx          # /
     ├── products/
     │   ├── index.tsx       # /products
     │   ├── $slug.tsx       # /products/:slug
     │   └── categories/
     │       └── $category.tsx # /products/categories/:category
   ```

2. **플랫 라우팅 방식**: 파일명을 사용한 라우팅 구조 (권장)
   ```
   app/routes/
     ├── _index.tsx                # /
     ├── products.tsx              # /products 레이아웃
     ├── products._index.tsx       # /products 콘텐츠
     ├── products.$slug.tsx        # /products/:slug
     ├── products.new.tsx          # /products/new
     └── products.categories.$category.tsx # /products/categories/:category
   ```

### 플랫 라우팅의 장점

플랫 라우팅(Flat Routing)은 여러 장점이 있습니다:

1. **직관적인 경로 관리**: 파일명만 보고도 URL 경로를 쉽게 유추할 수 있습니다.
2. **라우트 충돌 방지**: 정적 경로와 동적 경로 간의 충돌이 자연스럽게 해결됩니다.
3. **코드 검색 용이성**: 모든 파일이 한 디렉토리에 있어 파일 검색이 쉽습니다.
4. **유지보수 편의성**: 중첩 구조 없이 파일 이동 및 이름 변경이 용이합니다.

### 라우트 우선순위 이해하기

Remix에서는 라우트 매칭 시 다음과 같은 우선순위를 따릅니다:

1. 정적 세그먼트 (`products`)
2. 레이아웃 라우트 (`products.tsx`, `products._index.tsx`)
3. 동적 파라미터 (`products.$slug.tsx`)
4. 선택적 동적 파라미터 (`products.$.tsx`)
5. 스플랫 라우트 (`products.$.tsx`)

이를 통해 `/products/new`와 `/products/:slug` 같은 경로 충돌 문제를 자연스럽게 해결할 수 있습니다.

### 플랫 라우팅 예시 구조

커뮤니티 페이지에 대한 플랫 라우팅 구조 예시:

```
app/routes/
├── community.tsx               # /community 메인 레이아웃
├── community._index.tsx        # /community 메인 페이지 콘텐츠
├── community.new.tsx           # /community/new 게시글 작성 페이지
├── community.search.tsx        # /community/search 검색 페이지
├── community.$slug.tsx         # /community/:slug 게시글 상세 페이지
└── community.categories.$category.tsx # /community/categories/:category 카테고리 페이지
```

### vite.config.ts 설정

`vite.config.ts` 파일에서 Remix 관련 설정을 구성합니다:

```typescript
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
});
```

## 4. 페이지 레이아웃 설계

각 페이지의 레이아웃을 위한 추가 컴포넌트를 생성합니다.

### 페이지 헤더 컴포넌트

`app/components/layouts/page-header.tsx` 파일을 생성합니다:

```typescript
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="border-b bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    </div>
  );
}
```

### 섹션 컨테이너 컴포넌트

`app/components/layouts/section.tsx` 파일을 생성합니다:

```typescript
import { ReactNode } from "react";
import { cn } from "~/lib/utils/cn";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-8 md:py-12", className)}>
      <div className="container">
        {children}
      </div>
    </section>
  );
}
```

### 유틸리티 함수 추가

`app/lib/utils/cn.ts` 파일을 생성합니다:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 메인 페이지 개선

이제 새로 만든 컴포넌트들을 활용하여 메인 페이지를 개선합니다.

### 메인 페이지 수정

`app/routes/_index.tsx` 파일을 수정합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { RootLayout } from "~/components/layouts/root-layout";
import { Section } from "~/components/layouts/section";

export const meta: MetaFunction = () => {
  return [
    { title: "YkMake - 개발자들의 커뮤니티" },
    { name: "description", content: "아이디어부터 제품까지, 개발자들의 커뮤니티 YkMake" },
  ];
};

export default function Index() {
  return (
    <RootLayout>
      {/* 히어로 섹션 */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 z-0" />
        <Section className="py-16 md:py-24 lg:py-32 relative z-10">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              아이디어부터 제품까지
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
              YkMake에서 당신의 아이디어를 현실로 만드세요. 다양한 개발자들과 함께 협업하고, 피드백을 받고, 성장하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button size="lg" asChild>
                <Link to="/products">인기 제품 보기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/community">커뮤니티 참여하기</Link>
              </Button>
            </div>
          </div>
        </Section>
      </div>
      
      {/* 주요 기능 섹션 */}
      <Section className="bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-12">YkMake의 주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">제품 쇼케이스</h3>
            <p className="text-muted-foreground mb-4">
              당신의 제품을 전 세계 개발자들에게 소개하고 피드백을 받으세요.
            </p>
            <Link to="/products" className="text-sm font-medium text-primary inline-flex items-center">
              제품 둘러보기 <ArrowRight className="ml-1" size={14} />
            </Link>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">AI 아이디어 생성</h3>
            <p className="text-muted-foreground mb-4">
              OpenAI 기반의 아이디어 생성 도구로 새로운 프로젝트 아이디어를 얻으세요.
            </p>
            <Link to="/ideas" className="text-sm font-medium text-primary inline-flex items-center">
              아이디어 생성하기 <ArrowRight className="ml-1" size={14} />
            </Link>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">개발자 매칭</h3>
            <p className="text-muted-foreground mb-4">
              당신의 프로젝트에 필요한 팀원을 찾거나, 흥미로운 프로젝트에 참여하세요.
            </p>
            <Link to="/teams" className="text-sm font-medium text-primary inline-flex items-center">
              팀 찾아보기 <ArrowRight className="ml-1" size={14} />
            </Link>
          </div>
        </div>
      </Section>
      
      {/* CTA 섹션 */}
      <Section>
        <div className="bg-primary/10 rounded-lg p-8 md:p-12 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-muted-foreground mb-6 max-w-[600px]">
            YkMake 커뮤니티에 가입하여 다양한 개발자들과 함께 성장하세요.
          </p>
          <Button size="lg" asChild>
            <Link to="/auth/register">무료로 가입하기</Link>
          </Button>
        </div>
      </Section>
    </RootLayout>
  );
}
```

## 다음 단계

이제 기본적인 UI 구성 요소들이 모두 준비되었습니다. 내일은 다양한 카드 컴포넌트를 개발하여 사이트의 핵심 콘텐츠 디자인을 완성할 예정입니다.

다음을 실행하여 오늘의 변경사항을 확인해보세요:

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하면 개선된 UI를 볼 수 있습니다. 