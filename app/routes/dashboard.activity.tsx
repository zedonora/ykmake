import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { getActivityAnalytics } from "~/lib/data/mock-analytics";
import type { UserActivityData } from "~/lib/types/charts";

export const meta: MetaFunction = () => {
    return [
        { title: "활동 분석 - YkMake" },
        { name: "description", content: "YkMake에서의 활동을 분석하세요" },
    ];
};

export async function loader() {
    const { data } = getActivityAnalytics();
    return { data };
}

export default function ActivityAnalytics() {
    const { data } = useLoaderData<typeof loader>();

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">활동 분석</h1>

            <div className="grid gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">일별 활동</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="commits"
                                    stackId="1"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="comments"
                                    stackId="1"
                                    stroke="#82ca9d"
                                    fill="#82ca9d"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="likes"
                                    stackId="1"
                                    stroke="#ffc658"
                                    fill="#ffc658"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">최근 활동 내역</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>날짜</TableHead>
                                <TableHead className="text-right">커밋</TableHead>
                                <TableHead className="text-right">댓글</TableHead>
                                <TableHead className="text-right">좋아요</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((activity: UserActivityData) => (
                                <TableRow key={activity.date}>
                                    <TableCell className="font-medium">{activity.date}</TableCell>
                                    <TableCell className="text-right">{activity.commits}</TableCell>
                                    <TableCell className="text-right">{activity.comments}</TableCell>
                                    <TableCell className="text-right">{activity.likes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </>
    );
}
