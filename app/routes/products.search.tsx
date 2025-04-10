import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}