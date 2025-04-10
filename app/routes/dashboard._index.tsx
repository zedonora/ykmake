import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { getDashboardData } from "~/lib/data/mock-dashboard";
import { getDashboardChartData } from "~/lib/data/mock-analytics";
import { ActivityChart } from "~/components/dashboard/activity-chart";
import type { Activity, PopularProduct } from "~/lib/types/dashboard";

export const meta: MetaFunction = () => {
    return [
        { title: "대시보드 - YkMake" },
        { name: "description", content: "YkMake 대시보드에서 활동 현황을 확인하세요" },
    ];
};

export async function loader() {
    const dashboardData = getDashboardData();
    const chartData = getDashboardChartData();
    return { ...dashboardData, ...chartData };
}

export default function Dashboard() {
    const { stats, activities, popularProducts, activityData } = useLoaderData<typeof loader>();

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">대시보드</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                    <h3 className="font-semibold text-muted-foreground">총 제품</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
                    <Link to="/dashboard/products" className="mt-4 text-sm text-primary inline-block">
                        자세히 보기 →
                    </Link>
                </Card>

                <Card className="p-6">
                    <h3 className="font-semibold text-muted-foreground">총 조회수</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalViews.toLocaleString()}</p>
                    <Link to="/dashboard/products" className="mt-4 text-sm text-primary inline-block">
                        자세히 보기 →
                    </Link>
                </Card>

                <Card className="p-6">
                    <h3 className="font-semibold text-muted-foreground">총 좋아요</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalLikes}</p>
                    <Link to="/dashboard/activity" className="mt-4 text-sm text-primary inline-block">
                        자세히 보기 →
                    </Link>
                </Card>

                <Card className="p-6">
                    <h3 className="font-semibold text-muted-foreground">총 댓글</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalComments}</p>
                    <Link to="/dashboard/activity" className="mt-4 text-sm text-primary inline-block">
                        자세히 보기 →
                    </Link>
                </Card>
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">활동 추이</h2>
                    <Link to="/dashboard/activity">
                        <Button variant="outline" size="sm">활동 분석 자세히 보기</Button>
                    </Link>
                </div>
                <ActivityChart data={activityData} />
            </div>

            <div className="grid gap-6 mt-8 md:grid-cols-2">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">최근 활동</h2>
                        <Link to="/dashboard/activity">
                            <Button variant="link" size="sm">자세히 보기</Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {activities.map((activity: Activity) => (
                            <div key={activity.id} className="flex items-center justify-between">
                                <p className="text-sm">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">인기 제품</h2>
                        <Link to="/dashboard/products">
                            <Button variant="link" size="sm">자세히 보기</Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {popularProducts.map((product: PopularProduct) => (
                            <div key={product.id} className="flex items-center justify-between">
                                <p className="text-sm">{product.title}</p>
                                <p className="text-sm text-muted-foreground">조회수 {product.views}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </>
    );
}