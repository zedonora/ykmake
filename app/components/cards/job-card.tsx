import { Link } from "@remix-run/react";
import { MapPin, Building, Briefcase, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { Job } from "~/lib/types/job";

interface JobCardProps extends Partial<Job> { }

export function JobCard({
    id,
    title,
    company,
    companyLogo,
    location,
    type,
    salary,
    tags,
    postedAt,
    deadline,
    status
}: JobCardProps) {
    // 포스팅 날짜 포맷팅
    const formattedDate = postedAt ? new Date(postedAt).toLocaleDateString() : null;

    // 마감일까지 남은 날짜 계산
    let daysLeft = null;
    if (deadline) {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 회사 이니셜
    const companyInitials = company
        ? company
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "C";

    return (
        <Card className="h-full flex flex-col hover:border-primary/50 transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={companyLogo} alt={company} />
                            <AvatarFallback>{companyInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <Link to={`/jobs/${id}`} className="hover:text-primary transition-colors">
                                <h3 className="font-bold text-lg">{title}</h3>
                            </Link>
                            <p className="text-muted-foreground text-sm">{company}</p>
                        </div>
                    </div>
                    {status === "filled" && (
                        <Badge variant="secondary">채용 완료</Badge>
                    )}
                    {status === "expired" && (
                        <Badge variant="destructive">마감됨</Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                    {location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{location}</span>
                        </div>
                    )}
                    {type && (
                        <div className="flex items-center gap-1">
                            <Briefcase size={14} />
                            <span>{type}</span>
                        </div>
                    )}
                    {salary && (
                        <div className="flex items-center gap-1">
                            <Building size={14} />
                            <span>{salary}</span>
                        </div>
                    )}
                    {formattedDate && (
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formattedDate}</span>
                        </div>
                    )}
                </div>

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2">
                <div className="flex justify-between items-center w-full">
                    {daysLeft !== null && daysLeft > 0 ? (
                        <span className="text-xs text-muted-foreground">
                            마감까지 {daysLeft}일 남음
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {status === "active" ? "상시 채용" : ""}
                        </span>
                    )}

                    <Button size="sm" variant="outline" asChild>
                        <Link to={`/jobs/${id}`}>자세히 보기</Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}