export interface ProductFilter {
    category?: string;
    sort?: "latest" | "popular" | "views";
    tags?: string[];
}

export interface TeamFilter {
    categories?: string[];
    status?: "all" | "recruiting" | "in-progress" | "completed";
    searchQuery?: string;
}