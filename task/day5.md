# Day 5: 커뮤니티 페이지 구현

## 목표

오늘은 YkMake 플랫폼의 커뮤니티 기능을 구현합니다. 게시글 목록 페이지, 게시글 상세 페이지, 댓글 기능 등을 개발하여 사용자들이 서로 소통할 수 있는 공간을 만듭니다.

## 작업 목록

1. 커뮤니티 라우트 구성
2. 게시글 목록 페이지 구현
3. 게시글 상세 페이지 구현
4. 댓글 컴포넌트 구현
5. 게시글 작성 페이지 구현

## 1. 커뮤니티 라우트 구성

커뮤니티 관련 라우트를 구성하여 사용자가 게시글을 찾아보기 쉽게 합니다.

### 커뮤니티 라우트 구조

커뮤니티 페이지의 라우트 구조는 다음과 같습니다:

- `/community` - 커뮤니티 메인 페이지
- `/community/categories/:category` - 카테고리별 게시글 목록
- `/community/search` - 게시글 검색 페이지
- `/community/new` - 게시글 작성 페이지
- `/community/:slug` - 게시글 상세 페이지

### 커뮤니티 라우트 파일 생성 (Flat 라우팅 방식)

Remix의 플랫 라우팅 방식을 사용하여 커뮤니티 관련 라우트 파일들을 생성합니다:

```bash
touch app/routes/community.tsx
touch app/routes/community._index.tsx
touch app/routes/community.categories.tsx
touch app/routes/community.categories._index.tsx
touch app/routes/community.categories.\$category.tsx
touch app/routes/community.search.tsx
touch app/routes/community.new.tsx
touch app/routes/community.\$slug.tsx
```

> **중요**: Remix의 플랫 라우팅 방식에서는 정적 라우트(예: `community.new.tsx`)가 동적 라우트(예: `community.$slug.tsx`)보다 우선순위가 높습니다. 이를 통해 `/community/new`와 같은 경로가 동적 라우트인 `/community/:slug`에 의해 가로채이는 것을 방지할 수 있습니다.

### shadcn 컴포넌트 추가

필요한 UI 컴포넌트를 설치합니다:

```bash
npx shadcn@latest add separator
npx shadcn@latest add label
npx shadcn@latest add textarea
```

## 2. 임시 데이터 생성

실제 데이터베이스 연동 전이므로, 임시 게시글 데이터를 사용하여 UI를 구현합니다.

### 타입 시스템 설정

먼저 게시글과 댓글 타입을 정의합니다:

```typescript
// app/lib/types/post.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorImageUrl?: string;
  publishedAt: string;
  likes: number;
  comments: number;
  tags: string[];
  slug: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorImageUrl?: string;
  content: string;
  publishedAt: string;
  likes: number;
  isReplyTo?: string;
}
```

### 임시 데이터 생성

`app/lib/data/mock-posts.ts` 파일을 생성하여 임시 게시글 데이터를 추가합니다:

