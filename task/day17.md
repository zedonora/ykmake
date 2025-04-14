# Day 17: 모니터링 시스템 구축

## 목표

오늘은 YkMake의 모니터링 시스템을 구축합니다. 서비스의 안정성과 성능을 모니터링하고 문제가 발생했을 때 신속하게 대응할 수 있도록 합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성합니다:

```bash
mkdir -p app/utils app/middleware app/routes grafana/dashboards logs prometheus grafana/provisioning/datasources grafana/provisioning/dashboards
touch app/utils/logger.server.ts
touch app/middleware/logging.server.ts
touch app/utils/metrics.server.ts
touch app/routes/metrics.tsx
touch app/utils/alert.server.ts
touch app/utils/error-monitoring.server.ts
touch grafana/dashboards/overview.json
touch prometheus/prometheus.yml
touch grafana/provisioning/datasources/prometheus.yml
touch grafana/provisioning/dashboards/provider.yml
touch docker-compose.yml # If not exists, otherwise update
```

## 필수 라이브러리 설치

다음 명령어를 실행하여 모니터링 관련 라이브러리를 설치합니다.

```bash
npm install winston prom-client @slack/web-api @sentry/remix @sentry/tracing
# Express 또는 사용하는 웹 프레임워크의 타입 정의 (필요시)
# npm install --save-dev @types/express
```

## 작업 목록

1. 로깅 시스템 구축
2. 메트릭 수집 설정
3. 알림 시스템 구축
4. 대시보드 구성

## 1. 로깅 시스템 구축

### Winston 로거 설정

`app/utils/logger.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
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
```

### 로깅 미들웨어

`app/middleware/logging.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
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
```

## 2. 메트릭 수집 설정

### Prometheus 설정

`app/utils/metrics.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import client from "prom-client";

// 기본 Node.js 메트릭 및 GC 메트릭 수집 활성화
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'nodejs_' }); // 접두사 추가하여 충돌 방지

// Prometheus 레지스트리 생성
export const register = new client.Registry();

// 기본 메트릭을 커스텀 레지스트리에 등록
register.setDefaultLabels({
  app: 'ykmake' // 모든 메트릭에 기본 레이블 추가
});
client.collectDefaultMetrics({ register });

// 애플리케이션 특정 메트릭 정의

// HTTP 요청 카운터
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status_code"], // status -> status_code로 변경 (관례)
  registers: [register], // 커스텀 레지스트리에 등록
});

// HTTP 요청 지연 시간 히스토그램
export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path", "status_code"],
  // 버킷은 서비스 특성에 맞게 조정 (예: 밀리초 단위)
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// 활성 사용자 수 게이지 (실시간 값 반영 필요)
export const activeUsersGauge = new client.Gauge({
  name: "active_users",
  help: "Number of active users currently connected",
  // labelNames: ['region'], // 필요시 레이블 추가
  registers: [register],
});

// 데이터베이스 작업 지연 시간 히스토그램
export const dbQueryDurationSeconds = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "Database query duration in seconds",
  labelNames: ["operation", "table", "success"], // 성공 여부 레이블 추가
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});

// 에러 카운터
export const errorsTotal = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors encountered',
  labelNames: ['type', 'severity'], // 에러 타입, 심각도 등 레이블 추가
  registers: [register],
});
```

### 메트릭 엔드포인트

`app/routes/metrics.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { LoaderFunctionArgs } from "@remix-run/node";
import { register } from "~/utils/metrics.server"; // 커스텀 레지스트리 임포트
import { requireAdmin } from "~/utils/api.server"; // 또는 다른 인증 방식

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // '/metrics' 엔드포인트는 일반적으로 인증 없이 접근 허용하거나,
  // 별도의 네트워크 정책으로 보호합니다.
  // 여기서는 예시로 관리자 권한을 확인합니다.
  await requireAdmin(request);

  try {
    // Prometheus 메트릭 데이터를 수집합니다.
    const metrics = await register.metrics();

    // Content-Type을 Prometheus 형식으로 지정하여 응답합니다.
    return new Response(metrics, {
      status: 200,
      headers: {
        "Content-Type": register.contentType,
      },
    });
  } catch (error) {
    console.error("Failed to collect metrics:", error);
    return new Response("Error collecting metrics", { status: 500 });
  }
};
```

