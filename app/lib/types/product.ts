export interface Product {
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