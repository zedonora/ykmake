# Day 14: API 연동 및 데이터베이스 작업

## 목표

오늘은 YkMake의 API 연동 및 데이터베이스 작업을 진행합니다. 실제 데이터를 저장하고 불러올 수 있도록 백엔드 시스템을 구축합니다.

## 작업 목록

1. 데이터베이스 스키마 설계
2. API 엔드포인트 구현
3. 데이터 로더 함수 구현
4. 액션 함수 구현

## 1. 데이터베이스 스키마 설계

Prisma를 사용하여 데이터베이스 스키마를 설계합니다.

### Prisma 설치

```bash
npm install prisma @prisma/client
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

## 2. API 엔드포인트 구현

API 엔드포인트를 구현하여 데이터베이스와 통신합니다.

### API 유틸리티 함수 생성

`app/utils/api.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { PrismaClient } from "@prisma/client";
import { json } from "@remix-run/node";

const prisma = new PrismaClient();

export { prisma };

export async function requireUser(request: Request) {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) {
    throw json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw json({ message: "User not found" }, { status: 404 });
  }

  return user;
}

export async function requireAdmin(request: Request) {
  const user = await requireUser(request);

  if (user.role !== "ADMIN") {
    throw json({ message: "Forbidden" }, { status: 403 });
  }

  return user;
}
```

### 세션 관리 유틸리티 생성

`app/utils/session.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { createCookieSessionStorage } from "@remix-run/node";

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
    maxAge: 60 * 60 * 24 * 30, // 30 days
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

export async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUser(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
```

## 3. 데이터 로더 함수 구현

각 페이지에서 필요한 데이터를 불러오는 로더 함수를 구현합니다.

### 제품 목록 로더

`app/routes/products/_index.tsx` 파일에 로더 함수를 추가합니다:

```typescript
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/api.server";

type LoaderData = {
  products: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    views: number;
    author: {
      name: string;
    };
    _count: {
      likes: number;
      comments: number;
    };
  }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const sort = url.searchParams.get("sort") || "latest";

  const products = await prisma.product.findMany({
    where: category ? { category } : undefined,
    orderBy: sort === "latest"
      ? { createdAt: "desc" }
      : sort === "popular"
      ? { likes: { _count: "desc" } }
      : { views: "desc" },
    include: {
      author: {
        select: { name: true },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

  return json<LoaderData>({ products });
};
```

### 팀 목록 로더

`app/routes/teams/_index.tsx` 파일에 로더 함수를 추가합니다:

```typescript
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/api.server";

type LoaderData = {
  teams: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    status: string;
    _count: {
      members: number;
    };
  }>;
};

export const loader: LoaderFunction = async ({ request }) => {
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

  return json<LoaderData>({ teams });
};
```

## 4. 액션 함수 구현

데이터를 수정하는 액션 함수를 구현합니다.

### 제품 생성 액션

`app/routes/products/new.tsx` 파일에 액션 함수를 추가합니다:

```typescript
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { prisma } from "~/utils/api.server";
import { requireUser } from "~/utils/api.server";

export const action: ActionFunction = async ({ request }) => {
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
    return json(
      { errors: { title: "Invalid input" } },
      { status: 400 }
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
};
```

### 팀 생성 액션

`app/routes/teams/new.tsx` 파일에 액션 함수를 추가합니다:

```typescript
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { prisma } from "~/utils/api.server";
import { requireUser } from "~/utils/api.server";

export const action: ActionFunction = async ({ request }) => {
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
    return json(
      { errors: { name: "Invalid input" } },
      { status: 400 }
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
};
```

## 다음 단계

이제 API 연동 및 데이터베이스 작업의 기본적인 구조가 완성되었습니다! 다음 단계에서는 실시간 기능을 개발하여 사용자들이 실시간으로 상호작용할 수 있도록 만들 예정입니다.

개발 서버를 실행하기 전에 데이터베이스를 마이그레이션하세요:

```bash
npx prisma migrate dev
```

그리고 개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

이제 다음과 같은 기능들이 실제 데이터베이스와 연동되어 동작합니다:
- 제품 목록 조회 및 필터링
- 팀 목록 조회 및 필터링
- 제품 생성
- 팀 생성
``` 