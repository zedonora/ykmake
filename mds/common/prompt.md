# **사용자 지정 개발 지침**

이 문서는 YkMake 프로젝트 개발 전반에 걸쳐 일관되게 적용될 지침을 기록합니다.

## **Markdown 파일 코드 블록 대체 구분자 규칙**

1. **package manager 정보**
    - pnpm을 사용
2. **remix 최신 버전 적용**
    - `import { json } from "@remix-run/node";` => 이 구문은 deprecated 되었다. 절대 이걸로 작성하지 말고, 아무것도 import 하지말고 json 변환시 Response.json으로 변환하면 된다.
3. **jobs 디렉토리에서 md 파일 작성시**
    - 파일 작업 전에 `touch`와 `mkdir -p` 또는 package manager로 추가하는 구문 꼭 하고 소스 내용 작성해줘.
    - days 폴더의 맨 마지막 md 파일시 test 방법도 꼭 넣어줘.
4. **모든 md 파일 작성시**
    - 꼭 기존에 해당 로직이 있는지 확인하고 그걸 이용해서 수정해줘.
5. **모든 routes 파일 작성시**
    - Flat 경로명으로 작성합니다. (예: `users.profile.tsx`)
    - 레이아웃 처리 방식:
        - 특정 경로 그룹(예: `/users/*`, `/admin/*`)의 공통 레이아웃은 해당 경로 세그먼트 내에 `_layout.tsx` 파일을 생성하여 `<Outlet />`을 포함하여 구현합니다. (예: `app/routes/users._layout.tsx`) 이것이 Remix의 표준 방식입니다.
        - 인덱스 라우트 파일(예: `app/routes/_index.tsx`, `app/routes/users._index.tsx`)은 해당 경로의 기본 페이지를 정의합니다.
        - 여러 라우트에서 재사용 가능한 UI 패턴 레이아웃(예: 폼 레이아웃, 카드 목록 레이아웃 등)은 `app/components/layouts/` 와 같은 공통 디렉토리에 별도의 컴포넌트 파일(예: `FormLayout.tsx`)로 작성하고, 필요한 라우트 파일이나 `_layout.tsx` 파일에서 import하여 사용합니다.
        - `app/root.tsx`가 최상위 레이아웃(`<html>`, `<body>` 등)을 담당하므로, 개별 라우트 파일에서 이를 중복 정의하지 않습니다.

## **기술 스택 및 구현 지침**

- **패키지 매니저:** `pnpm`을 사용합니다.
- **Remix 버전:** 최신 안정 버전을 기준으로 하며, API 변경 사항(예: `Response.json` 사용)을 반영합니다.
- **데이터베이스 상호작용:**
    - **드라이버:** **Drizzle ORM과 PostgreSQL (Supabase) 연동에는 `postgres-js` 라이브러리 (`postgres` 패키지)를 사용**합니다. Drizzle 클라이언트는 `drizzle-orm/postgres-js`를 통해 생성합니다.
    - **스키마 정의:** `app/db/schema.ts` 파일에 Drizzle ORM을 사용하여 테이블 스키마를 정의하고, 관련 타입을 `export` 합니다.
        - **중요:** Supabase 인증 사용자(`auth.users`) 테이블을 참조하는 외래 키 컬럼(예: `userId`, `ownerId` 등)은 **반드시 `uuid` 타입을 사용**해야 합니다 (`integer` 사용 금지). Drizzle 스키마 정의 시 `uuid('컬럼명').references(() => users.id, ...)` 와 같이 작성합니다. (`users`는 `auth.users`를 참조하도록 정의된 변수여야 함)
        - 스키마 변경 시 마이그레이션(`drizzle-kit generate/migrate`)을 수행합니다.
    - **데이터베이스 작업:** `postgres-js` 드라이버와 연동된 **Drizzle ORM 클라이언트 (`db`)** 를 사용하여 데이터 조회(`select`, `query`), 생성(`insert`), 수정(`update`), 삭제(`delete`) 작업을 수행합니다. 가능하면 ORM에서 추론된 타입을 활용합니다.
    - **유효성 검사:**
        - **서버 측 (`loader`, `action`):** 함수 내에서 **폼 데이터 또는 파라미터 유효성 검사는 Zod**를 사용하여 처리합니다.
        - **클라이언트 측:**
            - 클라이언트 측 유효성 검사가 필요한 경우, **`app/lib/schemas/` 디렉토리를 생성**하고, 그 안에 **Zod 스키마 파일(`.client.ts`)**을 정의하여 사용합니다.
            - 예시: `app/lib/schemas/auth.client.ts`
