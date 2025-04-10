# Day 1: 프로젝트 설정 및 기본 구조

## 목표

오늘은 YkMake 프로젝트의 기초를 다지는 날입니다. Remix 프레임워크를 사용하여 프로젝트를 생성하고, 필요한 기본 구조와 도구를 설정합니다.

## 작업 목록

1. Remix 프로젝트 생성
2. 폴더 구조 설정
3. TailwindCSS 통합
4. Shadcn UI 컴포넌트 설정
5. 기본 라우팅 구성

## 1. Remix 프로젝트 생성

Remix는 React 기반의 풀스택 웹 프레임워크로, 웹 표준에 충실한 앱을 구축하기 위한 최적의 도구입니다.

### 필요 도구 설치

Node.js와 npm이 설치되어 **있어야** 합니다. 설치 여부는 다음 명령어로 확인할 수 있습니다:

```bash
node -v
npm -v
```

### Remix 프로젝트 생성

다음 명령어를 실행하여 새 Remix 프로젝트를 생성합니다:

```bash
npx create-remix@latest YkMake
```

설치 과정에서 다음과 같이 선택합니다:
- 배포 대상: Remix App Server
- TypeScript 사용: Yes
- ESLint 설정: Yes
- Prettier 설정: Yes

### 프로젝트 폴더로 이동

```bash
cd YkMake
```

## 2. 폴더 구조 설정

Remix 프로젝트의 기본 구조는 다음과 같으며, 필요한 추가 폴더를 생성합니다:

```
app/
├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── cards/      # 각종 카드 컴포넌트
│   ├── forms/      # 폼 관련 컴포넌트
│   ├── layouts/    # 레이아웃 컴포넌트
│   └── ui/         # Shadcn UI 컴포넌트
├── lib/            # 유틸리티 함수, 설정 등
│   ├── supabase/   # Supabase 클라이언트 및 관련 기능
│   ├── utils/      # 각종 유틸리티 함수
│   └── types/      # TypeScript 타입 정의
├── routes/         # 라우트 파일들 (페이지)
│   ├── _index.tsx            # 메인 페이지 (/)
│   ├── products.tsx          # 제품 레이아웃 페이지 (/products)
│   ├── products._index.tsx   # 제품 메인 페이지 (/products)
│   ├── community.tsx         # 커뮤니티 레이아웃 페이지 (/community)
│   ├── community._index.tsx  # 커뮤니티 메인 페이지 (/community)
│   ├── ideas.tsx             # IdeasGPT 레이아웃 페이지 (/ideas)
│   ├── ideas._index.tsx      # IdeasGPT 메인 페이지 (/ideas)
│   ├── jobs.tsx              # 구인/구직 레이아웃 페이지 (/jobs)
│   ├── jobs._index.tsx       # 구인/구직 메인 페이지 (/jobs)
│   ├── teams.tsx             # 팀 레이아웃 페이지 (/teams)
│   ├── teams._index.tsx      # 팀 메인 페이지 (/teams)
│   ├── profile.tsx           # 프로필 레이아웃 페이지 (/profile)
│   ├── profile._index.tsx    # 프로필 메인 페이지 (/profile)
│   ├── auth.tsx              # 인증 레이아웃 페이지 (/auth)
│   ├── auth.login.tsx        # 로그인 페이지 (/auth/login)
│   ├── auth.register.tsx     # 회원가입 페이지 (/auth/register)
│   └── dashboard.tsx         # 대시보드 레이아웃 페이지 (/dashboard)
├── styles/         # 글로벌 스타일 등
└── root.tsx        # 앱의 루트 컴포넌트
```

다음 명령어로 필요한 폴더들을 생성합니다:

```bash
mkdir -p app/components/{cards,forms,layouts,ui}
mkdir -p app/lib/{supabase,utils,types}
mkdir -p app/styles
```

## 3. TailwindCSS 통합

TailwindCSS는 유틸리티-퍼스트 CSS 프레임워크로, 빠르게 반응형 디자인을 구축할 수 있게 해줍니다.

### TailwindCSS 설치

