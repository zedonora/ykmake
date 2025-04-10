import { Post, Comment } from '~/lib/types/post';

export const mockPosts: Post[] = [
    {
        id: "1",
        title: "React 18에서 달라진 점과 마이그레이션 가이드",
        content: "React 18이 정식 출시되었습니다. 이번 업데이트에서는 동시성 기능이 도입되어 사용자 경험을 크게 향상시킬 수 있게 되었습니다. 주요 변경사항으로는 자동 배치 처리, Suspense 개선, 새로운 API들이 있습니다.",
        authorName: "이리액트",
        publishedAt: "2023-09-21",
        likes: 78,
        comments: 15,
        tags: ["React", "프론트엔드", "웹개발"],
        slug: "react-18-migration-guide",
        isPinned: true,
    },
    {
        id: "2",
        title: "TypeScript 5.0의 새로운 기능들",
        content: "TypeScript 5.0이 출시되었습니다. 이번 버전에서는 성능 개선, 새로운 타입 시스템 기능, 그리고 개발자 경험 향상이 이루어졌습니다. 특히 const 타입 파라미터와 데코레이터 메타데이터 API가 추가되었습니다.",
        authorName: "김타입",
        publishedAt: "2023-08-15",
        likes: 65,
        comments: 12,
        tags: ["TypeScript", "프론트엔드", "개발도구"],
        slug: "typescript-5-features",
        isPinned: true,
    },
    {
        id: "3",
        title: "Next.js 13 App Router 완벽 가이드",
        content: "Next.js 13의 App Router는 React Server Components를 기반으로 한 새로운 라우팅 시스템을 도입했습니다. 이 가이드에서는 App Router의 핵심 개념과 실제 사용 사례를 다룹니다.",
        authorName: "박넥스트",
        publishedAt: "2023-07-30",
        likes: 92,
        comments: 28,
        tags: ["Next.js", "React", "프론트엔드"],
        slug: "nextjs-13-app-router-guide",
    },
    {
        id: "4",
        title: "Docker 컨테이너 보안 모범 사례",
        content: "Docker 컨테이너의 보안을 강화하기 위한 모범 사례를 소개합니다. 멀티 스테이지 빌드, 보안 스캔, 시크릿 관리 등 다양한 보안 기법을 다룹니다.",
        authorName: "최도커",
        publishedAt: "2023-06-25",
        likes: 45,
        comments: 8,
        tags: ["Docker", "DevOps", "보안"],
        slug: "docker-security-best-practices",
    },
    {
        id: "5",
        title: "GraphQL vs REST API: 어떤 것을 선택해야 할까?",
        content: "GraphQL과 REST API의 장단점을 비교 분석하고, 각각의 사용 사례에 대해 알아보겠습니다. 실제 프로젝트에서의 선택 기준과 고려사항을 다룹니다.",
        authorName: "정API",
        publishedAt: "2023-05-20",
        likes: 88,
        comments: 24,
        tags: ["GraphQL", "REST", "API", "백엔드"],
        slug: "graphql-vs-rest-api",
    },
    {
        id: "6",
        title: "AWS Lambda 함수 최적화 가이드",
        content: "AWS Lambda 함수의 성능을 최적화하는 방법을 알아봅니다. 메모리 설정, 코드 최적화, 콜드 스타트 감소 등 다양한 최적화 기법을 소개합니다.",
        authorName: "이AWS",
        publishedAt: "2023-04-15",
        likes: 76,
        comments: 18,
        tags: ["AWS", "Lambda", "서버리스", "클라우드"],
        slug: "aws-lambda-optimization-guide",
    },
    {
        id: "7",
        title: "GitHub Actions로 CI/CD 파이프라인 구축하기",
        content: "GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 구축하는 방법을 알아봅니다. 테스트, 빌드, 배포 과정을 자동화하는 워크플로우를 작성합니다.",
        authorName: "김깃허브",
        publishedAt: "2023-03-10",
        likes: 82,
        comments: 22,
        tags: ["GitHub", "CI/CD", "DevOps", "자동화"],
        slug: "github-actions-cicd-guide",
    },
    {
        id: "8",
        title: "MongoDB Atlas와 Mongoose 사용 가이드",
        content: "MongoDB Atlas 클라우드 서비스를 사용하여 데이터베이스를 구축하고, Mongoose를 통해 Node.js 애플리케이션과 연동하는 방법을 알아봅니다.",
        authorName: "박몽고",
        publishedAt: "2023-02-05",
        likes: 58,
        comments: 14,
        tags: ["MongoDB", "Node.js", "데이터베이스", "백엔드"],
        slug: "mongodb-atlas-mongoose-guide",
    }
];

