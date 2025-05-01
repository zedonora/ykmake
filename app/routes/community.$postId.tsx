import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";
import { db } from "~/lib/drizzle.server";
import { communityPosts, profiles } from "~/db/schema";
import type { CommunityPost, Profile } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { ChevronUp, Cake, Rocket, Trash2 } from "lucide-react";
import { format, formatDistanceToNowStrict } from 'date-fns';
import invariant from "tiny-invariant";
import { createSupabaseServerClient } from "~/lib/supabase.server";

// --- 데이터 타입 정의 --- 
type PostDetail = {
  post: CommunityPost; // 전체 게시글 데이터
  author: Profile | null; // 전체 프로필 데이터 또는 null
};

type Reply = {
  id: number;
  author: Profile | null;
  content: string;
  createdAt: Date;
}

// --- Loader --- 
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.postId, "Missing postId parameter");
  const postId = parseInt(params.postId, 10);
  if (isNaN(postId)) {
    throw new Response("Invalid Post ID", { status: 400 });
  }

  // 현재 사용자 ID 가져오기 (await 추가 및 getUser 사용)
  const { supabase, headers } = await createSupabaseServerClient(request); // await 추가
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 인증 오류 시 null 처리 (또는 로그인 페이지 리디렉션)
  const currentUserId = user?.id; // nullish coalescing

  try {
    const result = await db.select({
      post: communityPosts,
      author: profiles
    })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .leftJoin(profiles, eq(communityPosts.userId, profiles.id))
      .limit(1);

    const postDetail = result[0];

    if (!postDetail) {
      throw new Response("Post not found", { status: 404 });
    }

    // TODO: 댓글 데이터 가져오기
    const replies: Reply[] = [
      { id: 1, author: postDetail.author, content: "Storytelling in marketing is powerful. Your examples were very inspiring.", createdAt: new Date() }
    ]; // 임시 댓글 데이터

    // TODO: 작성자 추가 정보 가져오기
    const authorExtraInfo = {
      joinedDate: postDetail.author?.createdAt, // profiles.createdAt 사용
      launchedProducts: 70 // 임시 데이터
    }

    // currentUserId 포함하여 반환
    return json({ postDetail, replies, authorExtraInfo, currentUserId }, { headers }); // headers 추가

  } catch (error) {
    console.error("Error fetching post detail:", error);
    if (error instanceof Response) throw error; // 404 등 Response 객체는 그대로 던짐
    throw new Response("Error fetching post detail", { status: 500, headers }); // headers 추가
  }
};

// --- Delete Action --- (Moved from .delete.tsx)
export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.postId, "Missing postId parameter");
  const postId = parseInt(params.postId, 10);

  if (isNaN(postId)) {
    return new Response("Invalid Post ID", { status: 400 });
  }

  const { supabase, headers } = await createSupabaseServerClient(request);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // 로그인되지 않았으면 로그인 페이지로 리디렉션
    // 삭제 시도는 보통 로그인 상태에서 하므로, /community로 리디렉션해도 무방
    return redirect("/login?redirectTo=/community");
  }

  // TODO: 추후 다른 action (댓글, 추천 등) 추가 시,
  // 어떤 작업을 수행할지 구분하는 로직 필요 (예: hidden input _action)
  // 현재는 POST 요청이 오면 무조건 삭제로 간주

  try {
    // 삭제 실행 (userId 조건 추가하여 본인 글만 삭제하도록 보장)
    const deleteResult = await db.delete(communityPosts)
      .where(and(eq(communityPosts.id, postId), eq(communityPosts.userId, user.id)))
      .returning({ deletedId: communityPosts.id });

    if (deleteResult.length === 0) {
      // 삭제된 행이 없으면, 해당 게시물이 없거나 사용자가 작성자가 아님
      // 여기서는 그냥 목록으로 리디렉션 (권한 없음 메시지 표시 가능)
      console.warn(`Attempted to delete post ${postId} by user ${user.id}, but post not found or user is not the author.`);
      // throw new Response("Not authorized or post not found", { status: 403, headers });
      return redirect("/community", { headers });
    }

    // 삭제 성공 시 커뮤니티 목록으로 리디렉션
    return redirect("/community", { headers });

  } catch (error) {
    console.error("Error deleting post:", error);
    // 오류 발생 시 에러 메시지와 함께 응답 반환 (상세 페이지에 표시 가능)
    // return json({ error: "Failed to delete post." }, { status: 500, headers });
    // 여기서는 간단히 목록으로 리디렉션
    return redirect("/community", { headers }); // 에러 처리 개선 필요
  }
};

// --- Meta Function --- (게시글 제목 포함)
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.postDetail?.post?.title ?? "Community Post";
  return [
    { title: `${title} | YkMake Community` },
    // { name: "description", content: data?.postDetail?.post?.content?.substring(0, 150) }, // 필요시 content 일부 사용
  ];
};

