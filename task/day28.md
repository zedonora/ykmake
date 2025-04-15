# Day 28: 애플리케이션 배포 준비 및 최종 점검

## 목표

개발된 애플리케이션을 실제 운영 환경에 배포하기 전에 필요한 준비 작업을 수행하고, 기능 및 성능에 대한 최종 점검을 완료합니다.

## 작업 목록

1.  **환경 변수 설정:** 운영 환경(Production)에 필요한 환경 변수(API 키, 데이터베이스 연결 정보 등)를 안전하게 설정합니다.
2.  **빌드 최적화:** 프로덕션 빌드를 생성하고, 코드 스플리팅, 압축 등을 통해 로딩 성능을 최적화합니다.
3.  **데이터베이스 마이그레이션:** 개발 환경과 운영 환경 간의 데이터베이스 스키마 동기화를 확인하고, 필요한 마이그레이션을 실행합니다.
4.  **정적 에셋 처리:** 이미지, CSS, JavaScript 파일 등 정적 에셋이 효율적으로 제공되는지 확인합니다 (CDN 사용 고려).
5.  **보안 점검:** 알려진 보안 취약점(OWASP Top 10 등)을 점검하고, 보안 헤더(CSP, HSTS 등) 설정을 확인합니다.
6.  **기능 테스트:** 주요 기능들이 운영 환경 설정에서 정상적으로 동작하는지 최종 테스트를 수행합니다.
7.  **성능 테스트:** 부하 테스트 등을 통해 운영 환경에서의 성능을 예측하고 병목 현상을 확인합니다 (필요시 Day 20 내용 참고).
8.  **로그 및 모니터링 설정:** 운영 환경에서의 오류 추적 및 성능 모니터링 도구(Sentry, Datadog 등)를 설정합니다.
9.  **배포 스크립트 작성:** 배포 과정을 자동화하는 스크립트를 작성하거나 CI/CD 파이프라인을 설정합니다.
10. **백업 및 복구 계획:** 데이터베이스 및 중요 데이터에 대한 정기적인 백업 및 복구 절차를 마련합니다.

## 1. 환경 변수 설정

운영 환경에서는 별도의 `.env` 파일 또는 호스팅 플랫폼(Vercel, Fly.io, AWS 등)에서 제공하는 환경 변수 관리 기능을 사용합니다.

-   **`NODE_ENV`:** `production`으로 설정합니다.
-   **`DATABASE_URL`:** 운영 데이터베이스 연결 문자열
-   **`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`:** 운영 Supabase 프로젝트 정보
-   **`SESSION_SECRET`:** 복잡하고 예측 불가능한 문자열
-   **`RESEND_API_KEY` (또는 다른 이메일 서비스 키):** 운영용 API 키
-   **`LIVEBLOCKS_SECRET_KEY` (Liveblocks 사용 시):** 운영용 비밀 키
-   기타 API 키 (결제, 분석 등)

**주의:** 민감한 정보(API 키, 비밀 키 등)는 코드 저장소에 직접 커밋하지 않도록 `.gitignore`에 `.env` 파일을 추가해야 합니다.

## 2. 빌드 최적화

Remix는 프로덕션 빌드 시 자동으로 코드 최적화를 수행합니다.

!!!bash
# 프로덕션 빌드 생성
npm run build

# 빌드 결과물 확인 (remix.config.js 설정에 따라 다름)
ls -lh build/client
ls -lh build/server
!!!

-   Remix의 라우트 기반 코드 스플리팅이 적용되었는지 확인합니다.
-   빌드된 에셋의 크기를 점검하고, 불필요하게 큰 파일이 있는지 확인합니다.

## 3. 데이터베이스 마이그레이션

Supabase를 사용하는 경우, Supabase CLI 또는 마이그레이션 도구를 사용하여 스키마 변경 사항을 운영 데이터베이스에 안전하게 적용합니다.

!!!bash
# Supabase CLI 사용 예시 (프로젝트 연결 필요)

