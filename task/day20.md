# Day 20: 사용자 피드백 수집 및 개선 사항 적용

## 목표

오늘은 YkMake의 사용자 피드백을 수집하고 개선 사항을 적용합니다. 사용자 경험을 향상시키고 서비스의 품질을 높이기 위한 다양한 기능을 구현합니다.

## 작업 목록

1. 피드백 시스템 구현
2. 사용성 개선
3. 접근성 개선
4. 분석 시스템 구현

## 1. 피드백 시스템 구현

### 피드백 컴포넌트

`app/components/feedback/feedback-dialog.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { useState } from "react";
import { Form } from "@remix-run/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { MessageSquare } from "lucide-react";

export function FeedbackDialog() {
  const [type, setType] = useState<string>("suggestion");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>피드백 보내기</DialogTitle>
        </DialogHeader>
        <Form method="post" action="/feedback" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              피드백 유형
            </label>
            <Select
              name="type"
              value={type}
              onValueChange={setType}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suggestion">
                  기능 제안
                </SelectItem>
                <SelectItem value="bug">
                  버그 신고
                </SelectItem>
                <SelectItem value="improvement">
                  개선 요청
                </SelectItem>
                <SelectItem value="other">
                  기타
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              내용
            </label>
            <Textarea
              name="content"
              placeholder="피드백 내용을 입력해주세요..."
              rows={5}
              required
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
```

### 피드백 처리

`app/routes/feedback.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { prisma } from "~/utils/api.server";
import { requireUser } from "~/utils/api.server";
import { sendAlert, AlertSeverity } from "~/utils/alert.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const formData = await request.formData();

  const type = formData.get("type");
  const content = formData.get("content");

  if (
    typeof type !== "string" ||
    typeof content !== "string"
  ) {
    return json(
      { error: "Invalid input" },
      { status: 400 },
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      type,
      content,
      userId: user.id,
    },
  });

  // Slack으로 알림 전송
  await sendAlert(
    AlertSeverity.INFO,
    "새로운 피드백",
    content,
    {
      type,
      userId: user.id,
      feedbackId: feedback.id,
    },
  );

  return redirect(request.headers.get("Referer") || "/");
};
```

## 2. 사용성 개선

### 투어 가이드 구현

`app/components/guide/tour-guide.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { useState, useEffect } from "react";
import { useLocation } from "@remix-run/react";
import Joyride, { STATUS } from "react-joyride";

const TOUR_STEPS = {
  "/": [
    {
      target: ".header-search",
      content: "원하는 제품이나 팀을 검색해보세요.",
      disableBeacon: true,
    },
    {
      target: ".product-list",
      content: "다른 개발자들의 제품을 확인해보세요.",
    },
    {
      target: ".create-product",
      content: "새로운 제품을 등록할 수 있습니다.",
    },
  ],
  "/teams": [
    {
      target: ".team-filters",
      content: "원하는 팀을 필터링해보세요.",
      disableBeacon: true,
    },
    {
      target: ".create-team",
      content: "새로운 팀을 만들 수 있습니다.",
    },
  ],
};

export function TourGuide() {
  const location = useLocation();
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem("hasSeenTour", "true");
    }
  };

  const steps = TOUR_STEPS[location.pathname as keyof typeof TOUR_STEPS] || [];

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          primaryColor: "#0f172a",
          textColor: "#334155",
        },
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
```

## 3. 접근성 개선

### 접근성 유틸리티

`app/utils/a11y.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { useEffect } from "react";

// 키보드 사용자 감지
export function useKeyboardUser() {
  useEffect(() => {
    function handleFirstTab(e: KeyboardEvent) {
      if (e.key === "Tab") {
        document.body.classList.add("user-is-tabbing");
        window.removeEventListener("keydown", handleFirstTab);
      }
    }
    window.addEventListener("keydown", handleFirstTab);
    return () => {
      window.removeEventListener("keydown", handleFirstTab);
    };
  }, []);
}

// 스크린 리더 전용 텍스트
export function VisuallyHidden({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{ clip: "rect(0, 0, 0, 0)" }}
    >
      {children}
    </span>
  );
}

// ARIA 라이브 리전
export function LiveRegion({
  children,
  "aria-live": ariaLive = "polite",
}: {
  children: React.ReactNode;
  "aria-live"?: "polite" | "assertive";
}) {
  return (
    <div
      aria-live={ariaLive}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}
```

### 접근성 개선된 컴포넌트

`app/components/ui/button.tsx` 파일을 수정하여 접근성을 개선합니다:

```typescript
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
        {loading && (
          <span className="sr-only">로딩 중...</span>
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

## 4. 분석 시스템 구현

### 사용자 행동 추적

`app/utils/analytics.client.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { useEffect } from "react";
import { useLocation } from "@remix-run/react";
import posthog from "posthog-js";
import { ENV } from "./env.client";

export function initAnalytics() {
  if (ENV.POSTHOG_KEY) {
    posthog.init(ENV.POSTHOG_KEY, {
      api_host: ENV.POSTHOG_HOST,
      autocapture: true,
      capture_pageview: false,
      capture_pageleave: true,
      advanced_disable_decide: true,
    });
  }
}

