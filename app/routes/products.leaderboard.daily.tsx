import { Link, useLoaderData } from "@remix-run/react";
import { mockProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export async function loader() {
    // 실제로는 현재 날짜 기준으로 필터링해야 하지만, 목업 데이터이므로 랜덤하게 선택
    const dailyProducts = [...mockProducts]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)
        .sort((a, b) => b.upvotes - a.upvotes);

    return Response.json({
        dailyProducts,
    });
}

export default function LeaderboardDailyPage() {
    const { dailyProducts } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="일간 리더보드"
                description="오늘 가장 인기 있는 제품들을 확인하세요."
            >
                <div className="flex gap-2">
                    <Button variant="outline" asChild size="sm">
                        <Link to="/products">전체 제품</Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link to="/products/register">제품 등록하기</Link>
                    </Button>
                </div>
            </PageHeader>

            <Section>
                <Tabs defaultValue="daily" className="w-full">
                    <div className="flex justify-between items-center mb-6">
                        <TabsList>
                            <TabsTrigger value="all" asChild>
                                <Link to="/products/leaderboard">전체</Link>
                            </TabsTrigger>
                            <TabsTrigger value="daily">일간</TabsTrigger>
                            <TabsTrigger value="weekly" asChild>
                                <Link to="/products/leaderboard/weekly">주간</Link>
                            </TabsTrigger>
                            <TabsTrigger value="monthly" asChild>
                                <Link to="/products/leaderboard/monthly">월간</Link>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="daily" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dailyProducts.map((product: Product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </Section>
        </>
    );
}