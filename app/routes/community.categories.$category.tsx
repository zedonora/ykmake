import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { PostCard } from "~/components/cards/post-card";
import { getPostsByCategory } from "~/lib/data/mock-posts";
import type { Post } from "~/lib/types/post";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { category } = params;

    if (!category) {
        throw new Response("Not Found", { status: 404 });
    }

    const posts = getPostsByCategory(category);

    return Response.json({
        category,
        posts,
    });
}

export default function CategoryPage() {
    const { category, posts } = useLoaderData<typeof loader>();

    return (
        <RootLayout>
            <PageHeader
                title={`${category} 관련 게시글`}
                description={`${category} 카테고리의 게시글 목록입니다.`}
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/community" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 게시글
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <div className="grid grid-cols-1 gap-6">
                    {posts.map((post: Post) => (
                        <PostCard key={post.id} {...post} />
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">게시글이 없습니다</h3>
                        <p className="text-muted-foreground">
                            아직 {category} 카테고리에 게시된 글이 없습니다.
                        </p>
                    </div>
                )}
            </Section>
        </RootLayout>
    );
}