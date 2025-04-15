# Day 19: 서비스 안정화 및 최적화

## 목표

오늘은 YkMake의 안정성과 성능을 개선합니다. 사용자 경험을 향상시키고 서비스의 안정성을 높이기 위한 다양한 최적화 작업을 진행합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성하고 디렉토리를 확인합니다:

```bash
mkdir -p app/components/ui app/utils app/models prisma
touch app/components/ui/optimized-image.tsx
touch app/utils/request-handler.server.ts
touch app/utils/validators.server.ts
# app/root.tsx, prisma/schema.prisma, app/models/product.server.ts, app/utils/cache.server.ts 파일은 수정합니다.
```

## 필수 라이브러리 설치 (및 도구)

다음 명령어를 실행하여 최적화 관련 라이브러리를 설치합니다.

```bash
npm install react-intersection-observer zod node-cache
# npm install --save-dev @types/node-cache # 필요시 타입 설치
```

성능 테스트에는 **k6**가 필요합니다. (Day 18 참고)
데이터베이스 확인에는 **Prisma Studio** (`npx prisma studio`)가 사용됩니다.
번들 크기 분석을 위해서는 프로젝트에 **번들 분석 도구** (예: `@remix-run/dev`의 analyze 기능 또는 `webpack-bundle-analyzer`) 설정 및 관련 `package.json` 스크립트 (예: `npm run analyze`)가 필요합니다.

## 작업 목록

1. 프론트엔드 최적화
2. 백엔드 최적화
3. 데이터베이스 최적화
4. 캐시 최적화

## 1. 프론트엔드 최적화

### 번들 크기 최적화

`app/root.tsx` 파일을 수정하여 코드 스플리팅을 구현합니다:

```typescript
import { lazy, Suspense } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { LoadingSpinner } from "~/components/ui/loading-spinner";

// 지연 로딩할 컴포넌트들
const ProductList = lazy(() => import("~/components/products/product-list"));
const TeamList = lazy(() => import("~/components/teams/team-list"));
const ChatWindow = lazy(() => import("~/components/chat/chat-window"));

export default function App() {
  return (
    <html lang="ko">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

### 이미지 최적화

`app/components/ui/optimized-image.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "50px 0px",
  });

  const imageUrl = new URL(src);
  
  // 이미지 크기에 따라 최적화된 URL 생성
  if (width) {
    imageUrl.searchParams.set("w", width.toString());
  }
  if (height) {
    imageUrl.searchParams.set("h", height.toString());
  }
  
  // WebP 지원 확인
  const supportsWebP = useEffect(() => {
    const canvas = document.createElement("canvas");
    if (canvas.getContext && canvas.getContext("2d")) {
      return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
    }
    return false;
  }, []);

  if (supportsWebP) {
    imageUrl.searchParams.set("format", "webp");
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {inView && (
        <>
          <img
            src={imageUrl.toString()}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`
              transition-opacity duration-300
              ${loaded ? "opacity-100" : "opacity-0"}
            `}
          />
          {!loaded && <LoadingSpinner className="absolute inset-0" />}
        </>
      )}
    </div>
  );
}
```

## 2. 백엔드 최적화

### 요청 처리 최적화

`app/utils/request-handler.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { ZodError } from "zod";
import { logger } from "./logger.server";
import { captureError } from "./error-monitoring.server";
import { getCache, setCache } from "./cache.server";

interface RequestHandlerOptions<T> {
  cacheKey?: string;
  cacheTTL?: number;
  validate?: (data: any) => T;
}

export async function handleRequest<T>(
  handler: () => Promise<T>,
  options: RequestHandlerOptions<T> = {},
) {
  try {
    // 캐시된 데이터 확인
    if (options.cacheKey) {
      const cached = await getCache<T>(options.cacheKey);
      if (cached) {
        return Response.json(cached);
      }
    }

    // 요청 처리
    const data = await handler();

    // 데이터 검증
    if (options.validate) {
      options.validate(data);
    }

    // 캐시 저장
    if (options.cacheKey) {
      await setCache(
        options.cacheKey,
        data,
        options.cacheTTL,
      );
    }

    return Response.json(data);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Validation Error", details: error.errors },
        { status: 400 },
      );
    }

    logger.error("Request failed", { error });
    await captureError(error as Error);

    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