```typescript
import { Post, Comment } from '~/lib/types/post';

export const mockPosts: Post[] = [
    {
        id: "1",
        title: "React 18에서 달라진 점과 마이그레이션 가이드",
        content: "React 18이 정식 출시되었습니다. 이번 업데이트에서는 동시성 기능이 도입되어 사용자 경험을 크게 향상시킬 수 있게 되었습니다. 주요 변경사항으로는 자동 배치 처리, Suspense 개선, 새로운 API들이 있습니다.",
        authorName: "이리액트",
        publishedAt: "2023-09-21",
        likes: 78,
        comments: 15,
        tags: ["React", "프론트엔드", "웹개발"],
        slug: "react-18-migration-guide",
        isPinned: true,
    },
    {
        id: "2",
        title: "TypeScript 5.0의 새로운 기능들",
        content: "TypeScript 5.0이 출시되었습니다. 이번 버전에서는 성능 개선, 새로운 타입 시스템 기능, 그리고 개발자 경험 향상이 이루어졌습니다. 특히 const 타입 파라미터와 데코레이터 메타데이터 API가 추가되었습니다.",
        authorName: "김타입",
        publishedAt: "2023-08-15",
        likes: 65,
        comments: 12,
        tags: ["TypeScript", "프론트엔드", "개발도구"],
        slug: "typescript-5-features",
        isPinned: true,
    },
    {
        id: "3",
        title: "Next.js 13 App Router 완벽 가이드",
        content: "Next.js 13의 App Router는 React Server Components를 기반으로 한 새로운 라우팅 시스템을 도입했습니다. 이 가이드에서는 App Router의 핵심 개념과 실제 사용 사례를 다룹니다.",
        authorName: "박넥스트",
        publishedAt: "2023-07-30",
        likes: 92,
        comments: 28,
        tags: ["Next.js", "React", "프론트엔드"],
        slug: "nextjs-13-app-router-guide",
    },
    {
        id: "4",
        title: "Docker 컨테이너 보안 모범 사례",
        content: "Docker 컨테이너의 보안을 강화하기 위한 모범 사례를 소개합니다. 멀티 스테이지 빌드, 보안 스캔, 시크릿 관리 등 다양한 보안 기법을 다룹니다.",
        authorName: "최도커",
        publishedAt: "2023-06-25",
        likes: 45,
        comments: 8,
        tags: ["Docker", "DevOps", "보안"],
        slug: "docker-security-best-practices",
    },
    {
        id: "5",
        title: "GraphQL vs REST API: 어떤 것을 선택해야 할까?",
        content: "GraphQL과 REST API의 장단점을 비교 분석하고, 각각의 사용 사례에 대해 알아보겠습니다. 실제 프로젝트에서의 선택 기준과 고려사항을 다룹니다.",
        authorName: "정API",
        publishedAt: "2023-05-20",
        likes: 88,
        comments: 24,
        tags: ["GraphQL", "REST", "API", "백엔드"],
        slug: "graphql-vs-rest-api",
    },
    {
        id: "6",
        title: "AWS Lambda 함수 최적화 가이드",
        content: "AWS Lambda 함수의 성능을 최적화하는 방법을 알아봅니다. 메모리 설정, 코드 최적화, 콜드 스타트 감소 등 다양한 최적화 기법을 소개합니다.",
        authorName: "이AWS",
        publishedAt: "2023-04-15",
        likes: 76,
        comments: 18,
        tags: ["AWS", "Lambda", "서버리스", "클라우드"],
        slug: "aws-lambda-optimization-guide",
    },
    {
        id: "7",
        title: "GitHub Actions로 CI/CD 파이프라인 구축하기",
        content: "GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 구축하는 방법을 알아봅니다. 테스트, 빌드, 배포 과정을 자동화하는 워크플로우를 작성합니다.",
        authorName: "김깃허브",
        publishedAt: "2023-03-10",
        likes: 82,
        comments: 22,
        tags: ["GitHub", "CI/CD", "DevOps", "자동화"],
        slug: "github-actions-cicd-guide",
    },
    {
        id: "8",
        title: "MongoDB Atlas와 Mongoose 사용 가이드",
        content: "MongoDB Atlas 클라우드 서비스를 사용하여 데이터베이스를 구축하고, Mongoose를 통해 Node.js 애플리케이션과 연동하는 방법을 알아봅니다.",
        authorName: "박몽고",
        publishedAt: "2023-02-05",
        likes: 58,
        comments: 14,
        tags: ["MongoDB", "Node.js", "데이터베이스", "백엔드"],
        slug: "mongodb-atlas-mongoose-guide",
    }
];

export const mockComments: Comment[] = [
    {
        id: "1",
        postId: "1",
        authorName: "김개발자",
        content: "React 18의 동시성 기능 정말 유용하네요! 특히 자동 배치 처리가 개발 생산성을 크게 높여줄 것 같습니다.",
        publishedAt: "2023-09-21",
        likes: 12,
    },
    {
        id: "2",
        postId: "1",
        authorName: "이프론트",
        content: "Suspense 개선사항이 특히 인상적입니다. 서버 사이드 렌더링에서 더 나은 성능을 기대할 수 있겠네요.",
        publishedAt: "2023-09-22",
        likes: 8,
    },
    {
        id: "3",
        postId: "2",
        authorName: "박타입스크립트",
        content: "const 타입 파라미터 추가가 정말 좋은 기능이네요. 타입 추론이 더 정확해질 것 같습니다.",
        publishedAt: "2023-08-16",
        likes: 15,
    },
    {
        id: "4",
        postId: "3",
        authorName: "최넥스트",
        content: "App Router의 서버 컴포넌트 활용이 정말 강력하네요. 클라이언트 번들 사이즈를 크게 줄일 수 있을 것 같습니다.",
        publishedAt: "2023-07-31",
        likes: 20,
    },
    {
        id: "5",
        postId: "4",
        authorName: "정도커",
        content: "멀티 스테이지 빌드 관련 내용이 특히 유용했습니다. 이미지 크기를 최적화하는데 도움이 될 것 같네요.",
        publishedAt: "2023-06-26",
        likes: 6,
    },
    {
        id: "6",
        postId: "5",
        authorName: "김API",
        content: "GraphQL과 REST의 장단점 비교가 정말 명확하게 설명되어 있네요. 프로젝트 선택 시 참고하기 좋을 것 같습니다.",
        publishedAt: "2023-05-21",
        likes: 18,
    },
    {
        id: "7",
        postId: "6",
        authorName: "이AWS",
        content: "Lambda 콜드 스타트 최적화 팁이 특히 유용했습니다. 실제 프로젝트에 바로 적용해볼 수 있을 것 같네요.",
        publishedAt: "2023-04-16",
        likes: 14,
    },
    {
        id: "8",
        postId: "7",
        authorName: "박깃허브",
        content: "GitHub Actions 워크플로우 예제가 정말 실용적이네요. CI/CD 파이프라인 구축에 바로 활용할 수 있을 것 같습니다.",
        publishedAt: "2023-03-11",
        likes: 16,
    },
    {
        id: "9",
        postId: "8",
        authorName: "최몽고",
        content: "MongoDB Atlas 설정 과정이 잘 설명되어 있네요. 특히 보안 설정 부분이 유용했습니다.",
        publishedAt: "2023-02-06",
        likes: 9,
    }
];

// 카테고리별 게시글 필터링 함수
export function getPostsByCategory(category: string): Post[] {
  return mockPosts.filter(post => 
    post.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
  );
}

// 인기 게시글 가져오기 (좋아요 기준)
export function getPopularPosts(limit: number = 3): Post[] {
  return [...mockPosts].sort((a, b) => b.likes - a.likes).slice(0, limit);
}

// 최신 게시글 가져오기 (작성일 기준)
export function getLatestPosts(limit: number = 8): Post[] {
  return [...mockPosts].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, limit);
}

// 게시글 검색 함수
export function searchPosts(query: string): Post[] {
  const searchTerms = query.toLowerCase().split(' ');
  return mockPosts.filter(post => {
    const searchText = `${post.title} ${post.content} ${post.tags.join(' ')} ${post.authorName}`.toLowerCase();
    return searchTerms.every(term => searchText.includes(term));
  });
}

// 게시글 상세 정보 가져오기
export function getPostBySlug(slug: string): Post | undefined {
  return mockPosts.find(post => post.slug === slug);
}

// 게시글에 대한 댓글 가져오기
export function getCommentsByPostId(postId: string): Comment[] {
  return mockComments.filter(comment => comment.postId === postId);
}

// 모든 태그 가져오기
export function getAllTags(): string[] {
  const tagsSet = new Set<string>();
  mockPosts.forEach(post => post.tags.forEach(tag => tagsSet.add(tag)));
  return Array.from(tagsSet);
}
```

