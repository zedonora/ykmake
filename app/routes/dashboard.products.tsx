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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { getProductAnalytics } from "~/lib/data/mock-analytics";
import type { ProductChartData } from "~/lib/types/charts";

export const meta: MetaFunction = () => {
    return [
        { title: "제품 분석 - YkMake" },
        { name: "description", content: "YkMake의 제품 성과를 분석하세요" },
    ];
};

export async function loader() {
    const { data } = getProductAnalytics();
    return { data };
}

export default function ProductAnalytics() {
    const { data } = useLoaderData<typeof loader>();

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">제품 분석</h1>

            <div className="grid gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">제품별 성과</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
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
                                <Bar dataKey="views" fill="#8884d8" name="조회수" />
                                <Bar dataKey="likes" fill="#82ca9d" name="좋아요" />
                                <Bar dataKey="comments" fill="#ffc658" name="댓글" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">제품 목록</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>제품명</TableHead>
                                <TableHead className="text-right">조회수</TableHead>
                                <TableHead className="text-right">좋아요</TableHead>
                                <TableHead className="text-right">댓글</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((product: ProductChartData) => (
                                <TableRow key={product.name}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-right">{product.views}</TableCell>
                                    <TableCell className="text-right">{product.likes}</TableCell>
                                    <TableCell className="text-right">{product.comments}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </>
    );
}