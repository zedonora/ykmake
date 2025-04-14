import winston from "winston";
import { ENV } from "./env.server";

const logger = winston.createLogger({
    level: ENV.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    defaultMeta: { service: "ykmake" },
    transports: [
        // 로그 파일 설정은 실제 배포 환경에 맞게 조정해야 합니다.
        // 예를 들어, Kubernetes 환경에서는 stdout/stderr로 로깅하는 것이 일반적입니다.
        // 아래는 파일 로깅 예시입니다.
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true,
        }),
        new winston.transports.File({
            filename: "logs/combined.log",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true,
        }),
    ],
    // 프로덕션 환경이 아닐 때 콘솔에도 로그 출력
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
    ]
});

// 개발 환경에서는 콘솔에도 출력
if (ENV.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(), // 간단한 포맷 사용
            ),
        }),
    );
}

export { logger };