# Day 14: API 연동 및 데이터베이스 작업

## 목표

오늘은 YkMake의 API 연동 및 데이터베이스 작업을 진행합니다. Day 13에서 구현한 검색 및 필터링 기능을 실제 데이터베이스와 연동하여 동작하도록 하고, 사용자 인증 및 세션 관리를 구현합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성합니다:

```bash
# Prisma 관련 파일
mkdir -p prisma
touch prisma/schema.prisma
touch .env

# API 유틸리티 파일
mkdir -p app/utils
touch app/utils/api.server.ts
touch app/utils/session.server.ts

# 데이터 로더 파일 (플랫 네이밍 사용)
touch app/routes/products._index.tsx
touch app/routes/teams._index.tsx
touch app/routes/search.tsx

# 액션 함수 파일
touch app/routes/products.new.tsx
touch app/routes/teams.new.tsx
touch app/routes/auth.login.tsx
touch app/routes/auth.register.tsx
```

## 패키지 설치

```bash
# Prisma 패키지 설치
npm install prisma @prisma/client

# 인증 관련 패키지 설치
npm install bcryptjs
npm install @types/bcryptjs --save-dev

# TypeScript 노드 실행 관련 패키지 설치 (시드 데이터 실행에 필요)
npm install -D ts-node @types/node
```

## 작업 목록

1. 데이터베이스 스키마 설계
2. API 유틸리티 함수 구현
3. 세션 관리 유틸리티 구현
4. 데이터 로더 함수 구현
5. 액션 함수 구현
6. 검색 및 필터링 API 연동
7. 인증 기능 구현
8. 레이아웃 및 인덱스 페이지 구현

## 1. 데이터베이스 스키마 설계

Prisma를 사용하여 데이터베이스 스키마를 설계합니다.

### 환경 설정

`.env` 파일을 생성하고 다음과 같이 설정합니다:

```
DATABASE_URL="postgresql://username:password@localhost:5432/ykmake?schema=public"
SESSION_SECRET="your_session_secret_here"
```

### Prisma 초기화

```bash
npx prisma init
```

### 스키마 정의

`prisma/schema.prisma` 파일을 다음과 같이 구현합니다:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  role          Role      @default(USER)
  bio           String?
  website       String?
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  products      Product[]
  teams         TeamMember[]
  comments      Comment[]
  likes         Like[]
}

model Product {
  id          String    @id @default(cuid())
  title       String
  description String
  category    String
  image       String?
  views       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  author      User      @relation(fields: [authorId], references: [id])
  authorId    String
  comments    Comment[]
  likes       Like[]
}

model Team {
  id          String    @id @default(cuid())
  name        String
  description String
  category    String
  status      String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  members     TeamMember[]
}

model TeamMember {
  id        String    @id @default(cuid())
  role      String
  joinedAt  DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])
  userId    String
  team      Team      @relation(fields: [teamId], references: [id])
  teamId    String

  @@unique([userId, teamId])
}

model Comment {
  id        String    @id @default(cuid())
  content   String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  author    User      @relation(fields: [authorId], references: [id])
  authorId  String
  product   Product   @relation(fields: [productId], references: [id])
  productId String
}

model Like {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])
  userId    String
  product   Product   @relation(fields: [productId], references: [id])
  productId String

  @@unique([userId, productId])
}

enum Role {
  USER
  ADMIN
}
```

## 2. API 유틸리티 함수 구현

API 엔드포인트를 구현하여 데이터베이스와 통신하는 유틸리티 함수를 만듭니다.

### API 유틸리티 함수 생성

`app/utils/api.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { PrismaClient } from "@prisma/client";
// import { json } from "@remix-run/node"; // 구버전 문법
import { getSession } from "~/utils/session.server";

const prisma = new PrismaClient();

export { prisma };

