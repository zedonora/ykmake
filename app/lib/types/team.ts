export interface TeamMember {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
    isLeader: boolean;
}

export interface Team {
    id: string;
    name: string;
    description: string;
    members: TeamMember[];
    maxMembers: number;
    openPositions: string[];
    tags: string[];
    status: "recruiting" | "in-progress" | "completed";
    projectId?: string;
    createdAt: string;
    updatedAt: string;
    category: string;
}