# 사용자 지정 개발 지침

이 문서는 YkMake 프로젝트 개발 전반에 걸쳐 일관되게 적용될 지침을 기록합니다.

## Markdown 파일 코드 블록 대체 구분자 규칙

1. **package manager 정보**
    *   pnpm을 사용

2. **remix 최신 버전 적용**
    *   `import { json } from "@remix-run/node";` => 이 구문은 deprecated 되었다. 절대 이걸로 작성하지 말고, 아무것도 import 하지말고 json 변환시 Response.json으로 변환하면 된다.

3. **jobs 디렉토리에서 md 파일 작성시**
    *   파일 작업 전에 `touch`와 `mkdir -p` 또는 package manager로 추가하는 구문 꼭 하고 소스 내용 작성해줘.
    *   days 폴더의 맨 마지막 md 파일시 test 방법도 꼭 넣어줘.

4. **모든 md 파일 작성시**
    *   꼭 기존에 해당 로직이 있는지 확인하고 그걸 이용해서 수정해줘.

5. **모든 routes 파일 작성시**
    *   Flat 경로명으로 작성합니다. (예: `users.profile.tsx`)
    *   레이아웃 처리 방식:
        *   특정 경로 그룹(예: `/users/*`, `/admin/*`)의 공통 레이아웃은 해당 경로 세그먼트 내에 `_layout.tsx` 파일을 생성하여 `<Outlet />`을 포함하여 구현합니다. (예: `app/routes/users._layout.tsx`) 이것이 Remix의 표준 방식입니다.
        *   인덱스 라우트 파일(예: `app/routes/_index.tsx`, `app/routes/users._index.tsx`)은 해당 경로의 기본 페이지를 정의합니다.
    *   여러 라우트에서 재사용 가능한 UI 패턴 레이아웃(예: 폼 레이아웃, 카드 목록 레이아웃 등)은 `app/components/layouts/` 와 같은 공통 디렉토리에 별도의 컴포넌트 파일(예: `FormLayout.tsx`)로 작성하고, 필요한 라우트 파일이나 `_layout.tsx` 파일에서 import하여 사용합니다.
    *   `app/root.tsx`가 최상위 레이아웃(`<html>`, `<body>` 등)을 담당하므로, 개별 라우트 파일에서 이를 중복 정의하지 않습니다.

## 기타 지침

*   모든 응답은 **한글**로 작성합니다.
*   **항상 `mds/spec.md` 파일의 개발 계획을 최우선으로 참고하여 작업을 진행합니다.** 계획에 명시되지 않은 기능은 임의로 추가하지 않습니다.
*   **UI/UX 디자인은 `mds/spec.md`에 명시된 데모 사이트 ([https://wemake.cool/](https://wemake.cool/))를 반드시 참고하여 최대한 유사하게 구현합니다.**
*   **Shadcn UI의 기본 테마는 'rose'를 사용합니다.**
*   **Shadcn UI 설치 및 컴포넌트 추가는 최신 명령어인 `pnpx shadcn@latest init` 또는 `pnpx shadcn@latest add [컴포넌트명]`을 사용합니다.**

## 프로젝트 폴더 구조 및 역할

이 프로젝트는 다음과 같은 폴더 구조를 사용하여 개발 과정의 기록과 산출물을 관리합니다. 모든 도구와 라이브러리는 **최신 안정 버전(latest stable version)** 사용을 원칙으로 합니다.

*   **`mds/`**: Markdown 기반의 문서 및 개발 기록을 저장하는 최상위 디렉토리입니다.
    *   **`common/`**: 프로젝트 전반에 적용되는 공통 지침 및 설정을 저장하는 디렉토리입니다.
        *   `prompt.md`: 이 파일. 개발 지침, Markdown 규칙 등을 포함합니다.
    *   **`curriculum/`**: 프로젝트 진행 계획, 로드맵, 학습 자료 등 커리큘럼 관련 문서를 저장하는 디렉토리입니다.
    *   **`tasks/`**: 일별 개발 목표 및 작업 목록(Checklist)을 관리하는 디렉토리입니다.
        *   `dayX.md`: 해당 날짜에 완료해야 할 작업 목록만 간결하게 기록합니다.
    *   **`jobs/`**: 각 작업 단계에서 사용된 실제 코드 스니펫을 저장하는 디렉토리입니다.
        *   `dayX/`: 해당 날짜의 작업 디렉토리입니다.
        *   `dayX/N.md`: N번째 작업에서 사용된 코드 스니펫을 `!!![언어]` 형식으로 기록합니다.
    *   **`concepts/`**: 각 코드 스니펫 또는 작업 단계에 대한 개념, 설명, 이유 등을 저장하는 디렉토리입니다.
        *   `dayX/`: 해당 날짜의 개념 설명 디렉토리입니다.
        *   `dayX/N.md`: `jobs/dayX/N.md` 코드에 대한 상세 설명을 기록합니다. 

## cursor에서 모든 파일 수정    
!!!text
search : !!!
replace : ```
include : mds/**/*.md
exclude : prompt.md
!!!
