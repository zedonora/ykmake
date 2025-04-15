# Day 20: 사용자 피드백 수집 및 개선 사항 적용

## 목표

오늘은 YkMake의 사용자 피드백을 수집하고 개선 사항을 적용합니다. 사용자 경험을 향상시키고 서비스의 품질을 높이기 위한 다양한 기능을 구현합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성하고 디렉토리를 확인합니다:

```bash
mkdir -p app/components/feedback app/routes app/components/guide app/utils
touch app/components/feedback/feedback-dialog.tsx
touch app/routes/actions.feedback.tsx # Flat Routes: /actions/feedback 경로
touch app/components/guide/tour-guide.tsx
touch app/utils/a11y.ts
touch app/utils/analytics.client.ts
touch app/utils/performance.client.ts
# app/components/ui/button.tsx 파일은 수정합니다.
# app/routes/_index.tsx (홈페이지), app/root.tsx (루트 레이아웃) 파일이 존재해야 합니다.
# 필요시 /actions 경로의 레이아웃(app/routes/actions.tsx) 또는 인덱스(app/routes/actions._index.tsx) 파일을 생성할 수 있습니다.
```

## 필수 라이브러리 설치 (및 도구)

다음 명령어를 실행하여 피드백, 가이드, 분석 관련 라이브러리를 설치합니다.

!!!bash
npm install react-joyride lucide-react posthog-js
# class-variance-authority, clsx/tailwind-merge 등 UI 라이브러리 의존성 확인
# npm install class-variance-authority clsx tailwind-merge
!!!

데이터베이스 확인에는 **Prisma Studio** (`npx prisma studio`)가 사용됩니다.
접근성 검사를 위해서는 **관련 테스트 도구** (예: `@axe-core/react`, `eslint-plugin-jsx-a11y`) 설정 및 `package.json` 스크립트 (예: `npm run a11y`)가 필요할 수 있습니다.

## 작업 목록

1. 피드백 시스템 구현
2. 사용성 개선
3. 접근성 개선
4. 분석 시스템 구현

## 1. 피드백 시스템 구현

### 피드백 컴포넌트