- **라우팅:** Flat 경로명을 사용하며, 레이아웃은 Remix의 표준 방식 (`_layout.tsx`)을 따릅니다. 재사용 UI 레이아웃은 `app/components/layouts/`에 작성합니다.
- **UI:**
    - **Shadcn UI**를 사용하며, 기본 테마는 **'rose'**를 적용합니다.
    - Shadcn UI 설치 및 추가는 최신 CLI 명령어 (`pnpx shadcn@latest ...`)를 사용합니다.
    - UI/UX 디자인은 `mds/spec.md`의 데모 사이트 (https://wemake.cool/)를 최대한 참고합니다.

## **문서화 규칙 (`mds/` 디렉토리)**

- **`jobs` 디렉토리 파일 (`jobs/dayX/N.md`):**
    - 파일 관련 작업(생성, 패키지 설치 등) 명령어를 코드 블록 상단에 명시합니다 (`touch`, `mkdir -p`, `pnpm add` 등).
    - **`app/db/schema.ts` 파일을 수정해야 하는 경우, 해당 내용을 명확히 포함합니다.** (특히 `auth.users` 참조 시 `uuid` 타입 사용 강조)
    - **Drizzle ORM (`postgres-js` 드라이버 사용)과 Zod (서버 측 유효성 검사 또는 클라이언트 스키마 import)를 사용하는 코드 스니펫**을 포함합니다.
    - **SQL 참고:** Drizzle 스키마 정의에 대응하는 **순수 SQL 문(테이블 생성, RLS 정책 등)은 참고용으로 ```sql 블록 안에 포함**할 수 있습니다. (Drizzle 사용이 우선)
        - **중요:** SQL 참고 작성 시에도 `auth.users`를 참조하는 외래 키 컬럼은 **반드시 `UUID` 타입을 사용**하고 `REFERENCES auth.users(id)` 와 같이 명시해야 합니다.
    - **파일 마지막에는 반드시 `## 완료 확인` 섹션을 추가하여, 해당 작업의 결과물을 검증하는 구체적인 단계를 명시합니다.** (예: 브라우저 확인, DB 확인, 콘솔 확인 등)
- **`concepts` 디렉토리 파일 (`concepts/dayX/N.md`):**
    - `jobs` 파일의 코드(Drizzle, Zod 등)에 대한 개념, 설명, 이유 등을 상세히 기록합니다. 필요시 `app/lib/schemas/`의 클라이언트 스키마도 설명합니다.
- **`tasks` 디렉토리 파일 (`tasks/dayX.md`):**
    - 해당 날짜의 작업 목록만 간결하게 요약합니다.

## **기타 지침**

- 모든 응답은 **한글**로 작성합니다.
- **항상 `mds/spec.md` 파일의 개발 계획을 최우선으로 참고합니다.**
- **UI/UX 디자인은 `mds/spec.md`에 명시된 데모 사이트 (https://wemake.cool/)를 반드시 참고하여 최대한 유사하게 구현합니다.**
- **Shadcn UI의 기본 테마는 'rose'를 사용합니다.**
- **Shadcn UI 설치 및 컴포넌트 추가는 최신 명령어인 `pnpx shadcn@latest init` 또는 `pnpx shadcn@latest add [컴포넌트명]`을 사용합니다.**

## **프로젝트 폴더 구조 및 역할**

이 프로젝트는 다음과 같은 폴더 구조를 사용하여 개발 과정의 기록과 산출물을 관리합니다. 모든 도구와 라이브러리는 **최신 안정 버전(latest stable version)** 사용을 원칙으로 합니다.

- **`mds/`**: Markdown 기반의 문서 및 개발 기록을 저장하는 최상위 디렉토리입니다.
    - **`common/`**: 프로젝트 전반에 적용되는 공통 지침 및 설정을 저장하는 디렉토리입니다.
        - `prompt.md`: 이 파일. 개발 지침, Markdown 규칙 등을 포함합니다.
    - **`curriculum/`**: 프로젝트 진행 계획, 로드맵, 학습 자료 등 커리큘럼 관련 문서를 저장하는 디렉토리입니다.
    - **`tasks/`**: 일별 개발 목표 및 작업 목록(Checklist)을 관리하는 디렉토리입니다.
        - `dayX.md`: 해당 날짜에 완료해야 할 작업 목록만 간결하게 기록합니다.
    - **`jobs/`**: 각 작업 단계에서 사용된 실제 코드 스니펫을 저장하는 디렉토리입니다.
        - `dayX/`: 해당 날짜의 작업 디렉토리입니다.
        - `dayX/N.md`: N번째 작업에서 사용된 코드 스니펫을 ```[언어] 형식으로 기록합니다.
    - **`concepts/`**: 각 코드 스니펫 또는 작업 단계에 대한 개념, 설명, 이유 등을 저장하는 디렉토리입니다.
        - `dayX/`: 해당 날짜의 개념 설명 디렉토리입니다.
        - `dayX/N.md`: `jobs/dayX/N.md` 코드에 대한 상세 설명을 기록합니다.

## **cursor에서 모든 파일 수정**

```
search : !!!
replace : ```
include : mds/**/*.md
exclude : prompt.md

```