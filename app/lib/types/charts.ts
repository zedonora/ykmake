export interface ActivityChartData {
    name: string;
    제품: number;
    조회수: number;
    좋아요: number;
}

export interface ProductChartData {
    name: string;
    views: number;
    likes: number;
    comments: number;
}

export interface TeamChartData {
    name: string;
    members: number;
    projects: number;
    commits: number;
}

export interface UserActivityData {
    date: string;
    commits: number;
    comments: number;
    likes: number;
}