`app/components/feedback/feedback-dialog.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { useState } from "react";
import { Form } from "@remix-run/react";
import {
  Dialog, // shadcn/ui Dialog 컴포넌트 경로 확인
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select, // shadcn/ui Select 컴포넌트 경로 확인
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button"; // shadcn/ui Button 컴포넌트 경로 확인
import { Textarea } from "~/components/ui/textarea"; // shadcn/ui Textarea 컴포넌트 경로 확인
import { MessageSquare } from "lucide-react"; // 아이콘 라이브러리

export function FeedbackDialog() {
  const [type, setType] = useState<string>("suggestion");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full shadow-lg z-50" // 스타일 추가
          aria-label="피드백 보내기" // 접근성 레이블 추가
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>피드백 보내기</DialogTitle>
        </DialogHeader>
        {/* Form 액션은 실제 피드백 처리 라우트로 변경 */}
        <Form method="post" action="/actions/feedback" className="space-y-4" onSubmit={() => setTimeout(() => setOpen(false), 300)}> 
          <div className="space-y-2">
            <label htmlFor="feedback-type" className="text-sm font-medium">
              피드백 유형
            </label>
            <Select
              name="type"
              value={type}
              onValueChange={setType}
              required // 필수 선택
            >
              <SelectTrigger id="feedback-type">
                <SelectValue placeholder="유형을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suggestion">기능 제안</SelectItem>
                <SelectItem value="bug">버그 신고</SelectItem>
                <SelectItem value="improvement">개선 요청</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="feedback-content" className="text-sm font-medium">
              내용
            </label>
            <Textarea
              id="feedback-content"
              name="content"
              placeholder="피드백 내용을 입력해주세요... (예: 어떤 상황에서 문제가 발생했나요?)"
              rows={5}
              required
              minLength={10} // 최소 길이 제한 (선택 사항)
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              보내기
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
!!!

### 피드백 처리

`app/routes/actions.feedback.tsx` 파일을 생성하고 다음과 같이 구현합니다 (Flat Route 방식):

!!!typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/utils/db.server"; // DB 유틸리티 경로 확인
import { requireUserId } from "~/utils/auth.server"; // 사용자 인증 유틸리티 경로 확인
import { sendAlert, AlertSeverity } from "~/utils/alert.server"; // 알림 유틸리티 경로 확인
import { logger } from "~/utils/logger.server"; // 로거 유틸리티 경로 확인

// 입력 데이터 유효성 검사 스키마
const FeedbackSchema = z.object({
  type: z.enum(["suggestion", "bug", "improvement", "other"]),
  content: z.string().min(10, "내용은 10자 이상 입력해주세요.").max(2000, "내용은 2000자를 넘을 수 없습니다."),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request); // 로그인된 사용자 ID 가져오기
  const formData = await request.formData();

  const result = FeedbackSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    logger.warn("Invalid feedback submission", { errors: result.error.flatten().fieldErrors });
    return json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { type, content } = result.data;

  try {
    const feedback = await prisma.feedback.create({
      data: {
        type,
        content,
        userId,
        // 추가 정보 저장 (예: User Agent, 현재 페이지 등)
        // userAgent: request.headers.get("user-agent"),
        // pageUrl: request.headers.get("Referer"),
      },
    });

    logger.info("Feedback submitted successfully", { feedbackId: feedback.id, userId });

    // Slack으로 알림 전송 (운영 환경에서만)
    if (process.env.NODE_ENV === "production") {
      await sendAlert(
        AlertSeverity.INFO,
        `새로운 피드백 도착 (${type})`, // 제목에 타입 포함
        content,
        {
          Type: type,
          User_ID: userId,
          Feedback_ID: feedback.id,
          Page_URL: request.headers.get("Referer"),
        },
      );
    }

    // 성공 시 이전 페이지 또는 특정 페이지로 리다이렉트
    // 여기서는 토스트 메시지 등을 보여주기 위해 JSON 응답을 고려할 수 있음
    // return redirect(request.headers.get("Referer") || "/");
    return json({ success: true, message: "피드백이 성공적으로 제출되었습니다." });

  } catch (error: unknown) {
    logger.error("Failed to save feedback", { error, userId });
    if (error instanceof Error) {
      // Sentry 등에 에러 로깅
      // await captureError(error, { context: "Feedback Submission", userId });
    }
    return json({ error: "피드백 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
};
!!!

**참고:**
- 위 코드에서 `prisma.feedback.create`를 사용하려면 `schema.prisma` 파일에 `Feedback` 모델이 정의되어 있어야 합니다.
- Remix v2의 **Flat Routes** 컨벤션에 따라 `app/routes/actions.feedback.tsx` 파일은 `/actions/feedback` 경로의 POST 요청을 처리합니다.
- 애플리케이션의 전체적인 레이아웃은 `app/root.tsx` 파일에서 관리하며, 홈페이지('/')의 내용은 `app/routes/_index.tsx` 파일에서 정의하는 것이 일반적입니다. 필요에 따라 중첩된 레이아웃 파일(`_auth.tsx`, `_marketing.tsx`, `actions.tsx` 등)을 생성하여 특정 경로 그룹에 공통 레이아웃을 적용할 수 있습니다. 만약 `/actions` 경로 자체에 페이지가 필요하다면 `actions._index.tsx` 파일을 사용합니다.

### 액션 레이아웃 및 인덱스 (선택 사항 예시)

만약 `/actions` 경로 아래에 여러 액션 라우트가 존재하고 공통 레이아웃이나 `/actions` 경로 자체의 페이지가 필요하다면, 다음과 같이 파일을 생성할 수 있습니다.

**`app/routes/actions.tsx` (레이아웃 예시):**

```typescript
import { Outlet } from "@remix-run/react";
// import { Header } from "~/components/layout/header"; // 예시 헤더 컴포넌트

