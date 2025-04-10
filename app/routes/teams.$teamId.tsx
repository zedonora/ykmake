import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Progress } from "~/components/ui/progress";
import { Users, Calendar, MessageSquare } from "lucide-react";
import { getTeamById } from "~/lib/data/mock-teams";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import type { TeamMember } from "~/lib/types/team";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data || !data.team) {
        return [
            { title: "Team Not Found - YkMake" },
            { name: "description", content: "This team could not be found" },
        ];
    }

    return [
        { title: `${data.team.name} - YkMake` },
        { name: "description", content: data.team.description },
    ];
};

export async function loader({ params }: LoaderFunctionArgs) {
    const team = getTeamById(params.teamId as string);

    if (!team) {
        throw new Response("Team not found", { status: 404 });
    }

    return Response.json({ team });
}

export default function TeamDetail() {
    const { team } = useLoaderData<typeof loader>();

    // 상태에 따른 배지 스타일
    const statusVariantMap = {
        recruiting: "default",
        "in-progress": "secondary",
        completed: "outline"
    };

    const statusTextMap = {
        recruiting: "모집 중",
        "in-progress": "진행 중",
        completed: "완료됨"
    };

    const statusVariant = statusVariantMap[team.status as keyof typeof statusVariantMap] || "default";
    const statusText = statusTextMap[team.status as keyof typeof statusTextMap] || "";

    // 팀원 수 계산
    const memberCount = team.members.length;
    const memberPercentage = (memberCount / team.maxMembers) * 100;

    // 날짜 포맷팅
    const formattedDate = new Date(team.createdAt).toLocaleDateString();

    return (
        <>
            <PageHeader
                title={team.name}
                description={team.description}
            >
                <div className="flex gap-2">
                    <Button size="lg" variant="outline">메시지 보내기</Button>
                    <Button size="lg">참여 신청</Button>
                </div>
            </PageHeader>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 왼쪽 사이드바 - 팀 정보 */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>팀 정보</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            팀원 {memberCount}/{team.maxMembers}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {memberPercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <Progress value={memberPercentage} className="h-2" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">카테고리</h3>
                                    <Badge>{team.category}</Badge>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">상태</h3>
                                    <Badge variant={statusVariant as "default" | "secondary" | "outline" | "destructive" | null | undefined}>{statusText}</Badge>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">생성일</h3>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar size={14} />
                                        <span>{formattedDate}</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">기술 스택</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {team.tags.map((tag: string, index: number) => (
                                            <Badge key={index} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>모집 중인 포지션</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {team.openPositions.map((position: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Badge variant="outline" className="w-2 h-2 p-0 rounded-full" />
                                            <span>{position}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 오른쪽 메인 컨텐츠 - 팀원 정보 */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>팀원</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {team.members.map((member: TeamMember) => (
                                        <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={member.avatarUrl} alt={member.name} />
                                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{member.name}</h3>
                                                    {member.isLeader && (
                                                        <Badge variant="secondary" className="text-xs">팀장</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="gap-1">
                                                <MessageSquare size={14} />
                                                <span>메시지</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>팀 소개</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line">{team.description}</p>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="lg">문의하기</Button>
                            <Button size="lg">참여 신청</Button>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}