export const mockComments: Comment[] = [
    {
        id: "1",
        postId: "1",
        authorName: "김개발자",
        content: "React 18의 동시성 기능 정말 유용하네요! 특히 자동 배치 처리가 개발 생산성을 크게 높여줄 것 같습니다.",
        publishedAt: "2023-09-21",
        likes: 12,
    },
    {
        id: "2",
        postId: "1",
        authorName: "이프론트",
        content: "Suspense 개선사항이 특히 인상적입니다. 서버 사이드 렌더링에서 더 나은 성능을 기대할 수 있겠네요.",
        publishedAt: "2023-09-22",
        likes: 8,
    },
    {
        id: "3",
        postId: "2",
        authorName: "박타입스크립트",
        content: "const 타입 파라미터 추가가 정말 좋은 기능이네요. 타입 추론이 더 정확해질 것 같습니다.",
        publishedAt: "2023-08-16",
        likes: 15,
    },
    {
        id: "4",
        postId: "3",
        authorName: "최넥스트",
        content: "App Router의 서버 컴포넌트 활용이 정말 강력하네요. 클라이언트 번들 사이즈를 크게 줄일 수 있을 것 같습니다.",
        publishedAt: "2023-07-31",
        likes: 20,
    },
    {
        id: "5",
        postId: "4",
        authorName: "정도커",
        content: "멀티 스테이지 빌드 관련 내용이 특히 유용했습니다. 이미지 크기를 최적화하는데 도움이 될 것 같네요.",
        publishedAt: "2023-06-26",
        likes: 6,
    },
    {
        id: "6",
        postId: "5",
        authorName: "김API",
        content: "GraphQL과 REST의 장단점 비교가 정말 명확하게 설명되어 있네요. 프로젝트 선택 시 참고하기 좋을 것 같습니다.",
        publishedAt: "2023-05-21",
        likes: 18,
    },
    {
        id: "7",
        postId: "6",
        authorName: "이AWS",
        content: "Lambda 콜드 스타트 최적화 팁이 특히 유용했습니다. 실제 프로젝트에 바로 적용해볼 수 있을 것 같네요.",
        publishedAt: "2023-04-16",
        likes: 14,
    },
    {
        id: "8",
        postId: "7",
        authorName: "박깃허브",
        content: "GitHub Actions 워크플로우 예제가 정말 실용적이네요. CI/CD 파이프라인 구축에 바로 활용할 수 있을 것 같습니다.",
        publishedAt: "2023-03-11",
        likes: 16,
    },
    {
        id: "9",
        postId: "8",
        authorName: "최몽고",
        content: "MongoDB Atlas 설정 과정이 잘 설명되어 있네요. 특히 보안 설정 부분이 유용했습니다.",
        publishedAt: "2023-02-06",
        likes: 9,
    }
];

// 카테고리별 게시글 필터링 함수
export function getPostsByCategory(category: string): Post[] {
    return mockPosts.filter(post =>
        post.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
    );
}

// 인기 게시글 가져오기 (좋아요 기준)
export function getPopularPosts(limit: number = 3): Post[] {
    return [...mockPosts].sort((a, b) => b.likes - a.likes).slice(0, limit);
}

// 최신 게시글 가져오기 (작성일 기준)
export function getLatestPosts(limit: number = 8): Post[] {
    return [...mockPosts].sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    ).slice(0, limit);
}

// 게시글 검색 함수
export function searchPosts(query: string): Post[] {
    const searchTerms = query.toLowerCase().split(' ');
    return mockPosts.filter(post => {
        const searchText = `${post.title} ${post.content} ${post.tags.join(' ')} ${post.authorName}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
    });
}

// 게시글 상세 정보 가져오기
export function getPostBySlug(slug: string): Post | undefined {
    return mockPosts.find(post => post.slug === slug);
}

// 게시글에 대한 댓글 가져오기
export function getCommentsByPostId(postId: string): Comment[] {
    return mockComments.filter(comment => comment.postId === postId);
}

// 모든 태그 가져오기
export function getAllTags(): string[] {
    const tagsSet = new Set<string>();
    mockPosts.forEach(post => post.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet);
}