export default function ActionsLayout() {
  return (
    <div>
      {/* <Header title="사용자 액션" /> */}
      <main className="container mx-auto py-8">
        {/* 하위 라우트(actions.feedback.tsx 등)가 여기에 렌더링됨 */}
        <Outlet />
      </main>
    </div>
  );
}
```

**`app/routes/actions._index.tsx` (인덱스 페이지 예시):**

```typescript
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button"; // Button 컴포넌트 경로 확인

export default function ActionsIndex() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-semibold">사용자 액션</h1>
      <p className="text-muted-foreground">
        이 경로는 백그라운드 액션 처리를 위한 엔드포인트들을 포함합니다.
      </p>
      {/* 필요시 사용 가능한 액션 목록 또는 다른 정보 표시 */}
      {/*
      <ul className="list-disc list-inside">
        <li>
          <Link to="/actions/feedback" className="text-blue-600 hover:underline">
            피드백 제출 (/actions/feedback)
          </Link>
        </li>
      </ul>
       */}
       <Button asChild variant="link">
         <Link to="/">홈으로 돌아가기</Link>
       </Button>
    </div>
  );
}
```

## 2. 사용성 개선

### 투어 가이드 구현

`app/components/guide/tour-guide.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { useState, useEffect } from "react";
import { useLocation } from "@remix-run/react";
import Joyride, { STATUS, Step } from "react-joyride";
import { useUser } from "~/utils/auth.client"; // 사용자 정보 훅 (로그인 상태 확인 등)

// 투어 단계 정의 (라우트 경로를 키로 사용)
const TOUR_STEPS: Record<string, Step[]> = {
  "/": [
    {
      target: "[data-tour='header-search']", // 데이터 속성으로 타겟 지정 권장
      content: "여기서 원하는 제품이나 팀을 빠르게 검색할 수 있어요.",
      disableBeacon: true,
    },
    {
      target: "[data-tour='product-list']",
      content: "다른 사용자들이 만든 멋진 제품들을 둘러보세요!",
    },
    {
      target: "[data-tour='create-product-button']",
      content: "자신만의 아이디어를 제품으로 만들어 공유해보세요.",
      placement: "left",
    },
  ],
  "/teams": [
    {
      target: "[data-tour='team-filters']",
      content: "다양한 조건으로 팀을 필터링하여 찾아보세요.",
      disableBeacon: true,
    },
    {
      target: "[data-tour='create-team-button']",
      content: "함께 프로젝트를 진행할 팀을 직접 만들어보세요.",
      placement: "left",
    },
  ],
  // 다른 페이지에 대한 투어 단계 추가
};

const TOUR_STORAGE_KEY = "ykmake_tour_completed";

