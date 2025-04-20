import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/lib/drizzle.server"; // Drizzle 클라이언트 import
import { communityPosts } from "~/db/schema"; // Drizzle 스키마 import
// Drizzle 스키마 파일에서 export된 타입을 사용
import type { CommunityPost } from "~/db/schema";
import { desc } from "drizzle-orm"; // 정렬 함수 import

export const meta: MetaFunction = () => {
  return [{ title: "YkMake | 커뮤니티" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Drizzle을 사용하여 필요한 컬럼만 조회
    const postsData = await db.select({
      id: communityPosts.id,
      title: communityPosts.title,
      createdAt: communityPosts.createdAt // 스키마의 필드명 사용
    })
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt)); // 최신순 정렬

    // Drizzle 스키마에서 추론된 타입으로 반환 (Pick 사용 예시)
    return json<{ posts: Pick<CommunityPost, 'id' | 'title' | 'createdAt'>[] }>({ posts: postsData });

  } catch (error) {
    console.error("Error fetching community posts:", error);
    // 실제 앱에서는 더 구체적인 에러 처리가 필요할 수 있습니다.
    throw new Response("게시글을 불러오는 중 오류가 발생했습니다.", { status: 500 });
  }
};

export default function CommunityPage() {
  // useLoaderData는 loader의 반환 타입을 기반으로 posts의 타입을 추론합니다.
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">커뮤니티 게시글</h1>
      {posts?.length > 0 ? (
        <ul>
          {/* post 파라미터 타입은 loader 반환 타입 배열의 요소 타입으로 자동 추론됩니다. */}
          {posts.map((post) => (
            <li key={post.id} className="mb-2 border-b pb-2">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500">
                {/* Date 객체로 변환 가능한지 확인 후 사용 */}
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '날짜 없음'}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>아직 게시글이 없습니다.</p>
      )}
    </div>
  );
}