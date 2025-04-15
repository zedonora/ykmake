# Day 21: 최종 테스트 및 문서화

## 목표

YkMake 프로젝트의 최종 테스트를 진행하고, 전체 프로젝트에 대한 문서화 작업을 수행합니다. 서비스 출시 전 마지막 점검 단계입니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일 및 디렉토리를 생성합니다:

```bash
# 테스트 관련 디렉토리 및 파일
mkdir -p app/components/ui/__tests__ app/utils/__tests__ tests/load tests/performance

touch app/components/ui/__tests__/button.test.tsx
touch app/utils/__tests__/api.server.test.ts
touch tests/load/product-list.js
touch tests/performance/navigation.js

# 문서화 관련 디렉토리 및 파일
mkdir -p docs/api docs/development docs/deployment

touch docs/api/README.md
touch docs/development/README.md
touch docs/deployment/checklist.md
```

## 필수 라이브러리 설치 (및 도구)

다음 명령어를 실행하여 테스트 관련 개발 의존성을 설치합니다. (프로젝트 설정에 따라 이미 설치되었을 수 있습니다.)

```bash
# 유닛/통합 테스트 (Vitest + Testing Library 예시)
npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom @testing-library/jest-dom

# 엔드투엔드/성능 테스트 (Playwright 예시)
npm install --save-dev playwright @playwright/test

# 로드 테스트 (k6) - Day 18 참고, 별도 설치 필요
# https://k6.io/docs/getting-started/installation/
```

문서화는 Markdown 형식으로 작성하며, 필요시 정적 사이트 생성기(예: VitePress, Docusaurus)를 도입할 수 있습니다.

## 작업 목록

1. 테스트 코드 작성
2. 성능 테스트
3. 문서화
4. 배포 준비

## 1. 테스트 코드 작성

### 컴포넌트 테스트

`app/components/ui/__tests__/button.test.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>테스트 버튼</Button>);
    expect(screen.getByText("테스트 버튼")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    await userEvent.click(screen.getByText("클릭"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", () => {
    render(<Button loading>로딩</Button>);
    expect(screen.getByText("로딩 중...")).toBeInTheDocument();
  });

  it("applies variant styles correctly", () => {
    const { rerender } = render(
      <Button variant="destructive">버튼</Button>
    );
    expect(screen.getByText("버튼")).toHaveClass(
      "bg-destructive"
    );

    rerender(<Button variant="outline">버튼</Button>);
    expect(screen.getByText("버튼")).toHaveClass(
      "border-input"
    );
  });
});
```

### 유틸리티 테스트

`app/utils/__tests__/api.server.test.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { vi, describe, it, expect, beforeEach } from "vitest";
import { requireUser, requireAdmin } from "../api.server";
import { createUserSession } from "../session.server";

vi.mock("../session.server", () => ({
  createUserSession: vi.fn(),
}));

describe("API Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireUser", () => {
    it("returns user when authenticated", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        role: "USER",
      };
      vi.mocked(createUserSession).mockResolvedValue(mockUser);

      const request = new Request("http://localhost:3000");
      const user = await requireUser(request);

      expect(user).toEqual(mockUser);
    });

    it("throws error when not authenticated", async () => {
      vi.mocked(createUserSession).mockResolvedValue(null);

      const request = new Request("http://localhost:3000");
      await expect(requireUser(request)).rejects.toThrow(
        "인증이 필요합니다"
      );
    });
  });

  describe("requireAdmin", () => {
    it("returns user when admin", async () => {
      const mockAdmin = {
        id: "1",
        email: "admin@example.com",
        role: "ADMIN",
      };
      vi.mocked(createUserSession).mockResolvedValue(mockAdmin);

      const request = new Request("http://localhost:3000");
      const admin = await requireAdmin(request);

      expect(admin).toEqual(mockAdmin);
    });

    it("throws error when not admin", async () => {
      const mockUser = {
        id: "1",
        email: "user@example.com",
        role: "USER",
      };
      vi.mocked(createUserSession).mockResolvedValue(mockUser);

      const request = new Request("http://localhost:3000");
      await expect(requireAdmin(request)).rejects.toThrow(
        "관리자 권한이 필요합니다"
      );
    });
  });
});
```

