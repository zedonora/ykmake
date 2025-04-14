import { prisma } from "~/utils/api.server";
import { WebClient, LogLevel } from "@slack/web-api";
import { ENV } from "./env.server";
import { logger } from "./logger.server";

// Slack 클라이언트 초기화
const slack = new WebClient(ENV.SLACK_TOKEN, {
    logLevel: ENV.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG,
});

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
 * 알림을 데이터베이스에 기록하고 Slack으로 알림을 전송합니다.
 * @param severity 알림 심각도
 * @param title 알림 제목
 * @param message 알림 메시지
 * @param details 추가 상세 정보 (선택사항)
 * @returns 생성된 알림 객체 (DB 저장 기준)
 */
export async function sendAlert(
    severity: AlertSeverity,
    title: string,
    message: string,
    details?: Record<string, any>
) {
    let savedAlert; // DB 저장 결과 저장 변수
    try {
        // 데이터베이스에 알림 저장
        savedAlert = await prisma.alert.create({
            data: {
                severity,
                title,
                message,
                details: details ? JSON.stringify(details) : null,
            },
        });
        logger.info("Alert saved to database", { alertId: savedAlert.id });

    } catch (dbError: any) {
        logger.error("Failed to save alert to database", {
            error: dbError.message,
            severity,
            title
        });
        // DB 저장 실패 시에도 Slack 알림은 시도할 수 있도록 throw하지 않음
        // throw dbError; // 필요하다면 에러를 다시 던짐
    }

    // Slack 알림 전송 로직 추가
    if (!ENV.SLACK_TOKEN || !ENV.SLACK_CHANNEL) {
        logger.warn("Slack token or channel not configured. Skipping alert.", { severity, title });
        return savedAlert; // DB 저장 결과만 반환
    }

    try {
        const color = {
            [AlertSeverity.INFO]: "#36a64f",
            [AlertSeverity.WARNING]: "#ffcd3c",
            [AlertSeverity.ERROR]: "#e01e5a",
            [AlertSeverity.CRITICAL]: "#ff0000",
        }[severity];

        const blocks: any[] = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `[${severity.toUpperCase()}] ${title}`,
                    emoji: true,
                },
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: message,
                },
            },
        ];

        if (details && Object.keys(details).length > 0) {
            blocks.push({ type: "divider" as const });
            const fields = Object.entries(details)
                .map(([key, value]) => `*${key}*: \`\`\`${JSON.stringify(value, null, 2)}\`\`\``)
                .join("\n");

            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: fields,
                },
            });
        }

        blocks.push({ type: "divider" as const });
        blocks.push({
            type: "context" as const,
            elements: [
                {
                    type: "mrkdwn" as const,
                    text: `*Service*: YkMake | *Environment*: ${ENV.NODE_ENV} | *Timestamp*: <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`,
                },
            ],
        });

        await slack.chat.postMessage({
            channel: ENV.SLACK_CHANNEL,
            text: `[${severity.toUpperCase()}] ${title}: ${message}`, // Fallback text
            attachments: [{ // Use attachments for block kit compatibility
                color,
                blocks
            }],
        });

        logger.info("Alert sent successfully via Slack", { severity, title });

    } catch (slackError: any) {
        logger.error("Failed to send alert via Slack", {
            error: slackError.message,
            slackErrorData: slackError.data,
            severity,
            title,
        });
    }

    return savedAlert; // DB 저장 결과 반환
} 