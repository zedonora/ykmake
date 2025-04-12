import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { prisma } from "~/utils/api.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const sort = url.searchParams.get("sort") || "latest";

    // 모든 카테고리 가져오기
    const categoriesResult = await prisma.product.groupBy({
        by: ['category'],
    });
    const allCategories = categoriesResult.map(item => item.category);

    // 주목할 제품 (인기 제품) 가져오기
    const featuredProducts = await prisma.product.findMany({
        take: 3,
        orderBy: { views: 'desc' },
        include: {
            author: {
                select: { name: true },
            },
            _count: {
                select: { likes: true, comments: true },
            },
        },
    });

    // 최신 제품 가져오기
    const latestProducts = await prisma.product.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: { name: true },
            },
            _count: {
                select: { likes: true, comments: true },
            },
        },
    });

    return Response.json({
        featuredProducts,
        latestProducts,
        allCategories,
    });
}

export default function ProductsIndexPage() {
    const { featuredProducts, latestProducts, allCategories } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="제품 탐색"
                description="YkMake 커뮤니티에서 개발자들이 만든 다양한 제품을 발견하세요."
            >
                <div className="flex gap-4">
                    <Button asChild>
                        <Link to="/products/new">제품 등록하기</Link>
                    </Button>
                </div>
            </PageHeader>

            {featuredProducts.length > 0 && (
                <Section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">주목할 제품</h2>
                        <Link to="/products/leaderboard" className="text-sm font-medium text-primary inline-flex items-center">
                            모든 인기 제품 보기 <ArrowRight size={14} className="ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id}
                                id={product.id}
                                title={product.title}
                                description={product.description}
                                category={product.category}
                                views={product.views}
                                author={product.author.name}
                                comments={product._count.comments}
                                likes={product._count.likes}
                                image={product.image || undefined}
                            />
                        ))}
                    </div>
                </Section>
            )}

            <Section className="bg-muted/20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">최신 제품</h2>
                    <Link to="/products/leaderboard/latest" className="text-sm font-medium text-primary inline-flex items-center">
                        더 보기 <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestProducts.map((product) => (
                        <ProductCard key={product.id}
                            id={product.id}
                            title={product.title}
                            description={product.description}
                            category={product.category}
                            views={product.views}
                            author={product.author.name}
                            comments={product._count.comments}
                            likes={product._count.likes}
                            image={product.image || undefined}
                        />
                    ))}
                </div>
            </Section>

            <Section>
                <h2 className="text-2xl font-bold mb-6">카테고리별 탐색</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {allCategories.map((category) => (
                        <Link
                            key={category}
                            to={`/products/categories/${category.toLowerCase()}`}
                            className="bg-background hover:bg-muted transition-colors rounded-lg border p-4 text-center"
                        >
                            <span className="font-medium">{category}</span>
                        </Link>
                    ))}
                </div>
            </Section>
        </>
    );
}