export function TourGuide() {
  const location = useLocation();
  const user = useUser(); // 사용자 정보 (로그인 시에만 투어 보여주기 등)
  const [runTour, setRunTour] = useState(false);

  // 투어 완료 여부 및 로그인 상태 확인
  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    // 로그인한 사용자이고, 해당 페이지 투어를 아직 완료하지 않았을 때 실행
    if (user && !tourCompleted?.includes(location.pathname)) {
      // 약간의 딜레이 후 투어 시작 (페이지 로딩 보장)
      const timer = setTimeout(() => setRunTour(true), 500);
      return () => clearTimeout(timer);
    } else {
      setRunTour(false); // 페이지 이동 시 투어 중지
    }
  }, [location.pathname, user]);

  // 투어 콜백 함수 (완료/스킵 시 로컬 스토리지에 기록)
  const handleJoyrideCallback = (data: any) => {
    const { status, lifecycle, index, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false); // 투어 중지
      const completedTours = localStorage.getItem(TOUR_STORAGE_KEY) || "";
      // 현재 페이지 경로를 완료 목록에 추가
      localStorage.setItem(TOUR_STORAGE_KEY, `${completedTours},${location.pathname}`);
    }

    console.log("Joyride callback", data);
  };

  const steps = TOUR_STEPS[location.pathname] || [];

  // 해당 페이지에 투어 단계가 없으면 렌더링 안 함
  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous // 다음 버튼 클릭 시 다음 단계로 자동 이동
      showSkipButton // 건너뛰기 버튼 표시
      showProgress // 진행 상태 표시
      scrollToFirstStep // 첫 단계로 스크롤
      // disableOverlayClose // 오버레이 클릭으로 닫기 비활성화
      styles={{
        options: {
          zIndex: 10000, // 다른 요소 위에 표시되도록 z-index 설정
          primaryColor: "#2563eb", // 테마 색상 적용
          textColor: "#374151",
        },
        tooltip: {
          borderRadius: "0.375rem",
        },
        buttonNext: {
          backgroundColor: "#2563eb",
        },
        buttonBack: {
          color: "#6b7280",
        }
      }}
      callback={handleJoyrideCallback}
      locale={{
        back: "이전",
        close: "닫기",
        last: "완료",
        next: "다음",
        skip: "건너뛰기",
      }}
    />
  );
}
!!!

**참고:** 위 코드를 사용하려면 각 페이지의 요소에 `data-tour="..."` 와 같은 데이터 속성을 추가하여 Joyride 타겟을 지정해야 합니다.

## 3. 접근성 개선

### 접근성 유틸리티

`app/utils/a11y.ts` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { useEffect, useState } from "react";

// 키보드 포커스 표시 유틸리티
export function useFocusVisible() {
  useEffect(() => {
    let isUsingMouse = false;

    const handleMouseDown = () => {
      isUsingMouse = true;
      document.body.classList.remove("user-is-tabbing");
      window.removeEventListener("keydown", handleKeyDown, true);
      window.addEventListener("mousemove", handleMouseMove, true);
    };

    const handleMouseMove = () => {
      // 마우스 이동 시 다시 mousedown 리스너 활성화
      window.removeEventListener("mousemove", handleMouseMove, true);
      window.addEventListener("mousedown", handleMouseDown, true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        // Tab 키 사용 시 마우스 리스너 제거하고 포커스 링 활성화
        isUsingMouse = false;
        document.body.classList.add("user-is-tabbing");
        window.removeEventListener("mousemove", handleMouseMove, true);
        window.removeEventListener("mousedown", handleMouseDown, true);
      }
    };

    // 초기 리스너 등록
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("mousedown", handleMouseDown, true);

    return () => {
      // 컴포넌트 언마운트 시 리스너 제거
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("mousedown", handleMouseDown, true);
      window.removeEventListener("mousemove", handleMouseMove, true);
      document.body.classList.remove("user-is-tabbing"); // 클래스 제거
    };
  }, []);
}

// 전역 CSS에 추가: .user-is-tabbing *:focus { outline: auto; ... }


// 시각적으로 숨김 (스크린 리더 전용)
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      border: 0,
      clip: "rect(0 0 0 0)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: "1px",
      whiteSpace: "nowrap",
      wordWrap: "normal",
    }}>
      {children}
    </span>
  );
}

