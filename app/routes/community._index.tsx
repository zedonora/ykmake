import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { db } from "~/lib/drizzle.server";
import { communityPosts, profiles } from "~/db/schema";
import type { CommunityPost, Profile } from "~/db/schema";
import { desc, eq, SQL } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Card, CardContent
} from "~/components/ui/card";
import {
  Avatar, AvatarFallback, AvatarImage
} from "~/components/ui/avatar";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { formatDistanceToNowStrict } from 'date-fns';

export const meta: MetaFunction = () => {
  return [
    { title: "Community | YkMake" },
    { name: "description", content: "Ask questions, share ideas, and connect with other developers" },
  ];
};

type PostWithAuthor = {
  post: Pick<CommunityPost, 'id' | 'title' | 'createdAt'> & { category?: string | null, upvotes?: number | null };
  author: Pick<Profile, 'username' | 'avatarUrl'> | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const sortBy = url.searchParams.get("sort") || "newest";
  const timeRange = url.searchParams.get("timeRange") || "all";

  try {
    let orderByCondition: SQL | SQL[] = desc(communityPosts.createdAt);

    if (sortBy === "popular") {
      orderByCondition = desc(communityPosts.createdAt);
    }

    const postsData = await db
      .select({
        post: {
          id: communityPosts.id,
          title: communityPosts.title,
          createdAt: communityPosts.createdAt,
        },
        author: {
          username: profiles.username,
          avatarUrl: profiles.avatarUrl,
        }
      })
      .from(communityPosts)
      .leftJoin(profiles, eq(communityPosts.userId, profiles.id))
      .orderBy(orderByCondition);

    return Response.json({ posts: postsData as PostWithAuthor[], sortBy, timeRange });

  } catch (error) {
    console.error("Error fetching community posts:", error);
    throw new Response("게시글을 불러오는 중 오류가 발생했습니다.", { status: 500 });
  }
};

export default function CommunityIndexPage() {
  const { posts, sortBy, timeRange } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (newSort: string) => {
    setSearchParams(prev => {
      prev.set("sort", newSort);
      if (newSort !== 'popular') {
        prev.delete('timeRange');
      } else if (!prev.has('timeRange')) {
        prev.set('timeRange', 'all');
      }
      return prev;
    }, { preventScrollReset: true });
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setSearchParams(prev => {
      prev.set("timeRange", newTimeRange);
      return prev;
    }, { preventScrollReset: true });
  };

  const topics = ["Development", "Design", "Marketing", "Startups", "AI"];
  const timeRangeOptions = { all: "All", today: "Today", week: "Week", month: "Month", year: "Year" };

  return (
    <div className="px-4 py-12 md:px-8 lg:px-16">
      <div className="text-center mb-12 md:mb-16 flex flex-col py-20 justify-center items-center rounded-md bg-gradient-to-t from-background to-primary/20">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Community</h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Ask questions, share ideas, and connect with other developers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-10 md:gap-16 lg:gap-20 items-start">
        <div className="md:col-span-4 space-y-10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium">
                    {sortBy === 'popular' ? 'Popular' : 'Newest'}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onSelect={() => handleSortChange('newest')}>Newest</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleSortChange('popular')}>Popular</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {sortBy === 'popular' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-medium">
                      {timeRangeOptions[timeRange as keyof typeof timeRangeOptions] ?? 'All'}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Object.entries(timeRangeOptions).map(([key, value]) => (
                      <DropdownMenuItem key={key} onSelect={() => handleTimeRangeChange(key)}>
                        {value}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <Button asChild className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white px-4 py-2">
              <Link to="/community/new">Create Discussion</Link>
            </Button>
          </div>

          <div className="w-full md:w-2/3">
            <Input type="search" placeholder="Search for discussions" className="bg-card border-border md:text-sm" />
          </div>

          <main className="space-y-5">
            {posts?.length > 0 ? (
              posts.map(({ post, author }: PostWithAuthor) => (
                <Card key={post.id} className="overflow-hidden bg-transparent border rounded-xl shadow-none hover:bg-card/50 transition-colors">
                  <CardContent className="p-4 md:p-6 flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 md:h-14 md:w-14 border">
                        <AvatarImage src={author?.avatarUrl ?? undefined} alt={author?.username ?? "User avatar"} />
                        <AvatarFallback>{author?.username?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1.5">
                        <Link to={`/community/${post.id}`} className="hover:underline">
                          <h2 className="text-lg md:text-xl font-semibold leading-tight text-card-foreground">{post.title}</h2>
                        </Link>
                        <p className="text-sm leading-tight text-muted-foreground">
                          {author?.username ?? '익명'}
                          {post.category && ` on ${post.category}`}
                          <span className="mx-1">•</span>
                          {post.createdAt && `${formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}`}
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center">
                      <Button variant="outline" size="sm" className="flex flex-col h-14 w-14 items-center justify-center gap-0.5 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{post.upvotes ?? 0}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">아직 게시글이 없습니다.</p>
            )}
          </main>
        </div>

        <aside className="md:col-span-2 space-y-5">
          <div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Topics</span>
            <ul className="flex flex-col gap-2 items-start mt-4">
              {topics.map(topic => (
                <li key={topic}>
                  <Link to={`/community?topic=${topic.toLowerCase()}`} className="text-sm text-primary hover:underline pl-0">
                    {topic}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
} 