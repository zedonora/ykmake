import * as Sentry from "@sentry/remix"; // Remix SDK 사용
import { ENV } from "./env.server";
import { sendAlert, AlertSeverity } from "./alert.server";
import { logger } from "./logger.server";

export function initErrorMonitoring() {
    if (!ENV.SENTRY_DSN) {
        logger.warn("Sentry DSN not configured. Skipping Sentry initialization.");
        return;
    }

    Sentry.init({
        dsn: ENV.SENTRY_DSN,
        environment: ENV.NODE_ENV,
        tracesSampleRate: ENV.NODE_ENV === 'production' ? 0.1 : 1.0, // 프로덕션에서는 샘플링 비율 조정

        // 트랜잭션 이름에 파라미터 포함 여부 (선택 사항)
        // normalizeDepth: 5, // 데이터 깊이 제한
        beforeSend(event, hint) {
            // 특정 에러는 전송하지 않도록 필터링 가능
            // if (event.exception?.values?.[0].type === 'SpecificErrorTypeToIgnore') {
            //   return null;
            // }
            // 개인 식별 정보(PII) 제거 로직 추가 가능
            logger.debug("Sending event to Sentry", { eventId: event.event_id });
            return event;
        },
    });

    logger.info("Sentry initialized successfully.");
}

// Remix의 ErrorBoundary나 에러 처리 로직에서 호출
export async function captureError(
    error: unknown, // Error 타입 외 다른 타입도 올 수 있음
    context?: Record<string, any>,
): Promise<string | undefined> { // eventId는 없을 수도 있음
    if (!ENV.SENTRY_DSN) {
        logger.error("Sentry DSN not configured. Cannot capture error.", { error, context });
        return undefined;
    }

    let eventId: string | undefined;
    let errorMessage: string = "An unknown error occurred";
    let errorStack: string | undefined;

    if (error instanceof Error) {
        errorMessage = error.message;
        errorStack = error.stack;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    try {
        // Sentry에 에러 기록
        eventId = Sentry.captureException(error, {
            extra: { ...context }, // 컨텍스트 정보 추가
            // tags: { key: value }, // 검색 및 필터링을 위한 태그 추가 가능
        });
        logger.info("Error captured by Sentry", { eventId, errorMessage });

        // 로그 기록 (Sentry 전송과 별개로 로컬 로깅)
        logger.error(errorMessage, {
            error, // 전체 에러 객체 로깅 (필요시)
            context,
            sentryEventId: eventId,
        });

        // 심각한 에러만 Slack 알림 전송 (예: 5xx 에러)
        // 모든 에러를 알림으로 보내면 노이즈가 심할 수 있음
        // severity는 context나 에러 타입 분석을 통해 결정
        const severity = AlertSeverity.ERROR; // 기본값을 ERROR로 설정

        // 알림 발생 조건 추가 (예: 특정 타입의 에러만 알림)
        if (shouldAlert(error, context)) {
            await sendAlert(
                severity,
                "에러 발생", // 알림 제목 개선 (예: "Critical API Error")
                errorMessage,
                {
                    stack: errorStack, // 스택 정보 포함
                    ...context,
                    sentryEventId: eventId,
                },
            );
        }

    } catch (captureEx) {
        // Sentry 전송 실패 시 로깅
        logger.error("Failed to capture or report error", { originalError: error, captureError: captureEx });
    }

    return eventId;
}

// 특정 에러에 대해서만 알림을 보낼지 결정하는 함수 (예시)
function shouldAlert(error: unknown, context?: Record<string, any>): boolean {
    // 예: status 코드가 500 이상인 경우만 알림
    if (context?.statusCode && typeof context.statusCode === 'number' && context.statusCode >= 500) {
        return true;
    }
    // 예: 특정 타입의 Critical 에러만 알림
    // if (error instanceof CriticalApplicationError) {
    //   return true;
    // }
    return false; // 기본적으로는 알림 안 함
}