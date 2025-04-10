import { Link } from "@remix-run/react";
import { Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import type { Team } from "~/lib/types/team";

interface TeamCardProps extends Partial<Team> { }

export function TeamCard({
    id,
    name,
    description,
    members,
    maxMembers,
    tags,
    status,
    category
}: TeamCardProps) {
    // 모집 상태에 따른 배지 스타일
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

    const statusVariant = status ? statusVariantMap[status as keyof typeof statusVariantMap] : "default";
    const statusText = status ? statusTextMap[status as keyof typeof statusTextMap] : "";

    // 팀원 수 계산
    const memberCount = members?.length || 0;
    const memberPercentage = maxMembers ? (memberCount / maxMembers) * 100 : 0;

    return (
        <Card className="h-full flex flex-col hover:border-primary/50 transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        {category && (
                            <Badge variant="outline" className="mb-1">{category}</Badge>
                        )}
                        <Link to={`/teams/${id}`} className="hover:text-primary transition-colors">
                            <h3 className="font-bold text-lg">{name}</h3>
                        </Link>
                    </div>
                    {status && (
                        <Badge variant={statusVariant as "default" | "secondary" | "outline" | "destructive" | null | undefined}>{statusText}</Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                {description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {description}
                    </p>
                )}

                {maxMembers && (
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                                <Users size={14} />
                                팀원 {memberCount}/{maxMembers}
                            </span>
                            <span className="text-muted-foreground">
                                {memberPercentage.toFixed(0)}%
                            </span>
                        </div>
                        <Progress value={memberPercentage} className="h-2" />
                    </div>
                )}

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2">
                <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to={`/teams/${id}`}>자세히 보기</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}