다음 명령어를 실행하여 TailwindCSS와 필요한 의존성을 설치합니다:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### TailwindCSS 설정

`tailwind.config.js` 파일을 다음과 같이 수정합니다:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px',
			},
		},
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
```

### CSS 파일 생성

`app/styles/tailwind.css` 파일을 생성하고 다음 내용을 추가합니다:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Remix에 TailwindCSS 통합

`app/root.tsx` 파일을 수정하여 TailwindCSS를 가져옵니다:

```typescript
import styles from "~/tailwind.css";

export const links = () => [
  { rel: "stylesheet", href: styles },
];
```

## 4. Shadcn UI 컴포넌트 설정

Shadcn UI는 아름답고 접근성 높은 컴포넌트 라이브러리입니다.

### 의존성 설치

```bash
npm install -D @types/node
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install tailwindcss-animate
```

### Shadcn CLI 설치 및 초기화

```bash
npx shadcn@latest init
```

초기화 과정에서 다음과 같이 선택합니다:
- 스타일 사용: New York
- 기본 색상: Slate
- 글로벌 CSS 위치: app/styles/tailwind.css
- 컴포넌트 설치 경로: app/components/ui
- React Server Components 사용: No
- import alias 설정: ~/

### 일부 기본 컴포넌트 설치

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add navigation-menu
```

## 5. 기본 라우팅 구성

Remix는 파일 기반 라우팅 시스템을 사용합니다. 몇 가지 기본 페이지를 생성해보겠습니다.

### 루트 레이아웃 구성

`app/components/layouts/root-layout.tsx` 파일을 생성합니다:

```typescript
import { ReactNode } from "react";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-xl">YkMake</Link>
            <nav className="hidden md:flex gap-6">
              <Link to="/products" className="text-sm font-medium">제품</Link>
              <Link to="/community" className="text-sm font-medium">커뮤니티</Link>
              <Link to="/ideas" className="text-sm font-medium">IdeasGPT</Link>
              <Link to="/jobs" className="text-sm font-medium">구인/구직</Link>
              <Link to="/teams" className="text-sm font-medium">팀</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="outline">로그인</Button>
            </Link>
            <Link to="/auth/register">
              <Button>회원가입</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; 2023 YkMake. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

### 메인 페이지 구성

`app/routes/_index.tsx` 파일을 수정합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { RootLayout } from "~/components/layouts/root-layout";

export const meta: MetaFunction = () => {
  return [
    { title: "YkMake - 개발자들의 커뮤니티" },
    { name: "description", content: "아이디어부터 제품까지, 개발자들의 커뮤니티 YkMake" },
  ];
};

export default function Index() {
  return (
    <RootLayout>
      <div className="container py-12 md:py-24 lg:py-32">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            아이디어부터 제품까지
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            YkMake에서 당신의 아이디어를 현실로 만드세요. 다양한 개발자들과 함께 협업하고, 피드백을 받고, 성장하세요.
          </p>
        </div>
      </div>
    </RootLayout>
  );
}
```

### 제품 리스트 페이지 구성

`app/routes/products._index.tsx` 파일을 생성합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { RootLayout } from "~/components/layouts/root-layout";

export const meta: MetaFunction = () => {
  return [
    { title: "제품 - YkMake" },
    { name: "description", content: "YkMake의 다양한 제품들을 살펴보세요" },
  ];
};

export default function ProductsIndex() {
  return (
    <RootLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">제품</h1>
        <p className="text-muted-foreground mb-8">
          YkMake에서 개발자들이 만든 다양한 제품들을 살펴보세요.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* 실제 제품 카드들이 여기에 들어갈 예정입니다 */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">제품 준비 중</h2>
            <p className="text-sm text-muted-foreground">곧 다양한 제품이 추가될 예정입니다.</p>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
```

## 다음 단계

이제 프로젝트의 기본 구조가 완성되었습니다! 다음 단계에서는 CursorAI를 활용하여 UI를 확장하고 더 많은 컴포넌트를 구현할 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하면 YkMake 사이트의 기본 버전을 볼 수 있습니다. 