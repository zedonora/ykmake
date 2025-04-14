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