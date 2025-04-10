import { Link } from "@remix-run/react";
import { Eye, ThumbsUp, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import type { Project } from "~/lib/types/project";

interface ProjectCardProps extends Partial<Project> { }

// 상태에 따른 배지 색상
type ProjectStatus = "draft" | "in_progress" | "completed" | "archived";
type BadgeVariant = "secondary" | "default" | "outline" | "destructive";
const statusVariantMap: Record<ProjectStatus, BadgeVariant> = {
    draft: "secondary",
    in_progress: "default",
    completed: "outline",
    archived: "secondary"
};

export function ProjectCard({
    id,
    title,
    slug,
    description,
    authorName,
    authorImageUrl,
    thumbnailUrl,
    status,
    category,
    tags,
    technologies,
    createdAt,
    likes,
    views,
    isFeatured
}: ProjectCardProps) {
    // 이니셜 생성
    const initials = authorName
        ? authorName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "U";

    // 상태 텍스트
    const statusText = {
        draft: "초안",
        in_progress: "진행 중",
        completed: "완료됨",
        archived: "보관됨"
    }[status as string] || "";

    // 상태에 따른 배지 스타일
    const statusVariant = status ? statusVariantMap[status as ProjectStatus] || "default" : "default";

    return (
        <Card className={`overflow-hidden h-full flex flex-col transition-all hover:border-primary/50 ${isFeatured ? 'border-primary/20 bg-primary/5' : ''}`}>
            {thumbnailUrl && (
                <Link to={`/projects/${slug}`} className="block overflow-hidden h-48 relative">
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    {status && (
                        <div className="absolute top-2 right-2">
                            <Badge variant={statusVariant}>{statusText}</Badge>
                        </div>
                    )}
                </Link>
            )}

            <CardHeader className="flex-none">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <Link to={`/projects/categories/${category?.toLowerCase()}`}>
                            <Badge variant="outline" className="mb-1">{category}</Badge>
                        </Link>
                        <Link to={`/projects/${slug}`} className="block group">
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                                {title}
                            </h3>
                        </Link>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {description}
                </p>

                {technologies && technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {technologies.slice(0, 3).map((tech) => (
                            <Link key={tech} to={`/projects/technologies/${tech.toLowerCase()}`}>
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {tech}
                                </Badge>
                            </Link>
                        ))}
                        {technologies.length > 3 && (
                            <Badge variant="secondary" className="text-xs font-normal">
                                +{technologies.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex-none">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={authorImageUrl} alt={authorName} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{authorName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <ThumbsUp size={14} />
                            <span>{likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CalendarDays size={14} />
                            <span>{createdAt ? new Date(createdAt).toLocaleDateString() : '날짜 없음'}</span>
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}