## 3. 커뮤니티 페이지 구현

### 커뮤니티 레이아웃 (community.tsx)

커뮤니티 페이지의 레이아웃 컴포넌트를 생성합니다:

```typescript
import { Outlet } from "@remix-run/react";

export default function CommunityLayout() {
  return <Outlet />;
}
```

### 커뮤니티 메인 페이지 (community._index.tsx)

```typescript
import { useLoaderData, Link } from "@remix-run/react";
import { getLatestPosts, getPopularPosts, getAllTags } from "~/lib/data/mock-posts";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { PostCard } from "~/components/cards/post-card";
import { Badge } from "~/components/ui/badge";

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
              {latestPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </div>
          
          <aside className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">인기 게시글</h3>
              <div className="space-y-4">
                {popularPosts.map((post) => (
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
                {allTags.map((tag) => (
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
```

### 게시글 상세 페이지 (community.$slug.tsx)

```typescript
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
import { Post, Comment } from "~/lib/types/post";

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
```

### 게시글 작성 페이지 (community.new.tsx)

```typescript
import { Form, Link } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

export default function NewPostPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <>
      <PageHeader
        title="게시글 작성"
        description="커뮤니티에 새로운 게시글을 작성해보세요."
      >
        <Button variant="outline" asChild>
          <Link to="/community">목록으로 돌아가기</Link>
        </Button>
      </PageHeader>

      <Section>
        <Form className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                placeholder="게시글 제목을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="게시글 내용을 입력하세요"
                rows={12}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">태그</Label>
              <div className="flex gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} className="inline-flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
                <Button type="button" onClick={handleAddTag}>추가</Button>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link to="/community">취소</Link>
              </Button>
              <Button type="submit">게시하기</Button>
            </div>
          </div>
        </Form>
      </Section>
    </>
  );
}
```

