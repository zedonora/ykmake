import { useLoaderData, useParams } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node'; // Loader 함수의 인자 타입
import { db } from '~/lib/drizzle.server'; // Drizzle 클라이언트
import { Job, jobs } from '~/db/schema'; // jobs 스키마
import { eq, desc } from 'drizzle-orm'; // Drizzle 조건 함수
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'; // Shadcn UI 카드 (jobs._index.tsx와 동일)

// Loader 함수: URL 파라미터 기반 데이터 로딩
export async function loader({ params }: LoaderFunctionArgs) {
  const categorySlug = params.slug; // URL의 동적 세그먼트($slug) 값 가져오기

  if (!categorySlug) {
    // slug 파라미터가 없는 경우 (이론적으로 발생하기 어려움)
    throw new Response('Category not specified', { status: 400 });
  }

  // 해당 카테고리의 job 목록 조회
  const jobList = await db
    .select()
    .from(jobs)
    .where(eq(jobs.category, categorySlug)) // category 컬럼이 slug와 일치하는 조건
    .orderBy(desc(jobs.createdAt)) // 최신순 정렬 - 콜백 함수 대신 직접 desc() 사용
    .limit(20); // 결과 수 제한

  // 카테고리 이름(슬러그)과 목록 데이터를 함께 반환
  return Response.json({ jobList, categoryName: categorySlug });
}

// 페이지 컴포넌트
export default function CategoryPage() {
  // loader에서 반환된 데이터 사용
  const { jobList, categoryName } = useLoaderData<typeof loader>();
  // 또는 useParams 훅으로 slug를 직접 가져올 수도 있음
  // const params = useParams();
  // const categoryName = params.slug;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">
        카테고리: <span className="text-rose-600">{categoryName}</span> {/* 카테고리 이름 표시 */}
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobList && jobList.length > 0 ? (
          jobList.map((job: Job) => (
            // jobs._index.tsx와 동일한 카드 컴포넌트 재사용
            <Card key={job.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription>
                  {job.company ? `${job.company} | ` : ''}
                  {job.location || '위치 정보 없음'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* 카테고리 페이지이므로 카테고리 정보는 생략하거나 다르게 표시 가능 */}
                <p className="text-sm line-clamp-4 mb-4">
                  {job.description}
                </p>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-rose-600 hover:underline"
                  >
                    공고 바로가기
                  </a>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            이 카테고리에는 등록된 공고가 없습니다.
          </div>
        )}
      </div>
      {/* TODO: 다른 카테고리로 이동하는 링크 또는 카테고리 목록 표시 */}
    </div>
  );
}