import { useLoaderData } from '@remix-run/react';
import { db } from '~/lib/drizzle.server'; // Drizzle 클라이언트
import { Team, teams } from '~/db/schema'; // 스키마 import
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'; // Shadcn UI 카드
import { desc } from 'drizzle-orm';
// 필요시 Link import
// import { Link } from '@remix-run/react';

// Loader 함수: 서버 측 데이터 로딩
export async function loader() {
  // teams 테이블에서 최신순으로 팀 목록 조회
  const teamList = await db.select().from(teams).orderBy(desc(teams.createdAt)).limit(20);
  // 필요시 소유자 정보 포함 (users 테이블과 관계 설정 필요)
  // 필요시 소유자 정보 포함 (users 테이블과 관계 설정 필요)
  // with: {
  //   owner: {
  //     columns: { name: true } // 예시: 소유자 이름만 포함
  //   }
  // }

  return Response.json({ teamList });
}

// 페이지 컴포넌트
export default function TeamsIndex() {
  const { teamList } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">팀 목록</h1>
      {/* TODO: 팀 생성 버튼 추가 (권한 필요시) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamList && teamList.length > 0 ? (
          teamList.map((team: Team) => (
            // Link 컴포넌트로 감싸서 상세 페이지 이동 구현 가능
            // <Link key={team.id} to={`/teams/${team.id}`}>
            <Card key={team.id} className="hover:shadow-md transition-shadow duration-200 cursor-pointer"> {/* Hover 효과 추가 */}
              <CardHeader>
                <CardTitle className="text-lg">{team.name}</CardTitle>
                {/* 소유자 정보 표시 예시 (loader에서 with로 가져왔을 경우) */}
                {/* <CardDescription>소유자: {team.owner?.name || '정보 없음'}</CardDescription> */}
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3">
                  {team.description || '팀 설명이 없습니다.'}
                </p>
              </CardContent>
            </Card>
            // </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            등록된 팀이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}