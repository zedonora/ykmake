# Day 17: 모니터링 시스템 구축

## 목표

오늘은 YkMake의 모니터링 시스템을 구축합니다. 서비스의 안정성과 성능을 모니터링하고 문제가 발생했을 때 신속하게 대응할 수 있도록 합니다.

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
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

if (ENV.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
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

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });
  });

  next();
}
```

## 2. 메트릭 수집 설정

### Prometheus 설정

`app/utils/metrics.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import client from "prom-client";

// 기본 메트릭 수집 활성화
client.collectDefaultMetrics();

// HTTP 요청 카운터
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
});

// HTTP 요청 지연 시간
export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// 활성 사용자 수
export const activeUsersGauge = new client.Gauge({
  name: "active_users",
  help: "Number of active users",
});

// 데이터베이스 쿼리 지연 시간
export const dbQueryDurationSeconds = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "Database query duration in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});
```

### 메트릭 엔드포인트

`app/routes/metrics.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { register } from "prom-client";
import { requireAdmin } from "~/utils/api.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdmin(request);
  
  const metrics = await register.metrics();
  return new Response(metrics, {
    headers: {
      "Content-Type": register.contentType,
    },
  });
};
```

## 3. 알림 시스템 구축

### Slack 알림 설정

`app/utils/alert.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { WebClient } from "@slack/web-api";
import { ENV } from "./env.server";
import { logger } from "./logger.server";

const slack = new WebClient(ENV.SLACK_TOKEN);

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
    const color = {
      [AlertSeverity.INFO]: "#36a64f",
      [AlertSeverity.WARNING]: "#ffd700",
      [AlertSeverity.ERROR]: "#ff4500",
      [AlertSeverity.CRITICAL]: "#ff0000",
    }[severity];

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
  } catch (error) {
    logger.error("Failed to send alert", { error, severity, title, message });
  }
}
```

### 에러 모니터링

`app/utils/error-monitoring.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import * as Sentry from "@sentry/node";
import { ENV } from "./env.server";
import { sendAlert, AlertSeverity } from "./alert.server";
import { logger } from "./logger.server";

export function initErrorMonitoring() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

export async function captureError(
  error: Error,
  context?: Record<string, any>,
) {
  // Sentry에 에러 기록
  const eventId = Sentry.captureException(error, {
    extra: context,
  });

  // 로그 기록
  logger.error(error.message, {
    error,
    context,
    eventId,
  });

  // Slack 알림 전송
  await sendAlert(
    AlertSeverity.ERROR,
    "에러 발생",
    error.message,
    {
      stack: error.stack,
      ...context,
      eventId,
    },
  );

  return eventId;
}
```

## 4. 대시보드 구성

### Grafana 대시보드 설정

`grafana/dashboards/overview.json` 파일을 생성하고 다음과 같이 구현합니다:

```json
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 10,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "smooth",
            "lineWidth": 2,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "never",
            "spanNulls": true,
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
              {
                "color": "green",
                "value": null
              }
            ]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "id": 1,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "expr": "rate(http_requests_total[5m])",
          "refId": "A"
        }
      ],
      "title": "HTTP 요청 비율",
      "type": "timeseries"
    }
  ],
  "refresh": "5s",
  "schemaVersion": 38,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-1h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "YkMake 개요",
  "version": 0,
  "weekStart": ""
}
```

### Docker Compose 업데이트

`docker-compose.yml` 파일에 모니터링 서비스를 추가합니다:

```yaml
services:
  # ... 기존 서비스 ...

  prometheus:
    image: prom/prometheus:v2.45.0
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:10.0.3
    volumes:
      - ./grafana:/etc/grafana
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3001:3000"
    depends_on:
      - prometheus

volumes:
  # ... 기존 볼륨 ...
  prometheus_data:
  grafana_data:
```

## 다음 단계

이제 모니터링 시스템의 기본적인 구조가 완성되었습니다! 다음 단계에서는 실제 서버에 배포하고 테스트를 진행할 예정입니다.

모니터링 시스템이 잘 구축되었는지 로컬에서 테스트해보세요:

```bash
# Docker Compose로 실행
docker-compose up -d

# 각 서비스 접속
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
```

이제 다음과 같은 모니터링 기능들이 구축되었습니다:
- 로그 수집 및 관리
- 시스템 메트릭 수집
- Slack 알림 시스템
- Sentry 에러 추적
- Grafana 대시보드