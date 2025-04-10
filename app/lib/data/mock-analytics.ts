import type {
    DashboardChartData,
    ProductAnalytics,
    TeamAnalytics,
    ActivityAnalytics
} from "~/lib/types/analytics";
import type {
    ActivityChartData,
    ProductChartData,
    TeamChartData,
    UserActivityData
} from "~/lib/types/charts";

// 대시보드 차트 데이터
export const activityChartData: ActivityChartData[] = [
    { name: "1월", 제품: 4, 조회수: 240, 좋아요: 24 },
    { name: "2월", 제품: 3, 조회수: 139, 좋아요: 18 },
    { name: "3월", 제품: 2, 조회수: 980, 좋아요: 79 },
    { name: "4월", 제품: 3, 조회수: 390, 좋아요: 45 },
    { name: "5월", 제품: 4, 조회수: 480, 좋아요: 76 },
    { name: "6월", 제품: 3, 조회수: 380, 좋아요: 34 },
    { name: "7월", 제품: 4, 조회수: 430, 좋아요: 89 },
];

// 제품 분석 데이터
export const productData: ProductChartData[] = [
    {
        name: "AI 챗봇",
        views: 523,
        likes: 128,
        comments: 45,
    },
    {
        name: "커뮤니티 플랫폼",
        views: 342,
        likes: 89,
        comments: 23,
    },
    {
        name: "포트폴리오 생성기",
        views: 289,
        likes: 67,
        comments: 12,
    },
];

// 팀 분석 데이터
export const teamData: TeamChartData[] = [
    {
        name: "AI 개발팀",
        members: 8,
        projects: 3,
        commits: 234,
    },
    {
        name: "웹 개발팀",
        members: 6,
        projects: 2,
        commits: 189,
    },
    {
        name: "디자인팀",
        members: 4,
        projects: 4,
        commits: 156,
    },
];

// 사용자 활동 분석 데이터
export const userActivityData: UserActivityData[] = [
    {
        date: "2024-03-01",
        commits: 5,
        comments: 3,
        likes: 8,
    },
    {
        date: "2024-03-02",
        commits: 3,
        comments: 4,
        likes: 12,
    },
    {
        date: "2024-03-03",
        commits: 7,
        comments: 2,
        likes: 5,
    },
    {
        date: "2024-03-04",
        commits: 4,
        comments: 6,
        likes: 9,
    },
    {
        date: "2024-03-05",
        commits: 6,
        comments: 3,
        likes: 7,
    },
];

export function getDashboardChartData(): DashboardChartData {
    return {
        activityData: activityChartData
    };
}

export function getProductAnalytics(): ProductAnalytics {
    return {
        data: productData
    };
}

export function getTeamAnalytics(): TeamAnalytics {
    return {
        data: teamData
    };
}

export function getActivityAnalytics(): ActivityAnalytics {
    return {
        data: userActivityData
    };
}