export async function requireUser(request: Request) {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) {
    throw new Response(JSON.stringify({ message: "로그인이 필요합니다" }), { 
      status: 401,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Response(JSON.stringify({ message: "사용자를 찾을 수 없습니다" }), { 
      status: 404,
      headers: {
        "Content-Type": "application/json"
      } 
    });
  }

  return user;
}

export async function requireAdmin(request: Request) {
  const user = await requireUser(request);

  if (user.role !== "ADMIN") {
    throw new Response(JSON.stringify({ message: "관리자 권한이 필요합니다" }), { 
      status: 403,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  return user;
}

export async function incrementProductViews(productId: string) {
  return prisma.product.update({
    where: { id: productId },
    data: { views: { increment: 1 } }
  });
}
```

## 3. 세션 관리 유틸리티 구현

사용자 세션을 관리하는 유틸리티 함수를 구현합니다.

### 세션 관리 유틸리티 생성

`app/utils/session.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { prisma } from "~/utils/api.server";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "YkMake_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
    httpOnly: true,
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });
    return user;
  } catch {
    throw await logout(request);
  }
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function register({
  email,
  password,
  name
}: {
  email: string;
  password: string;
  name: string;
}) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    },
  });
}

export async function login({
  email,
  password
}: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return null;

  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) return null;

  return user;
}
```

## 4. 데이터 로더 함수 구현

각 페이지에서 필요한 데이터를 불러오는 로더 함수를 구현합니다.

### 제품 목록 로더

`app/routes/products._index.tsx` 파일을 수정하여 mock 데이터 대신 실제 데이터베이스 데이터를 사용하도록 변경합니다:

```typescript
import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { prisma } from "~/utils/api.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const sort = url.searchParams.get("sort") || "latest";

    // 모든 카테고리 가져오기
    const categoriesResult = await prisma.product.groupBy({
        by: ['category'],
    });
    const allCategories = categoriesResult.map(item => item.category);

    // 주목할 제품 (인기 제품) 가져오기
    const featuredProducts = await prisma.product.findMany({
        take: 3,
        orderBy: { views: 'desc' },
    include: {
      author: {
        select: { name: true },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

    // 최신 제품 가져오기
    const latestProducts = await prisma.product.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: { name: true },
            },
            _count: {
                select: { likes: true, comments: true },
            },
        },
    });

    return Response.json({
        featuredProducts,
        latestProducts,
        allCategories,
    });
}

