# Day 21: 최종 테스트 및 문서화

## 목표

YkMake 프로젝트의 최종 테스트를 진행하고, 전체 프로젝트에 대한 문서화 작업을 수행합니다.

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
├── app/
│   ├── components/    # 재사용 가능한 컴포넌트
│   ├── routes/        # 페이지 컴포넌트
│   ├── models/        # 데이터 모델
│   ├── utils/         # 유틸리티 함수
│   └── styles/        # 스타일 파일
├── prisma/           # 데이터베이스 스키마
├── public/           # 정적 파일
└── tests/            # 테스트 파일
```

## 개발 가이드라인

### 코드 스타일

- ESLint와 Prettier를 사용하여 코드 스타일을 유지합니다.
- 컴포넌트는 함수형으로 작성합니다.
- 타입스크립트를 적극적으로 활용합니다.

### 커밋 메시지

커밋 메시지는 다음 형식을 따릅니다:

```
type: 제목

본문

footer
```

타입:
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 코드
- chore: 빌드 프로세스 변경

### 브랜치 전략

- main: 프로덕션 브랜치
- develop: 개발 브랜치
- feature/*: 기능 개발
- bugfix/*: 버그 수정
- release/*: 릴리스 준비
```

## 4. 배포 준비

### 배포 체크리스트

`docs/deployment/checklist.md` 파일을 생성하고 다음과 같이 구현합니다:

```markdown
# 배포 체크리스트

## 1. 환경 변수 확인

- [ ] DATABASE_URL이 프로덕션 데이터베이스를 가리키는지 확인
- [ ] SESSION_SECRET이 안전한 값으로 설정되었는지 확인
- [ ] AWS 인증 정보가 올바르게 설정되었는지 확인
- [ ] SMTP 설정이 올바른지 확인

## 2. 보안 점검

- [ ] 모든 API 엔드포인트에 인증이 적용되었는지 확인
- [ ] CORS 설정이 올바른지 확인
- [ ] Rate limiting이 적용되었는지 확인
- [ ] 민감한 정보가 로그에 노출되지 않는지 확인

## 3. 성능 최적화

- [ ] 이미지가 최적화되었는지 확인
- [ ] 번들 크기가 최적화되었는지 확인
- [ ] 캐시 설정이 올바른지 확인
- [ ] 데이터베이스 인덱스가 최적화되었는지 확인

## 4. 모니터링 설정

- [ ] 로그 수집이 설정되었는지 확인
- [ ] 메트릭 수집이 설정되었는지 확인
- [ ] 알림이 설정되었는지 확인
- [ ] 에러 트래킹이 설정되었는지 확인

## 5. 백업 설정

- [ ] 데이터베이스 백업이 설정되었는지 확인
- [ ] 파일 스토리지 백업이 설정되었는지 확인
- [ ] 복구 절차가 문서화되었는지 확인

## 6. 스케일링 준비

- [ ] 로드 밸런서가 설정되었는지 확인
- [ ] 오토스케일링이 설정되었는지 확인
- [ ] CDN이 설정되었는지 확인

## 7. 문서화 완료

- [ ] API 문서가 최신 상태인지 확인
- [ ] 배포 절차가 문서화되었는지 확인
- [ ] 트러블슈팅 가이드가 작성되었는지 확인
```

## 다음 단계

이제 YkMake 프로젝트의 모든 작업이 완료되었습니다! 다음과 같은 작업들이 성공적으로 수행되었습니다:

- 테스트 코드 작성 및 실행
- 성능 테스트 및 최적화
- API 문서 작성
- 개발 가이드 작성
- 배포 체크리스트 작성

프로젝트를 확인해보세요:

```bash
# 테스트 실행
npm test

# 성능 테스트 실행
npm run test:performance

# 문서 빌드
npm run docs:build
```

축하합니다! 이제 YkMake 프로젝트가 완성되었습니다. 🎉 