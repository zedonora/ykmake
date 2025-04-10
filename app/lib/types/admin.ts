export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    joinedAt: string;
}

export interface AdminStats {
    totalUsers: number;
    totalProducts: number;
    totalTeams: number;
    growthRate: {
        users: number;
        products: number;
        teams: number;
    };
}

export interface GrowthData {
    name: string;
    사용자: number;
    제품: number;
    팀: number;
}