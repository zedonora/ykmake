import { useLoaderData, Link } from "@remix-run/react";
import { getLatestPosts, getPopularPosts, getAllTags } from "~/lib/data/mock-posts";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { PostCard } from "~/components/cards/post-card";
import { Badge } from "~/components/ui/badge";
import { Post } from "~/lib/types/post";

export async function loader() {
    const latestPosts = getLatestPosts(8);
    const popularPosts = getPopularPosts(3);
    const allTags = getAllTags();

    return Response.json({
        latestPosts,
        popularPosts,
        allTags,
    });
}

export default function CommunityIndexPage() {
    const { latestPosts, popularPosts, allTags } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="커뮤니티"
                description="개발자들과 다양한 주제에 대해 토론하고 정보를 공유해보세요."
            >
                <Button asChild>
                    <Link to="/community/new">게시글 작성</Link>
                </Button>
            </PageHeader>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-bold mb-6">최신 게시글</h2>
                        <div className="space-y-6">
                            {latestPosts.map((post: Post) => (
                                <PostCard key={post.id} {...post} />
                            ))}
                        </div>
                    </div>

                    <aside className="space-y-8">
                        <div>
                            <h3 className="text-lg font-medium mb-4">인기 게시글</h3>
                            <div className="space-y-4">
                                {popularPosts.map((post: Post) => (
                                    <div key={post.id} className="border rounded-lg p-4">
                                        <Link to={`/community/${post.slug}`} className="font-medium hover:text-primary">
                                            {post.title}
                                        </Link>
                                        <div className="flex items-center text-sm text-muted-foreground mt-2">
                                            <span className="mr-4">좋아요 {post.likes}</span>
                                            <span>댓글 {post.comments}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-4">인기 태그</h3>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((tag: string) => (
                                    <Link key={tag} to={`/community/categories/${tag}`}>
                                        <Badge variant="secondary">{tag}</Badge>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </Section>
        </>
    );
}