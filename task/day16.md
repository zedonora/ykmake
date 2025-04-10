# Day 16: 배포 준비

## 목표

오늘은 YkMake의 배포를 위한 준비 작업을 진행합니다. 프로덕션 환경에서 안정적으로 서비스를 운영하기 위한 설정을 구성합니다.

## 작업 목록

1. 환경 변수 설정
2. 보안 설정
3. 성능 최적화
4. 배포 스크립트 작성

## 1. 환경 변수 설정

### 환경 변수 파일 생성

`.env.example` 파일을 생성하고 다음과 같이 구현합니다:

```env
# App
NODE_ENV=development
SESSION_SECRET=your-session-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ykmake

# Auth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# Storage
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-northeast-2
S3_BUCKET=your-s3-bucket-name

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
```

### 환경 변수 로드 유틸리티

`app/utils/env.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} must be set`);
  }
  return value;
}

export const ENV = {
  NODE_ENV: getEnvVar("NODE_ENV"),
  SESSION_SECRET: getEnvVar("SESSION_SECRET"),
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  
  GITHUB_CLIENT_ID: getEnvVar("GITHUB_CLIENT_ID"),
  GITHUB_CLIENT_SECRET: getEnvVar("GITHUB_CLIENT_SECRET"),
  GOOGLE_CLIENT_ID: getEnvVar("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnvVar("GOOGLE_CLIENT_SECRET"),
  KAKAO_CLIENT_ID: getEnvVar("KAKAO_CLIENT_ID"),
  KAKAO_CLIENT_SECRET: getEnvVar("KAKAO_CLIENT_SECRET"),
  
  AWS_ACCESS_KEY_ID: getEnvVar("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: getEnvVar("AWS_SECRET_ACCESS_KEY"),
  AWS_REGION: getEnvVar("AWS_REGION"),
  S3_BUCKET: getEnvVar("S3_BUCKET"),
  
  SMTP_HOST: getEnvVar("SMTP_HOST"),
  SMTP_PORT: getEnvVar("SMTP_PORT"),
  SMTP_USER: getEnvVar("SMTP_USER"),
  SMTP_PASS: getEnvVar("SMTP_PASS"),
} as const;
```

## 2. 보안 설정

### 보안 헤더 설정

`app/entry.server.tsx` 파일을 수정하여 보안 헤더를 추가합니다:

```typescript
import { PassThrough } from "stream";
import {
  createReadableStreamFromReadable,
  type EntryContext,
} from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { getEnv } from "./utils/env.server";

const ABORT_DELAY = 5000;

// 보안 헤더 설정
const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:;",
};

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  // 보안 헤더 추가
  Object.entries(securityHeaders).forEach(([key, value]) => {
    responseHeaders.set(key, value);
  });

  return isbot(request.headers.get("user-agent"))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      );
}

// ... 기존 코드 ...
```

## 3. 성능 최적화

### 이미지 최적화

`app/utils/image.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "./env.server";

const s3 = new S3Client({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
});

export async function optimizeAndUploadImage(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  // JPEG로 변환하고 품질 조정
  const optimized = await sharp(buffer)
    .jpeg({ quality: 80, progressive: true })
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .toBuffer();

  const key = `images/${Date.now()}-${filename}`;
  
  await s3.send(
    new PutObjectCommand({
      Bucket: ENV.S3_BUCKET,
      Key: key,
      Body: optimized,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000",
    }),
  );

  return `https://${ENV.S3_BUCKET}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
}
```

### 캐시 설정

`app/utils/cache.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { createClient } from "redis";
import { ENV } from "./env.server";

const redis = createClient({
  url: ENV.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;
  return JSON.parse(value);
}

export async function setCache<T>(
  key: string,
  value: T,
  expiresIn: number = 3600,
): Promise<void> {
  await redis.set(key, JSON.stringify(value), {
    EX: expiresIn,
  });
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
}
```

## 4. 배포 스크립트 작성

### Docker 설정

`Dockerfile`을 생성하고 다음과 같이 구현합니다:

```dockerfile
# 빌드 스테이지
FROM node:18-alpine as builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM node:18-alpine

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --production

# 빌드된 파일 복사
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# 환경 변수 설정
ENV NODE_ENV=production

# 포트 설정
EXPOSE 3000

# 서버 실행
CMD ["npm", "start"]
```

### Docker Compose 설정

`docker-compose.yml` 파일을 생성하고 다음과 같이 구현합니다:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/ykmake
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=ykmake
    volumes:
      - postgres_data:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### GitHub Actions 워크플로우

`.github/workflows/deploy.yml` 파일을 생성하고 다음과 같이 구현합니다:

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: your-username/ykmake:latest

      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/ykmake
            docker-compose pull
            docker-compose up -d
```

## 다음 단계

이제 배포를 위한 기본적인 준비가 완료되었습니다! 다음 단계에서는 실제 서버에 배포하고 모니터링 시스템을 구축할 예정입니다.

배포 준비가 잘 되었는지 로컬에서 테스트해보세요:

```bash
# Docker 이미지 빌드
docker build -t ykmake .

# Docker Compose로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

이제 다음과 같은 설정들이 완료되었습니다:
- 환경 변수 관리
- 보안 헤더 설정
- 이미지 최적화
- 캐시 시스템
- Docker 컨테이너화
- CI/CD 파이프라인
``` 