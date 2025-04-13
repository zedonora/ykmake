import { prisma } from "~/utils/api.server";

/**
 * 알림 심각도 수준을 정의하는 열거형
 */
export enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical",
}

/**
 * 알림을 데이터베이스에 기록하고 필요시 외부 서비스로 알림을 전송합니다.
 * @param severity 알림 심각도
 * @param title 알림 제목
 * @param message 알림 메시지
 * @param details 추가 상세 정보 (선택사항)
 * @returns 생성된 알림 객체
 */
export async function sendAlert(
    severity: AlertSeverity,
    title: string,
    message: string,
    details?: Record<string, any>
) {
    try {
        // 데이터베이스에 알림 저장
        const alert = await prisma.alert.create({
            data: {
                severity,
                title,
                message,
                details: details ? JSON.stringify(details) : null,
            },
        });

        // 프로덕션 환경에서는 추가 작업을 수행할 수 있음
        // 예: Slack 메시지 전송, 이메일 알림 등
        if (process.env.NODE_ENV === "production") {
            console.log(`[ALERT] ${severity.toUpperCase()}: ${title} - ${message}`);

            // 외부 알림 서비스 연동 코드 (추후 구현)
            // 예: sendSlackNotification(severity, title, message, details);
        }

        return alert;
    } catch (error) {
        console.error("알림 발송 실패:", error);
        throw error;
    }
}

/**
 * 알림 심각도 수준에 따른 색상 코드를 반환합니다.
 * @param severity 알림 심각도
 * @returns 색상 코드
 */
function getColorForSeverity(severity: AlertSeverity): string {
    switch (severity) {
        case AlertSeverity.INFO:
            return "#2196F3"; // 파란색
        case AlertSeverity.WARNING:
            return "#FF9800"; // 주황색
        case AlertSeverity.ERROR:
            return "#F44336"; // 빨간색
        case AlertSeverity.CRITICAL:
            return "#9C27B0"; // 보라색
        default:
            return "#757575"; // 회색
    }
} 