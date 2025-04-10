export interface DashboardStats {
    totalProducts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
}

export interface Activity {
    id: string;
    title: string;
    timestamp: string;
}

export interface PopularProduct {
    id: string;
    title: string;
    views: number;
}