## 2. 성능 테스트

### 로드 테스트 스크립트

`tests/load/product-list.js` 파일을 생성하고 다음과 같이 구현합니다:

```javascript
import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const response = http.get("http://localhost:3000/products");
  check(response, {
    "상태 코드가 200": (r) => r.status === 200,
    "응답 시간이 500ms 미만": (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### 성능 테스트 스크립트

`tests/performance/navigation.js` 파일을 생성하고 다음과 같이 구현합니다:

```javascript
import { chromium } from "playwright";
import { expect } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 네비게이션 성능 측정
  const navigationStart = Date.now();
  await page.goto("http://localhost:3000");
  const navigationEnd = Date.now();

  console.log(
    `메인 페이지 로드 시간: ${navigationEnd - navigationStart}ms`
  );

  // 첫 번째 컨텐츠풀 페인트 측정
  const fcpMetric = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries[0].startTime);
      }).observe({ entryTypes: ["paint"] });
    });
  });

  console.log(`First Contentful Paint: ${fcpMetric}ms`);

  // 메모리 사용량 측정
  const metrics = await page.metrics();
  console.log(`JS 힙 크기: ${metrics.JSHeapUsedSize / 1024 / 1024}MB`);

  await browser.close();
})();
```

## 3. 문서화

### API 문서

`docs/api/README.md` 파일을 생성하고 다음과 같이 구현합니다:

```markdown
# YkMake API 문서

## 인증

### POST /api/auth/login

사용자 로그인을 처리합니다.

**요청**

```json
{
  "email": "string",
  "password": "string"
}
```

