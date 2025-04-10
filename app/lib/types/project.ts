export interface Project {
    id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    authorId: string;
    authorName: string;
    authorImageUrl?: string;
    coverImageUrl?: string;
    thumbnailUrl?: string;
    status: "draft" | "in_progress" | "completed" | "archived";
    visibility: "private" | "public" | "limited";
    category: string;
    tags: string[];
    technologies: string[];
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    completedAt?: string;
    collaborators?: Collaborator[];
    likes: number;
    views: number;
    isFeatured?: boolean;
    milestones?: Milestone[];
    resources?: Resource[];
}

export interface Collaborator {
    id: string;
    userId: string;
    name: string;
    imageUrl?: string;
    role: string;
    joinedAt: string;
}

export interface Milestone {
    id: string;
    title: string;
    description?: string;
    status: "planned" | "in_progress" | "completed";
    dueDate?: string;
    completedAt?: string;
}

export interface Resource {
    id: string;
    type: "link" | "image" | "document" | "video";
    title: string;
    url: string;
    description?: string;
    thumbnailUrl?: string;
}