export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    if (ENV.POSTHOG_KEY) {
      posthog.capture("$pageview", {
        path: location.pathname,
        search: location.search,
        url: window.location.href,
      });
    }
  }, [location]);
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
) {
  if (ENV.POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
}

export function identifyUser(
  userId: string,
  traits?: Record<string, any>,
) {
  if (ENV.POSTHOG_KEY) {
    posthog.identify(userId, traits);
  }
}
```

### 성능 모니터링

`app/utils/performance.client.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { useEffect } from "react";
import { useLocation, useNavigation } from "@remix-run/react";

export function usePerformanceMonitoring() {
  const location = useLocation();
  const navigation = useNavigation();

  useEffect(() => {
    // 페이지 로드 성능 측정
    if (typeof window !== "undefined" && "performance" in window) {
      const pageLoadTime = performance.now();
      const navigationTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      
      if (navigationTiming) {
        const metrics = {
          path: location.pathname,
          loadTime: pageLoadTime,
          domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime,
          firstContentfulPaint: performance.getEntriesByType("paint").find(
            (entry) => entry.name === "first-contentful-paint",
          )?.startTime,
        };

        // 메트릭 전송
        fetch("/api/metrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metrics),
        }).catch(console.error);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    // 네비게이션 상태 변경 모니터링
    if (navigation.state !== "idle") {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // 네비게이션 성능 메트릭 전송
        fetch("/api/metrics/navigation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: location.pathname,
            duration,
            type: navigation.state,
          }),
        }).catch(console.error);
      };
    }
  }, [navigation.state, location.pathname]);
}
```

## 다음 단계

이제 사용자 피드백 수집과 개선 사항 적용의 기본적인 구조가 완성되었습니다! 다음 단계에서는 최종 테스트와 문서화 작업을 진행할 예정입니다.

구현된 기능들을 확인해보세요:

```bash
# 개발 서버 실행
npm run dev

# 접근성 검사
npm run a11y

# 분석 데이터 확인
npx prisma studio
```

이제 다음과 같은 기능들이 구현되었습니다:
- 사용자 피드백 수집 시스템
- 투어 가이드를 통한 사용성 개선
- 접근성 준수 및 개선
- 사용자 행동 분석 시스템

## 3. 서버 사이드 유틸리티

### API 유틸리티 구현

`app/utils/api.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { redirect } from "@remix-run/node";
import { getUserById, requireAdmin } from "~/models/user.server";
import { getSession } from "./session.server";

export async function requireUserId(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  
  if (!userId) {
    throw new Response(JSON.stringify({ message: "로그인이 필요합니다" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  
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

export async function requireUserWithAdmin(request: Request) {
  const user = await requireUser(request);
  const isAdmin = await requireAdmin(user.id);
  
  if (!isAdmin) {
    throw new Response(JSON.stringify({ message: "관리자 권한이 필요합니다" }), {
      status: 403,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  
  return user;
}

export function redirectIfLoggedIn(request: Request, redirectTo: string) {
  const session = getSession(request.headers.get("Cookie"));
  if (session.has("userId")) {
    return redirect(redirectTo);
  }
  return null;
}
```

### 알림 시스템 구현

`app/utils/alert.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { prisma } from "~/db.server";
import { ENV } from "./env.server";
import { logger } from "~/utils/logger.server";
import { slack } from "~/utils/slack.server";

export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export async function sendAlert(
  severity: AlertSeverity,
  title: string,
  message: string,
  details?: Record<string, any>,
) {
  try {
    // 1. 데이터베이스에 알림 저장
    const alert = await prisma.alert.create({
      data: {
        severity,
        title,
        message,
        details: details ? JSON.stringify(details) : null,
      },
    });
    
    // 2. 슬랙 웹훅으로 알림 전송 (프로덕션 환경에서만)
    if (ENV.NODE_ENV === "production") {
      const color = getColorByAlertSeverity(severity);
      
      await slack.chat.postMessage({
        channel: ENV.SLACK_CHANNEL,
        attachments: [
          {
            color,
            title,
            text: message,
            fields: details
              ? Object.entries(details).map(([key, value]) => ({
                  title: key,
                  value: JSON.stringify(value),
                  short: true,
                }))
              : undefined,
            footer: `YkMake ${ENV.NODE_ENV}`,
            ts: Math.floor(Date.now() / 1000).toString(),
          },
        ],
      });
    }
    
    logger.info(`Alert sent: ${severity} - ${title}`, { alertId: alert.id });
    return alert;
  } catch (error) {
    logger.error("Failed to send alert", { error, severity, title, message });
    throw error;
  }
}

// 알림 심각도에 따른 색상 코드 반환 헬퍼 함수
function getColorByAlertSeverity(severity: AlertSeverity): string {
  const colorMap = {
    [AlertSeverity.INFO]: "#36a64f",     // 녹색
    [AlertSeverity.WARNING]: "#ffd700",  // 황색
    [AlertSeverity.ERROR]: "#ff4500",    // 주황색
    [AlertSeverity.CRITICAL]: "#ff0000", // 적색
  };
  
  return colorMap[severity] || "#cccccc"; // 기본값은 회색
} 