# 1. 로컬 변경사항으로 마이그레이션 파일 생성
supabase migration new <migration_name>

# 2. 로컬 DB에 마이그레이션 적용 (테스트용)
supabase db reset # 주의: 로컬 데이터 초기화
supabase migration up

# 3. 운영 DB에 마이그레이션 적용 (주의해서 실행!)
# supabase login 필요
supabase link --project-ref <your-project-ref>
supabase migration up # 연결된 원격 DB에 적용
!!!

-   마이그레이션 실행 전에 반드시 운영 데이터베이스를 백업합니다.
-   단계적으로 마이그레이션을 적용하고, 각 단계 후 애플리케이션 동작을 확인하는 것이 안전합니다.

## 4. 정적 에셋 처리

Remix는 빌드 시 정적 에셋(CSS, 클라이언트 JavaScript 등)을 `build/client` 디렉토리에 생성합니다. 이 파일들이 효율적으로 제공되는지 확인합니다.

-   **캐싱:** HTTP 캐시 헤더(`Cache-Control`)가 적절하게 설정되어 브라우저 캐싱이 활용되는지 확인합니다.
-   **CDN:** 트래픽이 많거나 글로벌 사용자 대상 서비스인 경우, Cloudflare, AWS CloudFront 등의 CDN 사용을 고려하여 로딩 속도를 개선하고 서버 부하를 줄입니다.

## 5. 보안 점검

-   **의존성 검사:** `npm audit` 또는 Snyk, Dependabot 같은 도구를 사용하여 알려진 보안 취약점이 있는 라이브러리가 있는지 확인하고 업데이트합니다.
    !!!bash
    npm audit
    !!!
-   **입력 값 검증:** 사용자 입력(폼 데이터, URL 파라미터 등)이 서버 측에서 충분히 검증되고 이스케이프 처리되는지 확인합니다 (SQL Injection, XSS 방지).
-   **인증 및 인가:** 접근 제어가 필요한 라우트나 API에 대해 인증 및 인가 로직이 올바르게 적용되었는지 확인합니다 (Day 21 내용 참고).
-   **보안 헤더 설정:** `remix.config.js` 또는 서버 어댑터(Express, Vercel 등) 설정을 통해 보안 관련 HTTP 헤더를 설정합니다.
    -   `Content-Security-Policy (CSP)`: 신뢰할 수 있는 스크립트, 스타일, 이미지 소스만 허용하여 XSS 공격 위험을 줄입니다.
    -   `Strict-Transport-Security (HSTS)`: HTTPS 연결만 사용하도록 강제합니다.
    -   `X-Frame-Options`: Clickjacking 공격을 방지합니다.
    -   `X-Content-Type-Options`: MIME 타입 스니핑을 방지합니다.
    -   `Referrer-Policy`: Referer 헤더 전송 정책을 제어합니다.
-   **비밀 키 관리:** 환경 변수 외의 비밀 정보(예: 서비스 계정 키 파일)가 안전하게 저장 및 관리되는지 확인합니다.

## 6. 기능 테스트

운영 환경 설정(특히 환경 변수)을 사용하여 주요 기능들이 예상대로 동작하는지 최종 확인합니다.

-   회원가입, 로그인, 로그아웃
-   주요 데이터 생성, 조회, 수정, 삭제 (CRUD) 기능
-   검색, 필터링, 정렬 기능
-   알림 시스템 (실시간 알림, 이메일 알림)
-   실시간 협업 기능 (해당 시)
-   결제, 외부 API 연동 기능 (해당 시)
-   반응형 디자인 및 다양한 브라우저 호환성

## 7. 성능 테스트

Day 20에서 사용했던 k6, Playwright 등을 이용하여 운영 환경과 유사한 조건에서 부하 테스트를 수행합니다.

-   예상되는 동시 사용자 수를 기준으로 테스트를 수행합니다.
-   응답 시간, 에러율, 서버 리소스(CPU, 메모리) 사용률 등을 측정합니다.
-   테스트 결과 병목 지점이 발견되면 해당 부분을 최적화합니다 (데이터베이스 쿼리 튜닝, 캐싱 전략 개선 등).

