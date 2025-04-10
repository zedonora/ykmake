import type { User, AdminStats, GrowthData } from "~/lib/types/admin";

export const users: User[] = [
    {
        id: 1,
        name: "홍길동",
        email: "hong@example.com",
        role: "관리자",
        status: "활성",
        joinedAt: "2024-01-15",
    },
    {
        id: 2,
        name: "김영희",
        email: "kim@example.com",
        role: "사용자",
        status: "활성",
        joinedAt: "2024-02-01",
    },
    {
        id: 3,
        name: "이철수",
        email: "lee@example.com",
        role: "사용자",
        status: "비활성",
        joinedAt: "2024-02-15",
    },
];

export const adminStats: AdminStats = {
    totalUsers: 390,
    totalProducts: 52,
    totalTeams: 30,
    growthRate: {
        users: 20.5,
        products: 8.3,
        teams: 20,
    },
};

export const growthData: GrowthData[] = [
    { name: "1월", 사용자: 120, 제품: 24, 팀: 12 },
    { name: "2월", 사용자: 150, 제품: 28, 팀: 15 },
    { name: "3월", 사용자: 180, 제품: 35, 팀: 18 },
    { name: "4월", 사용자: 250, 제품: 42, 팀: 22 },
    { name: "5월", 사용자: 310, 제품: 48, 팀: 25 },
    { name: "6월", 사용자: 390, 제품: 52, 팀: 30 },
];

export function getUsers(): User[] {
    return users;
}

export function getAdminStats(): AdminStats {
    return adminStats;
}

export function getGrowthData(): GrowthData[] {
    return growthData;
}