## 3. 알림 시스템 구축

### Slack 알림 설정

`app/utils/alert.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
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
        // Prisma 스키마에 'Alert' 모델이 정의되어 있어야 합니다.
        // 예: npx prisma model Alert ... 후 npx prisma generate
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
```

### 에러 모니터링

`app/utils/error-monitoring.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
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
    // 성능 모니터링 활성화 시
    // integrations: [
    //   new BrowserTracing(),
    // ],

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
```


## 4. 대시보드 구성

### Grafana 대시보드 설정

`grafana/dashboards/overview.json` 파일을 생성하고 다음과 같이 구현합니다:

```json
{
  "__inputs": [],
  "__requires": [],
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "target": {
          "limit": 100,
          "matchAny": false,
          "tags": [],
          "type": "dashboard"
        },
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0, // 0: Default, 1: Shared crosshair, 2: Shared tooltip
  "id": null, // ID는 Grafana에서 자동 할당
  "links": [],
  "liveNow": false,
  "panels": [
    // 패널 1: HTTP 요청 비율 (Rate per second)
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus" // Prometheus 데이터 소스 UID (Grafana 설정에 따라 다름)
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "Requests/sec",
            "axisPlacement": "left",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 10,
            "gradientMode": "opacity",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear", // linear or smooth
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false, // null 값 처리 방식
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "red", "value": 80 } // 예시 임계값
            ]
          },
          "unit": "reqps" // Requests per second 단위
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
      "id": 1,
      "options": {
        "legend": {
          "calcs": ["lastNotNull", "mean", "max"], // 범례에 표시할 계산값
          "displayMode": "table", // list, table, hidden
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "multi", // single, multi, none
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          // 5분 간격의 초당 평균 요청 수 (증가율)
          "expr": "sum(rate(http_requests_total{job=\"ykmake\"}[5m])) by (status_code)",
          "legendFormat": "{{status_code}}", // 범례 포맷
          "refId": "A"
        }
      ],
      "title": "HTTP Request Rate by Status Code",
      "type": "timeseries" // 시계열 그래프
    },
    // 패널 2: HTTP 요청 지연 시간 (95th Percentile)
    {
      "datasource": { "type": "prometheus", "uid": "prometheus" },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "custom": {
            "axisLabel": "Duration (ms)",
            "axisPlacement": "left",
            "drawStyle": "line",
            "fillOpacity": 5,
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "showPoints": "auto"
          },
          "unit": "ms", // Milliseconds 단위
           "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null }, // 기본값: 녹색
              { "color": "orange", "value": 500 }, // 500ms 이상: 주황색
              { "color": "red", "value": 1000 } // 1000ms 이상: 빨간색
            ]
          }
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 },
      "id": 2,
      "options": {
        "legend": { "displayMode": "table", "placement": "bottom", "calcs": ["lastNotNull"] },
        "tooltip": { "mode": "multi" }
      },
      "targets": [
        {
          "datasource": { "type": "prometheus", "uid": "prometheus" },
          // 5분 간격, 95번째 백분위수 응답 시간 (밀리초 단위)
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job=\"ykmake\"}[5m])) by (le, method, path)) * 1000",
          "legendFormat": "{{method}} {{path}} - p95",
          "refId": "A"
        }
      ],
      "title": "HTTP Request Latency (95th Percentile)",
      "type": "timeseries"
    },
    // 추가 패널 구성 (예: 에러율, CPU/Memory 사용량, 활성 사용자 수 등)
    // ...
  ],
  "refresh": "15s", // 대시보드 자동 새로고침 간격
  "schemaVersion": 38,
  "style": "dark", // dark or light 테마
  "tags": ["ykmake", "overview"], // 대시보드 검색 태그
  "templating": {
    "list": [
      // 필요시 변수 추가 (예: 데이터소스, 환경 등)
      // {
      //   "name": "environment",
      //   "label": "Environment",
      //   "query": "label_values(node_uname_info, environment)",
      //   "datasource": { "type": "prometheus", "uid": "prometheus" },
      //   "type": "query",
      //   "multi": true,
      //   "includeAll": true
      // }
    ]
  },
  "time": {
    "from": "now-1h", // 기본 시간 범위: 최근 1시간
    "to": "now"
  },
  "timepicker": {
    "refresh_intervals": ["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h", "2h", "1d"],
    "time_options": ["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"]
  },
  "timezone": "browser", // 브라우저 시간대 사용
  "title": "YkMake Overview Dashboard",
  "uid": "ykmake-overview", // 대시보드 고유 ID (직접 지정 권장)
  "version": 1, // 대시보드 버전
  "weekStart": "" // 한 주의 시작 요일 (기본값 사용)
}
```

