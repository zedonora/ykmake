import type { SearchResult, SearchResponse } from "~/lib/types/search";

const MOCK_SEARCH_RESULTS: SearchResult[] = [
    {
        id: "1",
        title: "AI 챗봇",
        description: "OpenAI API를 활용한 대화형 AI 챗봇",
        type: "product",
        url: "/products/ai-chatbot",
        metadata: {
            views: 523,
            likes: 128,
            comments: 45,
        },
    },
    {
        id: "2",
        title: "AI 개발팀",
        description: "AI 기반 제품 개발 팀",
        type: "team",
        url: "/teams/ai-dev",
        metadata: {
            members: 8,
            projects: 3,
            status: "recruiting",
        },
    },
    {
        id: "3",
        title: "홍길동",
        description: "프론트엔드 개발자",
        type: "user",
        url: "/users/hong",
        metadata: {
            products: 12,
            followers: 45,
        },
    },
];

export function search(query: string, type?: string): SearchResponse {
    const results = MOCK_SEARCH_RESULTS.filter((result) => {
        const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.description.toLowerCase().includes(query.toLowerCase());

        if (type && type !== "all") {
            return matchesQuery && result.type === type;
        }

        return matchesQuery;
    });

    return {
        results,
        total: results.length,
        page: 1,
        limit: 10,
    };
}