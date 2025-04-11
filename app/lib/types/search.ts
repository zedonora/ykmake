export interface SearchResult {
    id: string;
    title: string;
    description: string;
    type: "product" | "team" | "user";
    url: string;
    image?: string;
    metadata?: Record<string, any>;
}

export interface SearchQuery {
    q: string;
    type?: "all" | "product" | "team" | "user";
    filters?: Record<string, any>;
}

export interface SearchResponse {
    results: SearchResult[];
    total: number;
    page: number;
    limit: number;
}