**응답**

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "USER" | "ADMIN"
  },
  "token": "string"
}
```

### POST /api/auth/register

새로운 사용자를 등록합니다.

**요청**

```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**응답**

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "USER"
  }
}
```

## 제품

### GET /api/products

제품 목록을 조회합니다.

**쿼리 파라미터**

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `category`: 카테고리 필터
- `sort`: 정렬 기준 ("latest" | "popular")

**응답**

```json
{
  "products": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "author": {
        "id": "string",
        "name": "string"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```
```
```

### 개발 가이드

`docs/development/README.md` 파일을 생성하고 다음과 같이 구현합니다:

```markdown
# YkMake 개발 가이드

## 시작하기

### 요구사항

- Node.js 18.0.0 이상
- PostgreSQL 14.0 이상
- Redis 6.0 이상

### 설치

1. 저장소 클론

```bash
git clone https://github.com/yourusername/ykmake.git
cd ykmake
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정합니다.

4. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

5. 개발 서버 실행

```bash
npm run dev
```

## 프로젝트 구조

```
ykmake/
├── app/ # Remix 애플리케이션 코드
│ ├── components/ # 재사용 가능한 UI 컴포넌트 (ui/, feedback/, guide/ 등)
│ ├── routes/ # 라우트 파일 (Flat Routes 컨벤션)
│ ├── models/ # 데이터베이스 모델 관련 함수 (예: user.server.ts)
│ ├── utils/ # 유틸리티 함수 (api.server.ts, cache.server.ts, a11y.ts 등)
│ ├── styles/ # 전역 스타일 (필요시)
│ ├── entry.client.tsx # 클라이언트 측 진입점
│ ├── entry.server.tsx # 서버 측 진입점
│ └── root.tsx # 루트 레이아웃 컴포넌트
├── prisma/ # Prisma 관련 파일
│ ├── schema.prisma # 데이터베이스 스키마 정의
│ ├── migrations/ # 데이터베이스 마이그레이션 기록
│ └── seed.ts # 데이터 시딩 스크립트 (선택 사항)
├── public/ # 정적 파일 (favicon, images 등)
├── tests/ # 엔드투엔드, 로드, 성능 테스트 스크립트
│ ├── load/
│ └── performance/
├── docs/ # 프로젝트 문서
│ ├── api/
│ ├── development/
│ └── deployment/
├── nginx/ # Nginx 설정 파일
├── grafana/ # Grafana 설정 (provisioning/, dashboards/)
├── prometheus/ # Prometheus 설정
├── certbot/ # Certbot 설정 및 인증서 저장 위치
├── scripts/ # 배포, 갱신 등 자동화 스크립트
├── .env # 로컬 환경 변수 (Git 무시)
├── .env.example # 환경 변수 예시
├── docker-compose.yml # Docker Compose 설정
├── Dockerfile # 애플리케이션 Docker 이미지 빌드 설정
├── package.json # 프로젝트 의존성 및 스크립트
├── tsconfig.json # TypeScript 설정
└── README.md # 프로젝트 개요 및 기본 정보
```

## 3. 개발 가이드라인

### 3.1. 코드 스타일

-   ESLint 와 Prettier 를 사용하여 코드 스타일 일관성을 유지합니다. (`package.json`의 lint/format 스크립트 참고)
-   TypeScript를 적극 활용하여 타입 안정성을 높입니다.
-   Remix의 loader/action 패턴을 활용하여 데이터 로딩 및 변경을 처리합니다.
-   컴포넌트는 기능별로 분리하고, 필요시 shadcn/ui (또는 사용한 라이브러리) 컨벤션을 따릅니다.

### 3.2. 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따르는 것을 권장합니다.

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

-   **type:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
-   **scope:** 변경된 부분 (예: `auth`, `product`, `ui`)
-   **description:** 변경 내용 요약 (현재 시제, 명령형)

### 3.3. 브랜치 전략

[Gitflow](https://nvie.com/posts/a-successful-git-branching-model/) 또는 [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow) 와 같은 표준 브랜치 전략 사용을 권장합니다.

-   `main` (또는 `master`): 안정적인 릴리스 버전
-   `develop`: 다음 릴리스를 위한 개발 진행 브랜치
-   `feature/<feature-name>`: 기능 개발
-   `fix/<issue-number>` 또는 `hotfix/<issue-number>`: 버그 수정
-   `release/<version>`: 릴리스 준비

### 3.4. 테스트

-   **단위/통합 테스트:** Vitest와 Testing Library를 사용하여 컴포넌트 및 유틸리티 함수를 테스트합니다. (`app` 디렉토리 내 `__tests__` 폴더 참고)
-   **엔드투엔드 테스트:** Playwright를 사용하여 주요 사용자 시나리오를 테스트합니다. (`tests/e2e` 폴더 권장)
-   테스트 커버리지를 측정하고 유지 관리합니다.

## 4. 주요 유틸리티 및 기능

-   **인증:** `app/utils/auth.server.ts`, `app/utils/session.server.ts`
-   **데이터베이스:** `prisma/schema.prisma`, `app/models/*.server.ts`
-   **캐싱:** `app/utils/cache.server.ts`
-   **로깅:** `app/utils/logger.server.ts`
-   **알림:** `app/utils/alert.server.ts`
-   **에러 모니터링:** `app/utils/error-monitoring.server.ts`
-   **분석:** `app/utils/analytics.client.ts`


### 배포 체크리스트

`docs/deployment/checklist.md` 파일을 생성하고 배포 전 확인해야 할 항목들을 정리합니다:

```markdown
# YkMake 배포 체크리스트

이 체크리스트는 YkMake 애플리케이션을 프로덕션 환경에 배포하기 전 확인해야 할 주요 항목들을 포함합니다.

## ✅ 사전 준비 (Pre-Deployment)

-   [ ] **코드 동결:** 배포할 최종 코드 버전 확정 (예: `main` 브랜치 최신 커밋 또는 특정 릴리스 태그)
-   [ ] **최종 테스트 통과:** 모든 단위/통합/E2E 테스트 통과 확인 (`npm test`, `npm run test:e2e`)
-   [ ] **환경 변수 설정:**
    -   [ ] `.env.production` 파일 생성 및 모든 필수 환경 변수 설정 확인 (DB, 세션 시크릿, API 키, SMTP, 모니터링 등)
    -   [ ] 민감 정보 (비밀번호, API 키)가 코드 저장소에 포함되지 않았는지 확인
-   [ ] **데이터베이스 마이그레이션:**
    -   [ ] 모든 Prisma 마이그레이션 스크립트 검토 및 테스트 완료
    -   [ ] 프로덕션 DB 백업 수행 또는 백업 정책 확인
-   [ ] **종속성 확인:** `package.json` 및 `package-lock.json` 최종 버전 확인

## ✅ 배포 프로세스 (Deployment Process)

-   [ ] **서버 접속 및 권한 확인:** 배포 대상 서버 접속 및 필요한 파일/디렉토리 권한 확인
-   [ ] **코드 배포:** 최신 코드 서버로 전송 (예: `git pull`, CI/CD 파이프라인)
-   [ ] **Docker 이미지 빌드:** 프로덕션용 Docker 이미지 빌드 (`docker compose build`)
-   [ ] **서비스 중지 (필요시):** 무중단 배포가 아닌 경우 기존 서비스 중지 (`docker compose down`)
-   [ ] **데이터베이스 마이그레이션 실행:** (`docker compose exec app npx prisma migrate deploy`)
-   [ ] **서비스 시작:** 새로운 버전의 서비스 시작 (`docker compose up -d`)
-   [ ] **Nginx 설정 적용:** Nginx 설정 파일 확인 및 리로드 (`docker compose exec nginx nginx -s reload`)
-   [ ] **SSL 인증서 갱신 확인:** SSL 인증서 유효 기간 확인 및 필요시 갱신 (`scripts/renew-cert.sh` 실행 또는 자동 갱신 설정 확인)

## ✅ 배포 후 확인 (Post-Deployment)

-   [ ] **서비스 상태 확인:**
    -   [ ] 애플리케이션 접속 및 주요 기능 정상 작동 확인 (로그인, 제품/팀 목록 등)
    -   [ ] Docker 컨테이너 로그 확인 (`docker compose logs -f app`, `docker compose logs -f nginx` 등)
    -   [ ] Nginx 접근 로그 및 에러 로그 확인
-   [ ] **모니터링 시스템 확인:**
    -   [ ] Grafana 대시보드에서 시스템 메트릭 및 애플리케이션 메트릭 정상 수집 확인
    -   [ ] Prometheus 타겟 상태 확인 (`http://<prometheus-ip>:9090/targets`)
    -   [ ] Sentry 에러 리포팅 정상 작동 확인 (테스트 에러 발생 등)
    -   [ ] Slack 알림 채널 확인
-   [ ] **성능 테스트 (선택 사항):** 배포 후 간단한 성능 테스트 실행 (`k6 run ...`)
-   [ ] **보안 스캔 (선택 사항):** 배포된 환경 대상 보안 스캔 실행 (`scripts/security-test.sh`)
-   [ ] **백업 확인:** 배포 후 첫 백업 정상 수행 확인

## ✅ 롤백 계획 (Rollback Plan)

-   [ ] 롤백 조건 정의 (예: 심각한 오류 발생, 성능 저하 등)
-   [ ] 롤백 절차 확인 및 테스트 (`scripts/rollback.sh` 등)
-   [ ] 데이터베이스 롤백 필요 여부 및 절차 확인

---

*이 체크리스트는 일반적인 항목이며, 프로젝트의 특성 및 인프라 환경에 따라 수정/보완이 필요합니다.*
```

## 4. 최종 배포 준비 확인

위의 테스트 및 문서화 작업을 완료하고, 배포 체크리스트를 통해 모든 항목을 점검하여 최종 배포 준비를 마칩니다.

## 다음 단계

이제 YkMake 프로젝트의 개발, 테스트, 문서화의 모든 단계가 완료되었습니다!

프로젝트를 확인하고 최종 점검을 수행하세요:

```bash
# 모든 테스트 실행
npm test

# (선택 사항) E2E 테스트 실행
# npm run test:e2e

# (선택 사항) 최종 성능 테스트 실행
# k6 run tests/load/product-list.js

# (선택 사항) 문서 확인 (로컬 빌드 등)
# npm run docs:dev

# 배포 체크리스트 검토
cat docs/deployment/checklist.md
```

축하합니다! 이제 YkMake 프로젝트를 실제 사용자에게 선보일 준비가 되었습니다. 🎉 지속적인 모니터링과 사용자 피드백 반영을 통해 서비스를 더욱 발전시켜 나가세요!