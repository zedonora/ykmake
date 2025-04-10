export interface Post {
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

export interface Comment {
    id: string;
    postId: string;
    authorName: string;
    authorImageUrl?: string;
    content: string;
    publishedAt: string;
    likes: number;
    isReplyTo?: string;
}