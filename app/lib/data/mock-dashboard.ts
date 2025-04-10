import type { DashboardStats, Activity, PopularProduct } from "~/lib/types/dashboard";

export const dashboardStats: DashboardStats = {
    totalProducts: 12,
    totalViews: 1234,
    totalLikes: 256,
    totalComments: 89
};

export const recentActivities: Activity[] = [
    {
        id: "a1",
        title: "새 제품 등록: AI 챗봇",
        timestamp: "방금 전"
    },
    {
        id: "a2",
        title: "댓글 작성: Remix 튜토리얼",
        timestamp: "1시간 전"
    },
    {
        id: "a3",
        title: "팀 참여: 블록체인 프로젝트",
        timestamp: "어제"
    },
    {
        id: "a4",
        title: "좋아요: 웹 컴포넌트 라이브러리",
        timestamp: "2일 전"
    }
];

export const popularProducts: PopularProduct[] = [
    {
        id: "p1",
        title: "AI 챗봇",
        views: 523
    },
    {
        id: "p2",
        title: "커뮤니티 플랫폼",
        views: 342
    },
    {
        id: "p3",
        title: "포트폴리오 생성기",
        views: 289
    },
    {
        id: "p4",
        title: "코드 리뷰 도구",
        views: 187
    }
];

export function getDashboardData() {
    return {
        stats: dashboardStats,
        activities: recentActivities,
        popularProducts: popularProducts
    };
}