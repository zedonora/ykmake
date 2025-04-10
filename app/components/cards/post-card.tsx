import { Link } from "@remix-run/react";
import { Calendar, MessageSquare, ThumbsUp } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export interface PostCardProps {
    id: string;
    title: string;
    content: string;
    authorName: string;
    authorImageUrl?: string;
    publishedAt: string;
    likes: number;
    comments: number;
    tags: string[];
    slug: string;
    isPinned?: boolean;
}

export function PostCard({
    id,
    title,
    content,
    authorName,
    authorImageUrl,
    publishedAt,
    likes,
    comments,
    tags,
    slug,
    isPinned = false,
}: PostCardProps) {
    const initials = authorName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return (
        <Card className={`${isPinned ? "border-primary/50" : ""}`}>
            <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                        {isPinned && (
                            <Badge variant="outline" className="mb-1 bg-primary/10">
                                고정됨
                            </Badge>
                        )}
                        <CardTitle className="text-xl mb-1">
                            <Link
                                to={`/community/${slug}`}
                                className="hover:underline hover:text-primary transition-colors"
                            >
                                {title}
                            </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <CardDescription className="line-clamp-3 mb-4">
                    {content}
                </CardDescription>
                <div className="flex items-center space-x-4">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={authorImageUrl} alt={authorName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{authorName}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar size={14} className="mr-1" />
                        {publishedAt}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-muted-foreground">
                        <ThumbsUp size={14} className="mr-1" />
                        <span className="text-xs">{likes}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <MessageSquare size={14} className="mr-1" />
                        <span className="text-xs">{comments}</span>
                    </div>
                </div>
                <Link
                    to={`/community/${slug}`}
                    className="text-xs font-medium text-primary hover:underline"
                >
                    전체 보기
                </Link>
            </CardFooter>
        </Card>
    );
}