### Docker Compose 업데이트

`docker-compose.yml` 파일에 모니터링 서비스를 추가하고 기존 서비스를 업데이트합니다.

```yaml
version: '3.8' # 최신 버전 명시 권장

services:
  app: # 기존 Remix 앱 서비스
    build: .
    ports:
      - "3000:3000"
    environment:
      # 기존 환경 변수...
      - NODE_ENV=production
      - SESSION_SECRET=${SESSION_SECRET} # .env 파일에서 가져오도록 수정
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - REDIS_URL=redis://cache:6379
      - MINIO_ENDPOINT=http://minio:9000
      - AWS_ACCESS_KEY_ID=${MINIO_ROOT_USER} # MinIO 환경변수 사용
      - AWS_SECRET_ACCESS_KEY=${MINIO_ROOT_PASSWORD}
      - AWS_REGION=us-east-1 # MinIO는 리전 개념이 약하지만 SDK 호환성을 위해 설정
      - S3_BUCKET=${MINIO_BUCKET_NAME:-ykmake} # 기본값 설정
      # 인증 관련 환경 변수...
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      # ... (다른 OAuth 공급자)
      # 모니터링 관련 환경 변수 추가
      - SLACK_TOKEN=${SLACK_TOKEN}
      - SLACK_CHANNEL=${SLACK_CHANNEL}
      - SENTRY_DSN=${SENTRY_DSN}
    depends_on:
      db:
        condition: service_healthy # DB가 healthy 상태일 때 앱 시작
      cache:
        condition: service_started # 캐시 서비스 시작 후 앱 시작
      minio:
        condition: service_healthy # MinIO가 healthy 상태일 때 앱 시작
    volumes:
      - ./logs:/app/logs # 로그 볼륨 마운트 (선택 사항)
    healthcheck: # 앱 상태 확인 (선택 사항)
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"] # 건강 체크 엔드포인트 필요
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s # 앱 시작 대기 시간

  db: # 데이터베이스 서비스 (기존 설정 활용)
    image: postgres:15-alpine # 버전 명시 권장
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-user}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}
      - POSTGRES_DB=${POSTGRES_DB:-ykmake}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-user} -d ${POSTGRES_DB:-ykmake}"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports: # 개발/디버깅용 로컬 포트 노출 (선택 사항)
      - "5432:5432"

  cache: # 캐시 서비스 (기존 설정 활용)
    image: redis:7-alpine # 버전 명시 권장
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio: # 스토리지 서비스 (기존 설정 활용)
    image: minio/minio:RELEASE.2023-09-07T02-05-02Z # 특정 버전 명시 권장
    ports:
      - "9000:9000" # S3 API 포트
      - "9001:9001" # MinIO Console 포트
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER:-minioadmin}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD:-minioadmin}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5

  createbuckets: # MinIO 버킷 생성 서비스 (기존 설정 활용)
    image: minio/mc:RELEASE.2023-09-04T19-13-18Z # 특정 버전 명시 권장
    depends_on:
      minio:
        condition: service_healthy # MinIO healthy 상태 확인 후 실행
    entrypoint: >
      /bin/sh -c "
      /usr/bin/mc config host add myminio http://minio:9000 ${MINIO_ROOT_USER:-minioadmin} ${MINIO_ROOT_PASSWORD:-minioadmin};
      /usr/bin/mc mb myminio/${MINIO_BUCKET_NAME:-ykmake} || true;
      /usr/bin/mc policy set public myminio/${MINIO_BUCKET_NAME:-ykmake};
      echo 'MinIO bucket ${MINIO_BUCKET_NAME:-ykmake} created/verified.';
      exit 0;
      "

  # -- 모니터링 스택 추가 --
  prometheus:
    image: prom/prometheus:v2.47.2 # 버전 명시 권장
    volumes:
      - ./prometheus:/etc/prometheus # Prometheus 설정 파일 마운트
      - prometheus_data:/prometheus # Prometheus 데이터 볼륨
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle' # 설정 리로드 API 활성화
    ports:
      - "9090:9090"
    restart: unless-stopped
    depends_on:
      - app # 앱이 실행된 후 Prometheus 시작 (메트릭 수집 대상)

  grafana:
    image: grafana/grafana:10.1.5 # 버전 명시 권장
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning # 프로비저닝 설정 마운트
      - grafana_data:/var/lib/grafana # Grafana 데이터 볼륨
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin} # 환경 변수 사용
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false # 사용자 등록 비활성화
      # 필요시 추가 Grafana 설정 (예: SMTP, OAuth)
      # - GF_SMTP_ENABLED=true
      # - GF_SMTP_HOST=smtp.example.com:587
      # ...
    ports:
      - "3001:3000" # 3000 포트 대신 3001 사용 (앱과 충돌 방지)
    restart: unless-stopped
    depends_on:
      - prometheus # Prometheus 실행 후 Grafana 시작

  # (선택 사항) Node Exporter: 호스트 머신 메트릭 수집
  # node-exporter:
  #   image: prom/node-exporter:v1.6.1
  #   volumes:
  #     - /proc:/host/proc:ro
  #     - /sys:/host/sys:ro
  #     - /:/rootfs:ro
  #   command:
  #     - '--path.procfs=/host/proc'
  #     - '--path.sysfs=/host/sys'
  #     - '--path.rootfs=/rootfs'
  #     - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc|rootfs/var/lib/docker/containers|rootfs/var/lib/docker/overlay2|rootfs/run/docker/netns|rootfs/var/lib/docker/aufs)($$|/)'
  #   ports:
  #     - "9100:9100"
  #   restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
  prometheus_data:
  grafana_data:
```

