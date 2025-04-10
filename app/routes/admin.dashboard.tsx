import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { getAdminStats, getGrowthData } from "~/lib/data/mock-admin";

export const meta: MetaFunction = () => {
    return [
        { title: "관리자 대시보드 - YkMake" },
        { name: "description", content: "YkMake 시스템을 관리하세요" },
    ];
};

export async function loader() {
    const stats = getAdminStats();
    const growthData = getGrowthData();
    return { stats, growthData };
}

export default function AdminDashboard() {
    const { stats, growthData } = useLoaderData<typeof loader>();

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">관리자 대시보드</h1>
                <Button variant="outline" asChild>
                    <Link to="/dashboard">사용자 대시보드로 이동</Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6">
                    <h3 className="font-semibold text-muted-foreground">총 사용자</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        전월 대비 +{stats.growthRate.users}%
                    </p>
                </Card>

                <Card className="p-6">
                    <h3 className="font-semibold text-muted-foreground">총 제품</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        전월 대비 +{stats.growthRate.products}%
                    </p>
                </Card>

                <Card className="p-6">
                    <h3 className="font-semibold text-muted-foreground">총 팀</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalTeams}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        전월 대비 +{stats.growthRate.teams}%
                    </p>
                </Card>
            </div>

            <div className="grid gap-6 mt-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">성장 추이</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={growthData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="사용자"
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="제품"
                                    stroke="#82ca9d"
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="팀"
                                    stroke="#ffc658"
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}