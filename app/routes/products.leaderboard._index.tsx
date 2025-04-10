import { Link, useLoaderData } from "@remix-run/react";
import { mockProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export async function loader() {
    // 업보트 순으로 정렬
    const popularProducts = [...mockProducts].sort((a, b) => b.upvotes - a.upvotes);

    return Response.json({
        popularProducts,
    });
}

export default function LeaderboardIndexPage() {
    const { popularProducts } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="제품 리더보드"
                description="YkMake 커뮤니티에서 인기 있는 제품들을 살펴보세요."
            >
                <div className="flex gap-2">
                    <Button variant="outline" asChild size="sm">
                        <Link to="/products">전체 제품</Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link to="/products/submit">제품 등록하기</Link>
                    </Button>
                </div>
            </PageHeader>

            <Section>
                <Tabs defaultValue="all" className="w-full">
                    <div className="flex justify-between items-center mb-6">
                        <TabsList>
                            <TabsTrigger value="all">전체</TabsTrigger>
                            <TabsTrigger value="daily" asChild>
                                <Link to="/products/leaderboard/daily">일간</Link>
                            </TabsTrigger>
                            <TabsTrigger value="weekly" asChild>
                                <Link to="/products/leaderboard/weekly">주간</Link>
                            </TabsTrigger>
                            <TabsTrigger value="monthly" asChild>
                                <Link to="/products/leaderboard/monthly">월간</Link>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {popularProducts.map((product: Product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </Section>
        </>
    );
}