## Prometheus 설정 파일

`prometheus/prometheus.yml` 파일을 생성하고 다음과 같이 구현합니다.

```yaml
global:
  scrape_interval: 15s # 기본 스크랩 간격
  evaluation_interval: 15s # 규칙 평가 간격

scrape_configs:
  - job_name: 'prometheus' # Prometheus 자체 메트릭 수집
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'ykmake' # YkMake 애플리케이션 메트릭 수집
    # Docker Compose 네트워크 내 서비스 검색 사용
    # 또는 static_configs로 명시적 지정
    static_configs:
      # 'app'은 docker-compose.yml에 정의된 서비스 이름
      # 3000번 포트의 /metrics 엔드포인트
      - targets: ['app:3000']
        labels:
          instance: ykmake-app-1 # 인스턴스 레이블 (필요시)

  # (선택 사항) Node Exporter 메트릭 수집
  # - job_name: 'node-exporter'
  #   static_configs:
  #     - targets: ['node-exporter:9100']

# (선택 사항) 알림 규칙 설정 (Alertmanager 필요)
# alerting:
#   alertmanagers:
#     - static_configs:
#         - targets: ['alertmanager:9093'] # Alertmanager 서비스 주소

# rule_files:
#   - 'alert.rules.yml' # 알림 규칙 파일 경로
```


