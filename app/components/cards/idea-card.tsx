import { Link } from "@remix-run/react";
import { LightbulbIcon, ThumbsUp, ExternalLink } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export interface IdeaCardProps {
    id: string;
    title: string;
    description: string;
    category: string;
    likes: number;
    createdAt: string;
    slug: string;
    isClaimed?: boolean;
    isPromoted?: boolean;
    claimedBy?: string;
}

export function IdeaCard({
    id,
    title,
    description,
    category,
    likes,
    createdAt,
    slug,
    isClaimed = false,
    isPromoted = false,
    claimedBy,
}: IdeaCardProps) {
    return (
        <Card className={`${isPromoted ? "border-primary/50" : ""}`}>
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                                {category}
                            </Badge>
                            {isPromoted && (
                                <Badge variant="secondary" className="text-xs bg-primary/10">
                                    추천
                                </Badge>
                            )}
                            {isClaimed && (
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                    진행 중
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg">
                            <div className="flex items-center gap-2">
                                <LightbulbIcon size={18} className="text-yellow-500" />
                                <Link
                                    to={`/ideas/${slug}`}
                                    className="hover:underline hover:text-primary transition-colors"
                                >
                                    {title}
                                </Link>
                            </div>
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <CardDescription className="line-clamp-3 mb-3">
                    {description}
                </CardDescription>
                <div className="flex items-center text-xs text-muted-foreground">
                    <span>생성일: {createdAt}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-muted-foreground">
                        <ThumbsUp size={14} className="mr-1" />
                        <span className="text-xs">{likes}</span>
                    </div>
                    {isClaimed && claimedBy && (
                        <div className="text-xs text-muted-foreground">
                            진행자: {claimedBy}
                        </div>
                    )}
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link to={`/ideas/${slug}`} className="inline-flex items-center text-xs">
                        자세히 <ExternalLink size={12} className="ml-1" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}