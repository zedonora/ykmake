import type { Request, Response, NextFunction } from "express";
import { logger } from "~/utils/logger.server";

export function loggingMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const start = Date.now();
    const { method, url, ip } = req;
    const userAgent = req.get("user-agent") || "-";

    // 요청 시작 로그 (선택 사항)
    // logger.info("Request started", { method, url, ip, userAgent });

    res.on("finish", () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        logger.info("Request completed", {
            method,
            url,
            status: statusCode,
            duration,
            ip,
            userAgent,
        });
    });

    res.on("close", () => {
        // 연결이 비정상적으로 종료된 경우 (선택 사항)
        if (!res.writableEnded) {
            const duration = Date.now() - start;
            logger.warn("Connection closed prematurely", {
                method,
                url,
                duration,
                ip,
                userAgent,
            });
        }
    });

    next();
}