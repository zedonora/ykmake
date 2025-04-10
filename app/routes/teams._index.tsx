import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { TeamCard } from "~/components/cards/team-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { getAllTeams } from "~/lib/data/mock-teams";
import type { Team } from "~/lib/types/team";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "팀 찾기 - YkMake" },
        { name: "description", content: "YkMake에서 함께할 팀을 찾아보세요" },
    ];
};

export async function loader() {
    const teams = getAllTeams();
    return Response.json({ teams });
}

export default function TeamsIndex() {
    const { teams } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="팀 찾기"
                description="프로젝트를 함께할 팀을 찾거나 직접 만들어보세요"
            >
                <Button size="lg" asChild>
                    <a href="/teams/new">팀 만들기</a>
                </Button>
            </PageHeader>

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Input placeholder="검색어를 입력하세요" />
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="모든 카테고리" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">모든 카테고리</SelectItem>
                            <SelectItem value="ai">AI</SelectItem>
                            <SelectItem value="web">웹</SelectItem>
                            <SelectItem value="mobile">모바일</SelectItem>
                            <SelectItem value="blockchain">블록체인</SelectItem>
                            <SelectItem value="game">게임</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="모든 상태" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">모든 상태</SelectItem>
                            <SelectItem value="recruiting">모집 중</SelectItem>
                            <SelectItem value="in-progress">진행 중</SelectItem>
                            <SelectItem value="completed">완료됨</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team: Team) => (
                        <TeamCard key={team.id} {...team} />
                    ))}
                </div>
            </Section>
        </>
    );
}