## Grafana 프로비저닝 설정

Grafana 데이터 소스 및 대시보드를 자동으로 설정하기 위해 프로비저닝 파일을 생성합니다.

`grafana/provisioning/datasources/prometheus.yml`

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy # 서버(Grafana 백엔드)를 통해 접근
    url: http://prometheus:9090 # Docker Compose 서비스 이름 사용
    isDefault: true # 기본 데이터 소스로 설정
    jsonData:
      timeInterval: "15s" # 권장 스크랩 간격과 일치
    editable: false # UI에서 수정 불가
```

`grafana/provisioning/dashboards/provider.yml`

```yaml
apiVersion: 1

providers:
  - name: 'YkMake Dashboards' # 프로바이더 이름
    orgId: 1 # 기본 조직 ID
    folder: 'YkMake' # Grafana 내 폴더 이름
    type: file # 파일 시스템에서 대시보드 로드
    disableDeletion: false # Grafana UI에서 대시보드 삭제 허용
    editable: true # Grafana UI에서 대시보드 수정 허용
    options:
      path: /etc/grafana/provisioning/dashboards # 대시보드 JSON 파일 경로 (Dockerfile/Volume 마운트 경로)
```

이제 `grafana/dashboards/overview.json` 파일을 `grafana/provisioning/dashboards/` 디렉토리로 이동하거나 복사해야 합니다.

```bash
mv grafana/dashboards/overview.json grafana/provisioning/dashboards/overview.json
```

## 다음 단계

이제 모니터링 시스템의 기본적인 구조가 완성되었습니다! 다음 단계에서는 실제 서버에 배포하고 테스트를 진행하며, 필요에 따라 알림 규칙을 추가하고 대시보드를 상세화할 예정입니다.

모니터링 시스템이 잘 구축되었는지 로컬에서 테스트해보세요:

```bash
# 환경 변수 파일 생성 (.env) 및 설정
# cp .env.example .env
# nano .env # 필요한 값들 (DB, OAuth, AWS/MinIO, Redis, SMTP, Slack 토큰, Slack 채널, Sentry DSN 등) 설정

# Docker Compose로 모든 서비스 실행
docker-compose up -d --build # --build 옵션으로 이미지 재빌드

# 각 서비스 접속 확인
echo "Waiting for services to start..."
sleep 10 # 서비스 시작 대기 (healthcheck에 따라 조정)

echo "Grafana: http://localhost:3001 (User: admin, Pass: [설정한 비밀번호 또는 기본값 admin])"
echo "Prometheus: http://localhost:9090"
echo "MinIO Console: http://localhost:9001 (User: minioadmin, Pass: minioadmin)"
echo "YkMake App: http://localhost:3000"

# 로그 확인 (필요시)
# docker-compose logs -f app
# docker-compose logs -f prometheus
# docker-compose logs -f grafana
```

이제 다음과 같은 모니터링 기능들이 구축되었습니다:
- Winston을 이용한 구조화된 **로그 수집** 및 관리 (파일 및 콘솔)
- Prometheus 클라이언트를 이용한 **시스템/애플리케이션 메트릭 수집** (`/metrics` 엔드포인트)
- Slack 웹 API를 이용한 **알림 시스템** (심각도 기반)
- Sentry를 이용한 **에러 추적 및 리포팅**
- Prometheus 데이터 소스와 연동된 **Grafana 대시보드** (기본 개요)
- Docker Compose를 통한 **모니터링 스택 컨테이너화**
