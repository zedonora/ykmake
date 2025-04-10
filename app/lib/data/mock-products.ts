import { Product } from '~/lib/types/product';

export const mockProducts: Product[] = [
    {
        id: "1",
        title: "DevNote - 개발자를 위한 메모 앱",
        description: "개발자를 위한 메모 앱으로, 코드 스니펫, 마크다운, 그리고 태그 기능을 제공합니다.",
        imageUrl: "https://placehold.co/600x400/png",
        category: "생산성",
        upvotes: 120,
        comments: 32,
        authorName: "김개발",
        authorImageUrl: undefined,
        launchDate: "2023-08-15",
        slug: "devnote",
        featured: true,
    },
    {
        id: "2",
        title: "CodeReview AI - 코드 리뷰 자동화 도구",
        description: "AI를 활용한 코드 리뷰 자동화 도구입니다. GitHub와 GitLab 연동을 지원합니다.",
        imageUrl: "https://placehold.co/600x400/png",
        category: "개발 도구",
        upvotes: 89,
        comments: 24,
        authorName: "이코드",
        authorImageUrl: undefined,
        launchDate: "2023-09-20",
        slug: "codereview-ai",
    },
    {
        id: "3",
        title: "TaskFlow - 팀 프로젝트 관리 앱",
        description: "개발 팀을 위한 프로젝트 관리 앱으로, 간트 차트, 칸반 보드, 버그 트래킹 기능을 제공합니다.",
        imageUrl: "https://placehold.co/600x400/png",
        category: "프로젝트 관리",
        upvotes: 74,
        comments: 18,
        authorName: "박매니저",
        authorImageUrl: undefined,
        launchDate: "2023-07-05",
        slug: "taskflow",
        featured: true,
    },
    {
        id: "4",
        title: "CodeChat - 개발자 채팅 앱",
        description: "코드 스니펫을 공유하고 실시간으로 협업할 수 있는 개발자 중심의 채팅 앱입니다.",
        imageUrl: "https://placehold.co/600x400/png",
        category: "협업",
        upvotes: 56,
        comments: 12,
        authorName: "최채팅",
        authorImageUrl: undefined,
        launchDate: "2023-10-01",
        slug: "codechat",
    },
    {
        id: "5",
        title: "DevDocs - API 문서 생성기",
        description: "코드에서 API 문서를 자동으로 생성하는 도구로, REST API, GraphQL, gRPC를 지원합니다.",
        imageUrl: "https://placehold.co/600x400/png",
        category: "문서화",
        upvotes: 67,
        comments: 21,
        authorName: "정문서",
        authorImageUrl: undefined,
        launchDate: "2023-08-30",
        slug: "devdocs",
    },
    {
        id: "6",
        title: "CodeTimer - 코드 성능 측정 도구",
        description: "코드 성능을 측정하고 병목 현상을 식별하는 도구입니다. 다양한 프로그래밍 언어를 지원합니다.",
        imageUrl: "https://placehold.co/600x400/png",
        category: "성능 최적화",
        upvotes: 45,
        comments: 9,
        authorName: "이성능",
        authorImageUrl: undefined,
        launchDate: "2023-09-10",
        slug: "codetimer",
    },
];

// 카테고리별 제품 필터링 함수
export function getProductsByCategory(category: string): Product[] {
    return mockProducts.filter(product => product.category.toLowerCase() === category.toLowerCase());
}

// 인기 제품 가져오기 (업보트 기준)
export function getPopularProducts(limit: number = 3): Product[] {
    return [...mockProducts].sort((a, b) => b.upvotes - a.upvotes).slice(0, limit);
}

// 최신 제품 가져오기 (출시일 기준)
export function getLatestProducts(limit: number = 3): Product[] {
    return [...mockProducts].sort((a, b) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime()).slice(0, limit);
}

// 추천 제품 가져오기 (featured 속성 기준)
export function getFeaturedProducts(): Product[] {
    return mockProducts.filter(product => product.featured);
}

// 모든 카테고리 가져오기
export function getAllCategories(): string[] {
    const categories = new Set(mockProducts.map(product => product.category));
    return Array.from(categories);
}

// 제품 검색 함수
export function searchProducts(query: string): Product[] {
    const searchTerms = query.toLowerCase().split(' ');
    return mockProducts.filter(product => {
        const searchText = `${product.title} ${product.description} ${product.category} ${product.authorName}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
    });
}

// 제품 상세 정보 가져오기
export function getProductBySlug(slug: string): Product | undefined {
    return mockProducts.find(product => product.slug === slug);
}