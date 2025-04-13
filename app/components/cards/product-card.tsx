import { Link } from "@remix-run/react";
import {
    ArrowUpRight,
    MessageSquare,
    ThumbsUp,
    Users2
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export interface ProductCardProps {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    upvotes: number;
    comments: number;
    authorName: string;
    authorImageUrl?: string;
    launchDate: string;
    slug: string;
    featured?: boolean;
}

export function ProductCard({
    id,
    title,
    description,
    imageUrl,
    category,
    upvotes,
    comments,
    authorName,
    authorImageUrl,
    launchDate,
    slug,
    featured = false,
}: ProductCardProps) {
    const initials = authorName
        ? authorName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "UN";

    return (
        <Card className={`overflow-hidden ${featured ? 'border-primary/50 shadow-md' : ''}`}>
            <div className="aspect-video relative overflow-hidden">
                <img
                    src={imageUrl || "https://placehold.co/600x400/png"}
                    alt={title}
                    className="object-cover w-full h-full"
                />
                {featured && (
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                            주목할 제품
                        </Badge>
                    </div>
                )}
            </div>
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2">
                            {category}
                        </Badge>
                        <CardTitle className="text-xl">
                            <Link
                                to={`/products/${slug}`}
                                className="hover:underline hover:text-primary transition-colors"
                            >
                                {title}
                            </Link>
                        </CardTitle>
                    </div>
                </div>
                <CardDescription className="line-clamp-2">{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                    <span>출시일: {launchDate}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={authorImageUrl} alt={authorName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{authorName}</div>
                </div>
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <ThumbsUp size={18} className="mr-1" />
                        <span className="text-xs">{upvotes}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <MessageSquare size={18} className="mr-1" />
                        <span className="text-xs">{comments}</span>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link to={`/products/${slug}`} className="inline-flex items-center">
                            보기 <ArrowUpRight size={14} className="ml-1" />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}