### 커뮤니티 카테고리 레이아웃 (community.categories.tsx)

카테고리 페이지의 레이아웃 컴포넌트를 생성합니다:

```typescript
import { Outlet } from "@remix-run/react";

export default function CommunityCategoriesLayout() {
  return <Outlet />;
}
```

### 커뮤니티 카테고리 메인 페이지 (community.categories._index.tsx)

카테고리 메인 페이지를 구현합니다:

```typescript
import { useLoaderData, Link } from "@remix-run/react";
import { getAllTags } from "~/lib/data/mock-posts";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export async function loader() {
  const allTags = getAllTags();
  
  return Response.json({
    allTags,
  });
}

export default function CategoriesIndexPage() {
  const { allTags } = useLoaderData<typeof loader>();
  
  return (
    <>
      <PageHeader
        title="카테고리 목록"
        description="다양한 카테고리의 게시글을 둘러보세요."
      >
        <Button variant="outline" size="sm" asChild>
          <Link to="/community" className="inline-flex items-center">
            <ArrowLeft size={16} className="mr-1" />
            커뮤니티로 돌아가기
          </Link>
        </Button>
      </PageHeader>
      
      <Section>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allTags.map((tag) => (
            <Link
              key={tag}
              to={`/community/categories/${tag}`}
              className="bg-background hover:bg-muted transition-colors rounded-lg border p-6 text-center"
            >
              <Badge variant="secondary" className="mb-2 px-3 py-1">{tag}</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {tag} 관련 게시글을 확인하세요
              </p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
```

### 커뮤니티 검색 페이지 (community.search.tsx)

검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams, Form } from "@remix-run/react";
import { searchPosts } from "~/lib/data/mock-posts";
import type { Post } from "~/lib/types/post";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { PostCard } from "~/components/cards/post-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const posts = query ? searchPosts(query) : [];

    return Response.json({
        query,
        posts,
    });
}

export default function SearchPage() {
    const { query, posts } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="게시글 검색"
                description="원하는 게시글을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/community" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 게시글
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
                                placeholder="제목, 내용, 태그 등으로 검색"
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
                            "{query}" 검색 결과 <span className="text-muted-foreground">({posts.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {posts.map((post: Post) => (
                            <PostCard key={post.id} {...post} />
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
                            제목, 내용, 태그 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

## 다음 단계

이제 커뮤니티 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 사용자 인증 및 권한 관리를 추가하여 로그인한 사용자만 글을 작성하고 댓글을 달 수 있도록 할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:
- http://localhost:3000/community - 커뮤니티 메인 페이지
- http://localhost:3000/community/new - 게시글 작성 페이지
- http://localhost:3000/community/react-18-migration-guide - 게시글 상세 페이지
- http://localhost:3000/community/categories - 카테고리 목록 페이지
- http://localhost:3000/community/categories/React - 카테고리별 게시글 목록
- http://localhost:3000/community/search?q=React - 게시글 검색 페이지