// ARIA 라이브 리전 컴포넌트
export function LiveRegion({ announcement, politeness = "polite" }: { announcement: string; politeness?: "polite" | "assertive" }) {
  const [currentAnnouncement, setCurrentAnnouncement] = useState("");

  // announcement가 변경될 때만 내용을 업데이트하여 스크린 리더가 변경을 감지하도록 함
  useEffect(() => {
    if (announcement) {
      // 내용을 비웠다가 다시 설정하여 변경을 강제
      setCurrentAnnouncement("");
      const timer = setTimeout(() => setCurrentAnnouncement(announcement), 100);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      style={{
        border: 0,
        clip: "rect(0 0 0 0)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        width: "1px",
        whiteSpace: "nowrap",
        wordWrap: "normal",
      }}
    >
      {currentAnnouncement}
    </div>
  );
}
!!!

### 접근성 개선된 컴포넌트

`app/components/ui/button.tsx` 파일을 수정하여 포커스 상태 및 로딩 상태에 대한 접근성을 개선합니다 (shadcn/ui 기준 예시):

!!!typescript
import { Slot } from "@radix-ui/react-slot"; // 필요시 Slot 사용
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils"; // 유틸리티 경로 확인
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean; // 로딩 상태 추가
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isLoading = loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        aria-busy={isLoading} // 로딩 중임을 스크린 리더에 알림
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
        {/* 로딩 상태에 대한 스크린 리더 전용 텍스트 */}
        {isLoading && <span className="sr-only">Loading</span>}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
!!!

## 4. 분석 시스템 구현

### 사용자 행동 추적 (클라이언트 측)

`app/utils/analytics.client.ts` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { useEffect } from "react";
import { useLocation } from "@remix-run/react";
import posthog from "posthog-js";
import { ENV } from "./env.client"; // 클라이언트 환경 변수 유틸리티 경로 확인

let isPostHogInitialized = false;

// PostHog 초기화 함수
export function initAnalytics() {
  if (typeof window !== 'undefined' && ENV.NEXT_PUBLIC_POSTHOG_KEY && !isPostHogInitialized) {
    try {
      posthog.init(ENV.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: ENV.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        // GDPR 및 개인 정보 보호 고려 옵션
        // opt_out_capturing_by_default: true, // 기본적으로 옵트아웃
        // respect_dnt: true, // Do Not Track 헤더 존중
        // person_profiles: 'identified_only', // 식별된 사용자 프로필만 저장

        // 세션 리플레이 활성화 (필요시)
        // capture_pageview: false, // usePageView 훅에서 처리
        // autocapture: { 
        //   dom_event_allowlist: ['click', 'change', 'submit'], // 필요한 이벤트만 캡처
        // },
        session_recording: {
          // 특정 요소 마스킹 (예: 비밀번호 필드)
          maskAllInputs: true,
          maskTextSelector: ".ph-mask", // CSS 클래스로 마스킹
        }
      });
      isPostHogInitialized = true;
      console.log("PostHog initialized");
    } catch (error) {
      console.error("PostHog initialization failed:", error);
    }
  }
}

// 페이지 뷰 추적 훅
export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    if (isPostHogInitialized) {
      // 이전 경로와 다를 때만 페이지뷰 캡처 (중복 방지)
      if (window.location.pathname !== location.pathname) {
         posthog.capture("$pageview");
      }
    }
  }, [location.pathname]); // 경로 변경 시 실행
}

// 커스텀 이벤트 추적 함수
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
) {
  if (isPostHogInitialized) {
    posthog.capture(eventName, properties);
  }
}

// 사용자 식별 함수
export function identifyUser(
  userId: string,
  traits?: Record<string, any>,
) {
  if (isPostHogInitialized) {
    posthog.identify(userId, traits);
    // PostHog 그룹 기능 사용 예시 (팀 등)
    // if (traits?.teamId) {
    //   posthog.group('team', traits.teamId, { name: traits.teamName });
    // }
  }
}

// 사용자 로그아웃 시 PostHog 리셋
export function resetAnalytics() {
  if (isPostHogInitialized) {
    posthog.reset();
  }
}
!!!

**참고:** 위 코드를 사용하려면 클라이언트 사이드에서 접근 가능한 환경 변수 (`env.client.ts` 등) 설정이 필요합니다. 또한, PostHog 계정 및 API 키가 필요합니다.

### 성능 모니터링 (클라이언트 측)

`app/utils/performance.client.ts` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { useEffect } from "react";
import { useLocation, useNavigation } from "@remix-run/react";
import { logger } from "./logger.client"; // 클라이언트 로거 사용
import { trackEvent } from "./analytics.client"; // 분석 시스템과 연동

