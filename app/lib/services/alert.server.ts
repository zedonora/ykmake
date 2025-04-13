import { prisma } from "~/lib/db.server";
import { ENV } from "~/lib/env.server";
import { logger } from "~/lib/logger.server";
import { sendSlackMessage } from "~/lib/services/slack.server";

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
 * 알림을 데이터베이스에 기록하고 프로덕션 환경에서는 Slack으로 알림을 전송합니다.
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
    details?: string
) {
    try {
        // 데이터베이스에 알림 저장
        const alert = await prisma.alert.create({
            data: {
                severity,
                title,
                message,
                details,
            },
        });

        // 로그 기록
        logger.log(severity, `Alert: ${title} - ${message}`);

        // 프로덕션 환경에서 Slack으로 알림 전송 (심각도에 따라)
        if (ENV.NODE_ENV === "production") {
            if (
                severity === AlertSeverity.ERROR ||
                severity === AlertSeverity.CRITICAL
            ) {
                await sendSlackMessage({
                    channel: "#alerts",
                    text: `*[${severity.toUpperCase()}]* ${title}`,
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `*[${severity.toUpperCase()}]* ${title}`,
                            },
                        },
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: message,
                            },
                        },
                        ...(details
                            ? [
                                {
                                    type: "section",
                                    text: {
                                        type: "mrkdwn",
                                        text: `*상세 정보:*\n\`\`\`${details}\`\`\``,
                                    },
                                },
                            ]
                            : []),
                        {
                            type: "context",
                            elements: [
                                {
                                    type: "mrkdwn",
                                    text: `🕒 ${new Date().toLocaleString()}`,
                                },
                            ],
                        },
                    ],
                    color: getColorByAlertSeverity(severity),
                });
            }
        }

        return alert;
    } catch (error) {
        logger.error("알림 발송 실패", error);
        throw error;
    }
}

/**
 * 알림 심각도 수준에 따른 색상 코드를 반환합니다.
 * @param severity 알림 심각도
 * @returns 색상 코드
 */
function getColorByAlertSeverity(severity: AlertSeverity): string {
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