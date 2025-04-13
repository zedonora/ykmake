import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import ClientOnly from "~/components/ui/client-only";
import { ActionButtonWrapper } from "~/components/ui/button-layout";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthor, setIsAuthor] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const loggedIn = localStorage.getItem("isLoggedIn") === "true";
            setIsLoggedIn(loggedIn);

            // 실제 환경에서는 현재 로그인한 사용자 ID와 제품 작성자 ID를 비교해야 함
            // 여기서는 예시로 50%의 확률로 작성자로 설정
            setIsAuthor(loggedIn && Math.random() > 0.5);
        }
    }, []);

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>

                            <ClientOnly>
                                {isLoggedIn && isAuthor && (
                                    <ActionButtonWrapper>
                                        <Button variant="outline" className="inline-flex items-center">
                                            <Edit size={16} className="mr-2" />
                                            수정하기
                                        </Button>
                                    </ActionButtonWrapper>
                                )}
                            </ClientOnly>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <ClientOnly fallback={
                                <div className="bg-muted/40 p-4 rounded text-center">
                                    <p className="text-muted-foreground">로딩 중...</p>
                                </div>
                            }>
                                {isLoggedIn ? (
                                    <div>
                                        <p className="text-muted-foreground">댓글을 작성해보세요.</p>
                                        {/* 댓글 작성 폼은 구현되지 않음 */}
                                    </div>
                                ) : (
                                    <div className="bg-muted/40 p-4 rounded text-center">
                                        <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                        <div className="mt-2">
                                            <Button asChild size="sm">
                                                <Link to="/auth/login">로그인하기</Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </ClientOnly>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <ClientOnly>
                                    {!isLoggedIn ? (
                                        <Button asChild className="w-full">
                                            <Link to="/auth/register">무료로 가입하기</Link>
                                        </Button>
                                    ) : (
                                        <Button asChild className="w-full">
                                            <Link to="/products/register">제품 등록하기</Link>
                                        </Button>
                                    )}
                                </ClientOnly>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