// Web Vitals 측정 및 리포팅
function reportWebVitals({ id, name, value, delta }: any) {
  // trackEvent(`web_vitals_${name.toLowerCase()}`, { metric_id: id, value, delta });
  // console.log(`[Web Vitals] ${name}: ${value.toFixed(2)} (${delta.toFixed(2)})`);

  // 특정 메트릭만 전송하거나, 조건을 추가할 수 있음
  if (['FCP', 'LCP', 'CLS', 'FID', 'TTFB'].includes(name)) {
     fetch("/api/metrics/web-vitals", { // 별도 엔드포인트 사용 권장
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Keepalive 플래그는 페이지 언로드 중에도 요청을 보낼 수 있도록 함
      keepalive: true, 
      body: JSON.stringify({ name, value, delta, path: window.location.pathname }),
    }).catch(error => {
      logger.error("Failed to report Web Vitals", { error });
    });
  }
}

export function usePerformanceMonitoring() {
  const location = useLocation();
  const navigation = useNavigation();

  // Web Vitals 측정 (페이지 로드 시 한 번 실행)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // web-vitals 라이브러리 사용 권장 (더 정확한 측정)
      // import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
      // onCLS(reportWebVitals);
      // onFID(reportWebVitals);
      // onFCP(reportWebVitals);
      // onLCP(reportWebVitals);
      // onTTFB(reportWebVitals);

      // 간단한 Performance API 사용 예시 (참고용)
      const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (navigationEntry) {
        const fcpEntry = performance.getEntriesByType("paint").find(e => e.name === 'first-contentful-paint');
        const domLoadTime = navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime;
        const pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;

        logger.debug("Basic Performance Metrics", { 
          path: location.pathname, 
          domLoadTime, 
          pageLoadTime, 
          fcp: fcpEntry?.startTime 
        });
        // 필요시 이 기본 메트릭도 서버로 전송
      }
    }
  }, [location.pathname]);

  // Remix 네비게이션 시간 측정
  useEffect(() => {
    if (navigation.state === "loading" || navigation.state === "submitting") {
      const startTime = performance.now();
      const currentPath = location.pathname;
      const navigationType = navigation.state;

      return () => {
        // 네비게이션 완료 시점
        const endTime = performance.now();
        const duration = endTime - startTime;
        logger.debug(`Remix Navigation Timing: ${navigationType}`, {
          path: currentPath,
          duration: duration.toFixed(2),
          nextPath: navigation.location?.pathname, // 다음 경로
        });

        // 측정된 시간을 서버나 분석 도구로 전송
        // fetch("/api/metrics/navigation", { ... });
        trackEvent("navigation_performance", { 
          duration, 
          type: navigationType, 
          fromPath: currentPath, 
          toPath: navigation.location?.pathname 
        });
      };
    }
  }, [navigation.state, navigation.location?.pathname, location.pathname]);
}
!!!

## 다음 단계

이제 사용자 피드백 수집과 개선 사항 적용의 기본적인 구조가 완성되었습니다! 다음 단계에서는 최종 테스트와 문서화 작업을 진행할 예정입니다.

구현된 기능들을 확인해보세요:

!!!bash
# 개발 서버 실행
npm run dev

# 접근성 검사 (도구 설정 필요)
# npm run a11y

# 분석 데이터 확인 (Prisma Studio 또는 PostHog 대시보드)
# npx prisma studio
# # 또는 PostHog 웹사이트 방문
!!!

이제 다음과 같은 기능들이 구현되었습니다:
- 사용자 피드백 수집 UI 및 서버 로직
- Joyride를 이용한 **온보딩 투어 가이드** 구현
- 키보드 네비게이션, 시각적 숨김, ARIA 라이브 리전 등 **접근성 유틸리티** 및 Button 컴포넌트 개선
- PostHog를 이용한 **사용자 행동 분석** 및 성능 지표(Web Vitals) 추적 기반 마련