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