### 데이터 검증 최적화

`app/utils/validators.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { z } from "zod";

export const ProductSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: z.string().min(1),
  image: z.string().url().optional(),
});

export const TeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: z.string().min(1),
  status: z.enum(["recruiting", "in-progress", "completed"]),
});

export const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
});
```

## 3. 데이터베이스 최적화

### 인덱스 최적화

`prisma/schema.prisma` 파일에 인덱스를 추가합니다:

```prisma
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

  @@index([category])
  @@index([createdAt])
  @@index([authorId])
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

  @@index([category, status])
  @@index([createdAt])
}
```

**참고:** Prisma 스키마 수정 후에는 반드시 `npx prisma migrate dev --name add_indexes` 와 같은 명령어로 마이그레이션을 생성 및 적용하고, `npx prisma generate` 명령어로 Prisma Client를 업데이트해야 합니다.

### 쿼리 최적화

`app/models/product.server.ts` 파일을 수정하여 쿼리를 최적화합니다:

```typescript
import { prisma } from "~/utils/api.server";
import { ProductSchema } from "~/utils/validators.server";
import type { Product } from "@prisma/client";

export async function getProducts(options: {
  category?: string;
  sort?: "latest" | "popular";
  page?: number;
  limit?: number;
}) {
  const { category, sort = "latest", page = 1, limit = 20 } = options;

  const where = category ? { category } : undefined;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: sort === "latest"
        ? { createdAt: "desc" }
        : { likes: { _count: "desc" } },
      include: {
        author: {
          select: { name: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
    },
  };
}
```

## 4. 캐시 최적화

### 캐시 계층화

`app/utils/cache.server.ts` 파일을 수정하여 캐시 계층화를 구현합니다:

```typescript
import { createClient } from "redis";
import NodeCache from "node-cache";
import { ENV } from "./env.server";
import { logger } from "./logger.server";

// 메모리 캐시
const memoryCache = new NodeCache({
  stdTTL: 60, // 1분
  checkperiod: 120,
});

// Redis 클라이언트
const redis = createClient({
  url: ENV.REDIS_URL,
});

redis.on("error", (err) => logger.error("Redis Client Error", err));

// 캐시 계층화 구현
export async function getCache<T>(key: string): Promise<T | null> {
  // 1. 메모리 캐시 확인
  const memoryResult = memoryCache.get<T>(key);
  if (memoryResult) {
    return memoryResult;
  }

  // 2. Redis 캐시 확인
  const redisResult = await redis.get(key);
  if (redisResult) {
    const parsed = JSON.parse(redisResult);
    // 메모리 캐시에도 저장
    memoryCache.set(key, parsed);
    return parsed;
  }

  return null;
}

export async function setCache<T>(
  key: string,
  value: T,
  expiresIn: number = 3600,
): Promise<void> {
  // 1. 메모리 캐시에 저장
  memoryCache.set(key, value, Math.min(expiresIn, 300)); // 최대 5분

  // 2. Redis에 저장
  await redis.set(key, JSON.stringify(value), {
    EX: expiresIn,
  });
}

export async function invalidateCache(key: string): Promise<void> {
  // 1. 메모리 캐시에서 삭제
  memoryCache.del(key);

  // 2. Redis에서 삭제
  await redis.del(key);
}

// 캐시 키 생성 헬퍼
export function createCacheKey(
  prefix: string,
  params: Record<string, any>,
): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `${prefix}:${sortedParams}`;
}
```

## 다음 단계

이제 서비스 안정화와 최적화 작업의 기본적인 구조가 완성되었습니다! 다음 단계에서는 사용자 피드백을 수집하고 개선 사항을 적용할 예정입니다.

최적화가 잘 적용되었는지 확인해보세요:

```bash
# 성능 테스트 실행
k6 run scripts/performance-test.js

# 프론트엔드 번들 크기 분석
npm run analyze

# 데이터베이스 쿼리 분석
npx prisma studio
```

이제 다음과 같은 최적화가 적용되었습니다:
- 코드 스플리팅을 통한 번들 크기 최적화
- 이미지 지연 로딩 및 최적화
- 데이터베이스 인덱스 최적화
- 다층 캐시 시스템 구현
``` 