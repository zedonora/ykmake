import { useLoaderData } from '@remix-run/react';
import { db } from '~/lib/drizzle.server'; // Drizzle 클라이언트 import
import { jobs } from '~/db/schema'; // 스키마 import
import { desc } from 'drizzle-orm'; // 정렬을 위한 desc 함수 import
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'; // Shadcn UI 카드 컴포넌트
import type { Job } from '~/db/schema'; // Job 타입 가져오기
// Job 타입 정의 (schema.ts 에서 export 했다면 생략 가능)
// import type { Job } from '~/db/schema';

// Loader 함수: 서버 측 데이터 로딩
export async function loader() {
  // SQL 스타일 쿼리 사용
  const jobList = await db
    .select()
    .from(jobs)
    .orderBy(desc(jobs.createdAt))
    .limit(20);

  // Response.json 사용 (Remix 최신 방식)
  return Response.json({ jobList });
}

// 페이지 컴포넌트 (기존 코드 유지)
export default function JobsIndex() {
  const { jobList } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">구인 공고</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobList && jobList.length > 0 ? (
          jobList.map((job: Job) => (
            <Card key={job.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription>
                  {job.company ? `${job.company} | ` : ''}
                  {job.location || '위치 정보 없음'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-2">
                  카테고리: {job.category || '미지정'}
                </p>
                <p className="text-sm line-clamp-4 mb-4">
                  {job.description}
                </p>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-rose-600 hover:underline" // 'rose' 테마 적용
                  >
                    공고 바로가기
                  </a>
                )}
              </CardContent>
              {/* CardFooter 필요시 추가 */}
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            등록된 구인 공고가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