// --- UI Component --- 
export default function CommunityPostDetailPage() {
  const { postDetail, replies, authorExtraInfo, currentUserId } = useLoaderData<typeof loader>();
  const { post, author } = postDetail;

  // 로그인 상태 동적 결정
  const isLoggedIn = !!currentUserId;
  // 현재 사용자가 작성자인지 확인
  const isAuthor = isLoggedIn && currentUserId === post.userId;

  // category와 upvotes 참조 제거 (스키마에 없으므로)
  // const displayCategory = post.category ?? null; 
  // const displayUpvotes = post.upvotes ?? 0;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {/* Breadcrumbs - Category 부분 제거 (임시) */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/community" className="hover:text-foreground">Community</Link>
        {/* {displayCategory && (
          <>
            <span className="mx-2">›</span>
            <Link to={`/community?topic=${displayCategory.toLowerCase()}`} className="hover:text-foreground">{displayCategory}</Link>
          </>
        )} */}
        <span className="mx-2">›</span>
        <span className="text-foreground">{post.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
        {/* Left Content Area */}
        <div className="md:col-span-3 space-y-8">
          {/* Post Header & Content */}
          <div className="flex gap-4 items-start">
            {/* Upvote Button - 임시로 0 표시 */}
            <div className="hidden md:block">
              <Button variant="outline" size="sm" className="flex flex-col h-14 w-14 items-center justify-center gap-0.5 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">0</span> {/* 임시 0 */}
              </Button>
            </div>
            {/* Title, Meta, Content */}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight text-foreground">{post.title}</h1>
                {isAuthor && (
                  <Form method="post" onSubmit={(e) => !confirm("Are you sure you want to delete this post?") && e.preventDefault()}>
                    <input type="hidden" name="_action" value="deletePost" />
                    <Button variant="ghost" size="icon" type="submit" aria-label="Delete post">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </Form>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Posted by {author?.username ?? '익명'}
                {post.createdAt && ` • ${formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}`}
                <span className="mx-1">•</span>
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </p>
              <div className="prose prose-invert max-w-none">
                {/* TODO: Markdown 렌더링 필요시 라이브러리 사용 */}
                {/* dangerouslySetInnerHTML은 XSS 위험 있으니 주의 */}
                <p>{post.content}</p>
              </div>
            </div>
          </div>

          {/* Reply Input */}
          <div className="flex items-start gap-4 pt-8 border-t border-border">
            {/* 현재 사용자 아바타 (로그인 시) */}
            {isLoggedIn ? (
              <Avatar className="h-10 w-10 border">
                {/* <AvatarImage src={currentUser?.avatarUrl} /> */}
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted border"></div>
            )}
            <div className="flex-1 space-y-2">
              <Textarea placeholder="Write a reply" rows={3} disabled={!isLoggedIn} className="bg-card border-input" />
              <div className="flex justify-end">
                {isLoggedIn ? (
                  <Button size="sm">Reply</Button>
                ) : (
                  <Button variant="secondary" size="sm" asChild>
                    <Link to="/login?redirectTo=/community/${post.id}">Login to reply</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Replies List */}
          <div className="space-y-6 pt-8 border-t border-border">
            <h2 className="text-lg font-semibold">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h2>
            {replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={reply.author?.avatarUrl ?? undefined} />
                  <AvatarFallback>{reply.author?.username?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{reply.author?.username ?? '익명'}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDistanceToNowStrict(reply.createdAt, { addSuffix: true })}
                    </span>
                  </p>
                  <p className="text-sm text-foreground/90">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="md:col-span-1 space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={author?.avatarUrl ?? undefined} />
                  <AvatarFallback>{author?.username?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-card-foreground">{author?.username ?? 'Unknown User'}</p>
                  {/* TODO: 실제 Badge 정보 */}
                  <Badge variant="secondary">Developer</Badge>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                {authorExtraInfo.joinedDate && (
                  <div className="flex items-center gap-1.5">
                    <Cake className="w-4 h-4" />
                    <span>Joined {format(new Date(authorExtraInfo.joinedDate), 'PP')}</span>
                  </div>
                )}
                {/* TODO: 실제 론칭 제품 수 */}
                <div className="flex items-center gap-1.5">
                  <Rocket className="w-4 h-4" />
                  <span>Launched {authorExtraInfo.launchedProducts} products</span>
                </div>
              </div>
              {/* TODO: 팔로우 로직 */}
              {!isAuthor && (
                isLoggedIn ? (
                  <Button variant="outline" className="w-full">Follow</Button>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login?redirectTo=/community/${post.id}">Log in to follow</Link>
                  </Button>
                )
              )}
              {isLoggedIn ? (
                <Button variant="outline" className="w-full">Follow</Button>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">Log in to follow</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}