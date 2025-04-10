import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";
import { getPostBySlug, getCommentsByPostId, getPopularPosts } from "~/lib/data/mock-posts";
import { Section } from "~/components/layouts/section";
import { PostCard } from "~/components/cards/post-card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import type { Post, Comment } from "~/lib/types/post";

// 댓글 컴포넌트
interface CommentProps {
    id: string;
    authorName: string;
    authorImageUrl?: string;
    content: string;
    publishedAt: string;
    likes: number;
}

function Comment({ id, authorName, authorImageUrl, content, publishedAt, likes }: CommentProps) {
    const initials = authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <div className="p-4 rounded-lg border mb-4">
            <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={authorImageUrl} alt={authorName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <span className="font-medium">{authorName}</span>
                            <span className="text-xs text-muted-foreground ml-2">{publishedAt}</span>
                        </div>
                    </div>
                    <p className="text-sm mb-3">{content}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ThumbsUp size={14} className="mr-1" />
                            <span className="text-xs">{likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                            답글
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const post = getPostBySlug(slug);

    if (!post) {
        throw new Response("Not Found", { status: 404 });
    }

    const comments = getCommentsByPostId(post.id);
    const relatedPosts = getPopularPosts(3);

    return Response.json({
        post,
        comments,
        relatedPosts,
    });
}

export default function PostDetailPage() {
    const { post, comments, relatedPosts } = useLoaderData<typeof loader>();

    const initials = post.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/community" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            커뮤니티로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {post.tags.map((tag: string) => (
                                    <Link key={tag} to={`/community/categories/${tag.toLowerCase()}`}>
                                        <Badge variant="secondary">{tag}</Badge>
                                    </Link>
                                ))}
                            </div>
                            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

                            <div className="flex items-center space-x-4 mb-6">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={post.authorImageUrl} alt={post.authorName} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{post.authorName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {post.publishedAt}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            {post.content.split('\n\n').map((paragraph: string, i: number) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                좋아요 ({post.likes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        <Separator className="my-8" />

                        {/* 댓글 섹션 */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-4">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={20} />
                                    댓글 ({comments.length})
                                </div>
                            </h2>

                            <div className="mb-6">
                                <textarea
                                    className="w-full p-3 border rounded-lg mb-2"
                                    placeholder="댓글을 작성하세요..."
                                    rows={3}
                                />
                                <Button className="float-right">댓글 작성</Button>
                                <div className="clear-both"></div>
                            </div>

                            {comments.length > 0 ? (
                                <div className="space-y-4">
                                    {comments.map((comment: Comment) => (
                                        <Comment key={comment.id} {...comment} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted/20 rounded-lg">
                                    <MessageSquare size={24} className="mx-auto mb-2 text-muted-foreground" />
                                    댓글이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 관련 게시글 */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xl font-bold mb-4">관련 게시글</h2>
                        <div className="space-y-4">
                            {relatedPosts.map((post: Post) => (
                                <PostCard key={post.id} {...post} />
                            ))}
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}