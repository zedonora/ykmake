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
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { getTeamAnalytics } from "~/lib/data/mock-analytics";
import type { TeamChartData } from "~/lib/types/charts";

export const meta: MetaFunction = () => {
    return [
        { title: "팀 분석 - YkMake" },
        { name: "description", content: "YkMake의 팀 활동을 분석하세요" },
    ];
};

export async function loader() {
    const { data } = getTeamAnalytics();
    return { data };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function TeamAnalytics() {
    const { data } = useLoaderData<typeof loader>();

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">팀 분석</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">팀별 구성원 비율</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="members"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">팀 목록</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>팀명</TableHead>
                                <TableHead className="text-right">구성원</TableHead>
                                <TableHead className="text-right">프로젝트</TableHead>
                                <TableHead className="text-right">커밋</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((team: TeamChartData) => (
                                <TableRow key={team.name}>
                                    <TableCell className="font-medium">{team.name}</TableCell>
                                    <TableCell className="text-right">{team.members}</TableCell>
                                    <TableCell className="text-right">{team.projects}</TableCell>
                                    <TableCell className="text-right">{team.commits}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </>
    );
}