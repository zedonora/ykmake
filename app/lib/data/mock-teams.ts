import type { Team, TeamMember } from "~/lib/types/team";

export const mockTeamMembers: TeamMember[] = [
    {
        id: "member-1",
        name: "김영희",
        avatarUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=Kim",
        role: "ML 엔지니어",
        isLeader: true
    },
    {
        id: "member-2",
        name: "이철수",
        avatarUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=Lee",
        role: "백엔드 개발자",
        isLeader: false
    },
    {
        id: "member-3",
        name: "박지민",
        avatarUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=Park",
        role: "풀스택 개발자",
        isLeader: false
    }
];

export const mockTeams: Team[] = [
    {
        id: "team-1",
        name: "AI 기반 제품 추천 시스템",
        description: "사용자의 취향을 분석하여 최적의 제품을 추천하는 시스템을 개발합니다.",
        members: mockTeamMembers.slice(0, 2),
        maxMembers: 6,
        openPositions: ["백엔드 개발자 (Python) - 1명", "프론트엔드 개발자 (React) - 1명"],
        tags: ["Python", "TensorFlow", "React"],
        status: "recruiting",
        createdAt: "2023-04-10",
        updatedAt: "2023-05-15",
        category: "AI"
    },
    {
        id: "team-2",
        name: "블록체인 마켓플레이스",
        description: "NFT 기반의 디지털 자산 거래 플랫폼을 개발합니다.",
        members: mockTeamMembers.slice(1, 3),
        maxMembers: 5,
        openPositions: ["블록체인 개발자 (Solidity) - 1명", "프론트엔드 개발자 (React) - 1명"],
        tags: ["Solidity", "Web3.js", "Next.js"],
        status: "recruiting",
        createdAt: "2023-05-01",
        updatedAt: "2023-05-18",
        category: "블록체인"
    }
];

export function getAllTeams() {
    return mockTeams;
}

export function getTeamById(id: string) {
    return mockTeams.find(team => team.id === id);
}

export function getTeamsByCategory(category: string) {
    return mockTeams.filter(team => team.category.toLowerCase() === category.toLowerCase());
}

export function getTeamsByStatus(status: string) {
    return mockTeams.filter(team => team.status === status);
}

export function searchTeams(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return mockTeams.filter(team =>
        team.name.toLowerCase().includes(lowercaseQuery) ||
        team.description.toLowerCase().includes(lowercaseQuery) ||
        team.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
}