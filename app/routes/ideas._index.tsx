import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/lib/drizzle.server";
import { ideasGpt, profiles } from "~/db/schema";
import type { IdeaGpt, Profile } from "~/db/schema";
import { desc, eq } from "drizzle-orm";
// Shadcn UI 컴포넌트 import (아래 UI에서 사용)
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "아이디어 목록 | YkMake" },
    { name: "description", content: "YkMake IdeasGPT 아이디어 목록" },
  ];
};

// loader 반환 타입
type LoaderData = {
  ideas: Array<{
    idea: Pick<IdeaGpt, 'id' | 'title' | 'description' | 'category' | 'createdAt'>;
    author: Pick<Profile, 'username'> | null;
  }>;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const ideasWithAuthors = await db.select({
      idea: {
        id: ideasGpt.id,
        title: ideasGpt.title,
        description: ideasGpt.description,
        category: ideasGpt.category,
        createdAt: ideasGpt.createdAt,
      },
      author: {
        username: profiles.username
      }
    })
      .from(ideasGpt)
      .leftJoin(profiles, eq(ideasGpt.userId, profiles.id))
      .orderBy(desc(ideasGpt.createdAt));

    return Response.json({ ideas: ideasWithAuthors });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return Response.json({ ideas: [] }, { status: 500 });
  }
};

export default function IdeasIndexPage() {
  const { ideas } = useLoaderData<LoaderData>();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">IdeasGPT 아이디어</h1>
      {/* TODO: 아이디어 생성 버튼 추가 (로그인 시) */}
      {ideas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map(({ idea, author }) => (
            <Card key={idea.id} className="flex flex-col">
              <CardHeader>
                {/* 카테고리가 있다면 Badge로 표시 */}
                {idea.category && (
                  <div className="mb-2">
                    <Badge variant="secondary">{idea.category}</Badge>
                  </div>
                )}
                <CardTitle className="text-xl">{idea.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* 설명이 길 경우 일부만 표시하고 '더보기' 처리 필요 */}
                <p className="text-muted-foreground text-sm line-clamp-3">
                  <CardDescription>
                    {idea.description || "설명 없음"}
                  </CardDescription>
                </p>
              </CardContent>
              <CardFooter className="text-xs text-gray-500 flex justify-between items-center">
                <span>{author?.username || '익명'}</span>
                <span>{idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : ''}</span>
              </CardFooter>
              {/* 카드 클릭 시 상세 페이지 이동 링크 (추후 구현) */}
              {/* <Link to={`/ideas/${idea.id}`} className="absolute inset-0" /> */}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">아이디어가 없습니다.</p>
      )}
      {/* TODO: 페이지네이션 컴포넌트 추가 */}
    </div>
  );
}