## 8. 로그 및 모니터링 설정

운영 환경에서 발생하는 오류를 추적하고 성능을 모니터링하기 위한 도구를 설정합니다.

-   **오류 추적:** Sentry, Bugsnag 등의 서비스를 연동하여 클라이언트/서버 오류 발생 시 실시간으로 알림을 받고 상세 정보를 분석합니다.
-   **성능 모니터링:** Datadog, New Relic 같은 APM(Application Performance Monitoring) 도구를 사용하거나, 호스팅 플랫폼에서 제공하는 모니터링 기능을 활용하여 서버 응답 시간, 데이터베이스 쿼리 성능, 리소스 사용률 등을 지속적으로 관찰합니다.
-   **로깅:** 애플리케이션 로그(요청/응답, 주요 이벤트, 오류 등)를 체계적으로 수집하고 분석할 수 있는 시스템을 구축합니다 (예: ELK Stack, Grafana Loki).

## 9. 배포 스크립트 작성 / CI/CD 설정

수동 배포 오류를 줄이고 배포 과정을 자동화합니다.

-   **배포 스크립트:** 간단한 쉘 스크립트(`deploy.sh`)를 작성하여 빌드, 파일 전송, 서버 재시작 등의 과정을 자동화할 수 있습니다.
-   **CI/CD (Continuous Integration / Continuous Deployment):** GitHub Actions, GitLab CI, Jenkins 등을 사용하여 코드 변경 사항이 저장소에 푸시될 때마다 자동으로 테스트, 빌드, 배포가 이루어지도록 파이프라인을 구성합니다.

### GitHub Actions 예시 (`.github/workflows/deploy.yml`)

!!!yaml
name: Deploy Production

on:
  push:
    branches:
      - main # main 브랜치에 푸시될 때 실행

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18' # 프로젝트 버전에 맞게 설정

      - name: Install dependencies
        run: npm ci # package-lock.json 사용

      # - name: Run tests # 필요시 테스트 실행
      #   run: npm test

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          # 빌드 시 필요한 환경 변수 설정
          # SUPABASE_URL: ${secrets.SUPABASE_URL}
          # SUPABASE_ANON_KEY: ${secrets.SUPABASE_ANON_KEY}

      - name: Deploy to Vercel # 예시: Vercel 배포
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }} # GitHub Secrets에 Vercel 토큰 저장
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod' # 프로덕션 배포
          # working-directory: ./ # 필요시 작업 디렉토리 지정

      # 다른 배포 플랫폼(Fly.io, AWS 등)에 맞는 액션 사용
      # 예: Fly.io 배포
      # - name: Deploy to Fly.io
      #   uses: superfly/flyctl-actions/setup-flyctl@master
      # - run: flyctl deploy --remote-only
      #   env:
      #     FLY_API_TOKEN: ${secrets.FLY_API_TOKEN}
!!!

## 10. 백업 및 복구 계획

-   **데이터베이스 백업:** Supabase 또는 사용 중인 데이터베이스에서 제공하는 자동 백업 기능을 활성화하고, 백업 주기 및 보존 기간을 설정합니다. 필요시 수동 백업 스크립트를 작성합니다.
-   **파일 스토리지 백업:** Supabase Storage 또는 다른 파일 저장소에 저장된 사용자 업로드 파일 등 중요 데이터에 대한 백업 방안을 마련합니다.
-   **복구 절차 문서화:** 백업 데이터로부터 시스템을 복구하는 절차를 명확하게 문서화하고, 정기적으로 복구 테스트를 수행하여 절차의 유효성을 검증합니다.

## 다음 단계

모든 준비 및 점검이 완료되었습니다! Day 29에서는 실제 운영 환경에 애플리케이션을 배포하고, 배포 후 모니터링 및 안정화 작업을 진행합니다. 