export default function ProductsIndexPage() {
    const { featuredProducts, latestProducts, allCategories } = useLoaderData<typeof loader>();

    return (
        // 기존 UI 컴포넌트는 유지하되, 데이터 소스만 변경
    );
}
```

### 팀 목록 로더

`app/routes/teams._index.tsx` 파일에 로더 함수를 추가합니다:

```typescript
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const categories = url.searchParams.getAll("category");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("q");

  const teams = await prisma.team.findMany({
    where: {
      AND: [
        categories.length > 0
          ? { category: { in: categories } }
          : undefined,
        status ? { status } : undefined,
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : undefined,
      ].filter(Boolean),
    },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  return Response.json({ teams });
}
```

## 5. 액션 함수 구현

데이터를 수정하는 액션 함수를 구현합니다.

### 제품 생성 액션

`app/routes/products.new.tsx` 파일을 구현하여 제품 생성 기능을 추가합니다:

```typescript
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { prisma } from "~/utils/api.server";
import { requireUser } from "~/utils/api.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const description = formData.get("description");
  const category = formData.get("category");
  const image = formData.get("image");

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof category !== "string"
  ) {
        return new Response(
            JSON.stringify({ errors: { title: "유효하지 않은 입력입니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const product = await prisma.product.create({
    data: {
      title,
      description,
      category,
      image: typeof image === "string" ? image : undefined,
      author: {
        connect: { id: user.id },
      },
    },
  });

  return redirect(`/products/${product.id}`);
}

export default function NewProductPage() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        // 폼 UI 구현
    );
}
```

### 팀 생성 액션

`app/routes/teams.new.tsx` 파일을 수정하여 실제 데이터베이스 연동 기능을 추가합니다:

```typescript
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { prisma } from "~/utils/api.server";
import { requireUser } from "~/utils/api.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  const name = formData.get("name");
  const description = formData.get("description");
  const category = formData.get("category");

  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof category !== "string"
  ) {
        return new Response(
            JSON.stringify({ errors: { name: "유효하지 않은 입력입니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const team = await prisma.team.create({
    data: {
      name,
      description,
      category,
      status: "recruiting",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  return redirect(`/teams/${team.id}`);
}
```

### 로그인 액션

`app/routes/auth.login.tsx` 파일을 수정하여 실제 로그인 기능을 구현합니다:

```typescript
import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { login, createUserSession } from "~/utils/session.server";

export const meta: MetaFunction = () => {
    return [
        { title: "로그인 - YkMake" },
        { name: "description", content: "YkMake에 로그인하세요" },
    ];
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const redirectTo = formData.get("redirectTo") || "/dashboard";

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof redirectTo !== "string"
    ) {
        return new Response(
            JSON.stringify({ errors: { email: "유효하지 않은 입력입니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const user = await login({ email, password });
    if (!user) {
        return new Response(
            JSON.stringify({ errors: { email: "이메일 또는 비밀번호가 올바르지 않습니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    return createUserSession(user.id, redirectTo);
}
```

### 회원가입 기능 구현

`app/routes/auth.register.tsx` 파일을 수정하여 실제 회원가입 기능을 구현합니다:

```typescript
import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { register, createUserSession } from "~/utils/session.server";
import { prisma } from "~/utils/api.server";

export const meta: MetaFunction = () => {
    return [
        { title: "회원가입 - YkMake" },
        { name: "description", content: "YkMake에 회원가입하세요" },
    ];
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");
    const name = formData.get("name") || email;
    
    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string"
    ) {
        return new Response(
            JSON.stringify({ errors: { email: "유효하지 않은 입력입니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    if (password !== confirmPassword) {
        return new Response(
            JSON.stringify({ errors: { password: "비밀번호가 일치하지 않습니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    
    if (existingUser) {
        return new Response(
            JSON.stringify({ errors: { email: "이미 사용 중인 이메일입니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const user = await register({ email, password, name: name.toString() });
    return createUserSession(user.id, "/dashboard");
}
```

## 6. 검색 기능 API 연동

검색 기능을 데이터베이스와 연동합니다.

### 검색 API 구현

`app/routes/search.tsx` 파일을 수정하여 실제 데이터베이스 연동 검색 기능을 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { RootLayout } from "~/components/layouts/root-layout";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { SearchNav } from "~/components/search/search-nav";
import { prisma } from "~/utils/api.server";
import { getUser } from "~/utils/session.server";

export const meta: MetaFunction = () => {
    return [
        { title: "검색 결과 - YkMake" },
        { name: "description", content: "YkMake에서 검색 결과를 확인하세요" },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const type = url.searchParams.get("type") || "all";
    const user = await getUser(request);

    const [products, teams, users] = await Promise.all([
        type === "all" || type === "products"
            ? prisma.product.findMany({
                  where: {
                      OR: [
                          { title: { contains: query, mode: "insensitive" } },
                          { description: { contains: query, mode: "insensitive" } },
                      ],
                  },
                  include: {
                      author: { select: { name: true } },
                      _count: { select: { likes: true, comments: true } },
                  },
              })
            : [],
        // ... 팀, 사용자 검색 구현
    ]);

    // ... 결과 가공 및 반환
}
```

## 7. 인증 기능 구현

로그인 및 회원가입 기능을 구현합니다.

### 회원가입 기능 구현

`app/routes/auth.register.tsx` 파일에 회원가입 액션 함수를 추가합니다:

```typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { register, createUserSession } from "~/utils/session.server";
import { prisma } from "~/utils/api.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string"
  ) {
    return new Response(
      JSON.stringify({ errors: { email: "유효하지 않은 입력입니다" } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 이메일 중복 체크
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    return new Response(
      JSON.stringify({ errors: { email: "이미 사용 중인 이메일입니다" } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const user = await register({ email, password, name });
  return createUserSession(user.id, "/dashboard");
}
```

## 8. 레이아웃 및 인덱스 페이지 구현

API 연동을 위한 레이아웃과 인덱스 페이지를 구현합니다.

### 제품 레이아웃 구현

`app/routes/products.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "~/components/ui/client-only";
import { RootLayout } from "~/components/layouts/root-layout";

export default function ProductsLayout() {
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
        <Outlet />
      </div>
    </RootLayout>
  );
}
```

### 팀 레이아웃 구현

`app/routes/teams.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ClientOnly } from "~/components/ui/client-only";
import { RootLayout } from "~/components/layouts/root-layout";

export default function TeamsLayout() {
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
        <Outlet />
      </div>
    </RootLayout>
  );
}
```

### 검색 페이지 구현

예시로 `app/routes/search.products.tsx` 파일을 구현해 보겠습니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { SearchNav } from "~/components/search/search-nav";
import { prisma } from "~/utils/api.server";
import { getUser } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "제품 검색 - YkMake" },
    { name: "description", content: "YkMake에서 제품을 검색하세요" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const user = await getUser(request);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      author: { select: { name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  const results = products.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    url: `/products/${product.id}`,
    metadata: {
      views: product.views,
      likes: product._count.likes,
      comments: product._count.comments,
      author: product.author.name,
    },
  }));

  return Response.json({ results, user, query });
}
```

## 로그아웃 기능 개선

로그아웃 시 로그인 버튼이 중복으로 표시되는 문제를 해결하기 위해 다음과 같은 수정이 필요합니다.

### RootLayout 컴포넌트 수정

`app/components/layouts/root-layout.tsx` 파일에 `hideLoginButton` 속성을 추가합니다:

```typescript
interface RootLayoutProps {
    children: ReactNode;
    isLoggedIn?: boolean;
    isAdmin?: boolean;
    hideLoginButton?: boolean;
}

export function RootLayout({
    children,
    isLoggedIn = false,
    isAdmin: propIsAdmin,
    hideLoginButton = false,
}: RootLayoutProps) {
    // ...기존 코드...
}
```

그리고 로그인 버튼 표시 부분을 조건부로 수정합니다:

```typescript
{isLoggedIn ? (
    <DropdownMenu>
        {/* 사용자 메뉴 드롭다운 내용 */}
    </DropdownMenu>
) : (
    !hideLoginButton && (
        <Button asChild>
            <Link to="/auth/login">로그인</Link>
        </Button>
    )
)}
```

### 메인 페이지에서 RootLayout 속성 설정

`app/routes/_index.tsx` 파일에서 RootLayout에 hideLoginButton 속성을 true로 설정합니다:

```typescript
<div>
  <div className="fixed top-4 right-4 z-50 flex gap-2">
    <Button onClick={() => setIsLoggedIn(!isLoggedIn)}>
      {isLoggedIn ? "로그아웃" : "로그인"}
    </Button>
    {isLoggedIn && (
      <Button
        variant="outline"
        onClick={() => setIsAdmin(!isAdmin)}
      >
        {isAdmin ? "일반 사용자 모드" : "관리자 모드"}
      </Button>
    )}
  </div>
  <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin} hideLoginButton={true}>
    {/* 페이지 내용 */}
  </RootLayout>
</div>
```

이렇게 수정하면 메인 페이지에서는 상단에 고정된 로그인/로그아웃 버튼만 표시되고, RootLayout의 헤더에 있는 로그인 버튼은
숨겨져 중복 표시 문제가 해결됩니다.

### 로그아웃 로직 수정

로그아웃 시에도 중복 문제가 발생하지 않도록 로그아웃 로직을 수정합니다:

```typescript
<DropdownMenuItem asChild>
    <Link to="/" onClick={(e) => {
        e.preventDefault();
        if (typeof window !== "undefined") {
            localStorage.setItem("isLoggedIn", "false");
            localStorage.setItem("isAdmin", "false");
            setIsAdmin(false);
            window.dispatchEvent(new Event('logoutEvent'));
        }
    }}>
        로그아웃
    </Link>
</DropdownMenuItem>
```

### 레이아웃 컴포넌트에 이벤트 리스너 추가

`app/routes/dashboard.tsx`, `app/routes/settings.tsx`, `app/routes/admin.tsx` 등의 레이아웃 컴포넌트에 로그아웃 이벤트 리스너를 추가합니다:

```typescript
useEffect(() => {
    // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
    const loginState = localStorage.getItem("isLoggedIn");
    const adminState = localStorage.getItem("isAdmin");
    
    setIsLoggedIn(loginState === "true");
    setIsAdmin(adminState === "true");
    
    // 로그아웃 이벤트 리스너 추가
    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
    };
    
    window.addEventListener('logoutEvent', handleLogout);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
        window.removeEventListener('logoutEvent', handleLogout);
    };
}, []);
```

## 데이터베이스 마이그레이션 및 시드 데이터

스키마를 정의한 후 데이터베이스 마이그레이션을 실행합니다.

### 마이그레이션 실행

```bash
npx prisma migrate dev --name init
```

### 시드 데이터 설정

`package.json` 파일에 다음 내용을 추가합니다:

```json
{
  "prisma": {
    "seed": "node --loader ts-node/esm prisma/seed.ts"
  }
}
```

이 설정은 ESM 모듈 환경에서 TypeScript 파일을 실행하기 위한 설정으로, 시드 데이터를 제대로 실행하기 위해 필요합니다.

### 시드 데이터 생성

`prisma/seed.ts` 파일을 생성하여 초기 데이터를 추가합니다:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  // 관리자 계정 생성
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "관리자",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // 일반 사용자 계정 생성
  const userPassword = await bcrypt.hash("user1234", 10);
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "홍길동",
      password: userPassword,
      role: "USER",
    },
  });

  // 제품 데이터 생성
  const product1 = await prisma.product.create({
    data: {
      title: "AI 챗봇",
      description: "OpenAI API를 활용한 대화형 AI 챗봇",
      category: "AI",
      views: 523,
      authorId: user.id,
    },
  });

  // 팀 데이터 생성
  const team = await prisma.team.create({
    data: {
      name: "AI 개발팀",
      description: "AI 기반 제품 개발 팀",
      category: "development",
      status: "recruiting",
    },
  });

  // 팀 멤버 추가
  await prisma.teamMember.create({
    data: {
      role: "OWNER",
      userId: user.id,
      teamId: team.id,
    },
  });

  console.log(`데이터베이스 시드 완료`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 9. DB 스케마 및 API 동작 검증

데이터베이스 스키마와 API가 제대로 동작하는지 검증합니다.

### 마이그레이션 및 시드 데이터 실행

```bash
# 마이그레이션 실행
npx prisma migrate dev

# 시드 데이터 추가
npx prisma db seed

# 데이터베이스 확인
npx prisma studio
```

### API 동작 확인

다음과 같은 API 엔드포인트 및 기능을 테스트합니다:

1. 인증 API
   - 로그인: `/auth/login`
   - 회원가입: `/auth/register`

2. 제품 관련 API
   - 제품 목록 조회: GET `/products`
   - 제품 필터링: GET `/products?category=AI&sort=popular`
   - 제품 생성: POST `/products/new`

3. 팀 관련 API
   - 팀 목록 조회: GET `/teams`
   - 팀 필터링: GET `/teams?category=development&status=recruiting`
   - 팀 생성: POST `/teams/new`

4. 검색 API
   - 통합 검색: GET `/search?q=AI`
   - 제품 검색: GET `/search/products?q=AI`
   - 팀 검색: GET `/search/teams?q=AI`
   - 사용자 검색: GET `/search/users?q=홍길동`

## 다음 단계

이제 API 연동 및 데이터베이스 작업의 기본적인 구조가 완성되었습니다! 다음 단계에서는 실시간 기능을 개발하여 사용자들이 실시간으로 상호작용할 수 있도록 만들 예정입니다.

개발 서버를 실행하기 전에 데이터베이스를 마이그레이션하고 시드 데이터를 추가하세요:

```bash
npx prisma migrate dev
npx prisma db seed
```

그리고 개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

다음과 같은 URL로 접속하여 기능을 테스트할 수 있습니다:
- `http://localhost:3000/auth/login` - 로그인 페이지
- `http://localhost:3000/auth/register` - 회원가입 페이지
- `http://localhost:3000/search?q=AI` - 검색 페이지
- `http://localhost:3000/search/products?q=AI` - 제품 검색 페이지
- `http://localhost:3000/search/teams?q=AI` - 팀 검색 페이지
- `http://localhost:3000/search/users?q=홍길동` - 사용자 검색 페이지
- `http://localhost:3000/products` - 제품 목록 페이지
- `http://localhost:3000/teams` - 팀 목록 페이지

이제 다음과 같은 기능들이 실제 데이터베이스와 연동되어 동작합니다:
- 사용자 인증 (로그인/회원가입)
- 제품 목록 조회 및 필터링
- 팀 목록 조회 및 필터링
- 제품 및 팀 생성
- 통합 검색 기능 및 카테고리별 검색
``` 