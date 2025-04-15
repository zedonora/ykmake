import http from "k6/http";
import { check, sleep, group } from "k6";

// 테스트 옵션 설정
export const options = {
    stages: [
        { duration: "30s", target: 20 },  // 30초 동안 사용자 20명으로 증가 (Warm-up)
        { duration: "1m", target: 50 },   // 1분 동안 50명으로 증가
        { duration: "2m", target: 50 },   // 2분 동안 50명 유지 (Load)
        { duration: "1m", target: 100 },  // 1분 동안 100명으로 증가 (Stress)
        { duration: "2m", target: 100 },  // 2분 동안 100명 유지
        { duration: "30s", target: 0 },   // 30초 동안 0명으로 감소 (Cool-down)
    ],
    thresholds: {
        // 95%의 요청 응답 시간이 500ms 미만이어야 함
        http_req_duration: ["p(95)<500"],
        // 99%의 요청 응답 시간이 1000ms 미만이어야 함
        http_req_duration: ["p(99)<1000"],
        // 실패한 요청 비율이 1% 미만이어야 함
        http_req_failed: ["rate<0.01"],
        // 특정 그룹의 응답 시간 임계값 설정 (선택 사항)
        'http_req_duration{group:::홈페이지 로드}': ['max<1500'],
    },
    // 실행 환경 변수 사용 (예: k6 run -e BASE_URL=https://your-staging.com script.js)
    baseUrl: __ENV.BASE_URL || "https://ykmake.com", // 기본 URL 설정
};

// 테스트 함수
export default function () {
    const baseUrl = options.baseUrl;

    group("홈페이지 로드", function () {
        const res = http.get(`${baseUrl}/`);
        check(res, {
            "상태 코드 200": (r) => r.status === 200,
            "응답 시간 < 1.5s": (r) => r.timings.duration < 1500,
        });
    });

    sleep(Math.random() * 3 + 1); // 1~4초 사이 랜덤 대기

    group("제품 목록 페이지 로드", function () {
        const res = http.get(`${baseUrl}/products`);
        check(res, {
            "상태 코드 200": (r) => r.status === 200,
            "응답 시간 < 2s": (r) => r.timings.duration < 2000,
        });
    });

    sleep(Math.random() * 3 + 1);

    group("팀 목록 페이지 로드", function () {
        const res = http.get(`${baseUrl}/teams`);
        check(res, {
            "상태 코드 200": (r) => r.status === 200,
            "응답 시간 < 2s": (r) => r.timings.duration < 2000,
        });
    });

    sleep(Math.random() * 3 + 1);

    // 추가적인 API 요청 또는 시나리오 테스트...
    // 예: 로그인, 글 작성 등
}