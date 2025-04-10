import type { ActivityChartData, ProductChartData, TeamChartData, UserActivityData } from "./charts";

export interface ProductAnalytics {
    data: ProductChartData[];
}

export interface TeamAnalytics {
    data: TeamChartData[];
}

export interface ActivityAnalytics {
    data: UserActivityData[];
}

export interface DashboardChartData {
    activityData: ActivityChartData[];
}