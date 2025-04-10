import { PageHeader } from "~/components/layouts/page-header";
import { RootLayout } from "~/components/layouts/root-layout";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { PostCard } from "~/components/cards/post-card";
import { IdeaCard } from "~/components/cards/idea-card";
import { JobCard } from "~/components/cards/job-card";
import { TeamCard } from "~/components/cards/team-card";

// 예시 데이터
const exampleProduct = {
    id: "1",
    title: "DevNote - 개발자를 위한 메모 앱",
    description: "개발자를 위한 메모 앱으로, 코드 스니펫, 마크다운, 그리고 태그 기능을 제공합니다.",
    imageUrl: "https://placehold.co/600x400/png",
    category: "생산성",
    upvotes: 120,
    comments: 32,
    authorName: "김개발",
    launchDate: "2023-08-15",
    slug: "devnote",
    featured: true,
};

const examplePost = {
    id: "1",
    title: "React 18에서 달라진 점과 마이그레이션 가이드",
    content: "React 18이 정식 출시되었습니다. 이번 업데이트에서는 동시성 기능이 도입되어 사용자 경험을 크게 향상시킬 수 있게 되었습니다. 이 글에서는 React 18의 주요 변경 사항과 프로젝트를 마이그레이션하는 방법에 대해 알아봅니다.",
    authorName: "이리액트",
    publishedAt: "2023-09-21",
    likes: 78,
    comments: 15,
    tags: ["React", "프론트엔드", "웹개발"],
    slug: "react-18-migration-guide",
    isPinned: true,
};

const exampleIdea = {
    id: "1",
    title: "개발자를 위한 AI 기반 코드 리뷰 플랫폼",
    description: "인공지능을 활용하여 코드 품질을 분석하고 개선 사항을 제안하는 코드 리뷰 플랫폼. GitHub 연동을 통해 PR 시 자동으로 코드를 분석하고, 보안 취약점, 성능 이슈, 코드 스타일 등을 점검합니다.",
    category: "개발자 도구",
    likes: 45,
    createdAt: "2023-10-05",
    slug: "ai-code-review-platform",
    isPromoted: true,
};

const exampleJob = {
    id: "1",
    title: "시니어 프론트엔드 개발자 (React)",
    companyName: "테크스타트",
    location: "서울 강남",
    salary: "8,000만원 이상",
    jobType: "full-time",
    experienceLevel: "senior",
    skills: ["React", "TypeScript", "Next.js", "Redux"],
    createdAt: "2023-10-10",
    slug: "senior-frontend-developer",
    isFeatured: true,
};

const exampleTeam = {
    id: "1",
    name: "프로젝트 아틀라스",
    description: "개발자 커리어 관리를 위한 포트폴리오 및 커뮤니티 플랫폼을 개발하는 프로젝트입니다. 포트폴리오 제작, 기술 블로그, 커리어 멘토링을 한 곳에서 제공합니다.",
    category: "웹 애플리케이션",
    members: [
        { id: "1", name: "김팀장", role: "팀장/프론트엔드", avatarUrl: "" },
        { id: "2", name: "박백엔드", role: "백엔드 개발자", avatarUrl: "" },
    ],
    requiredRoles: ["UI/UX 디자이너", "풀스택 개발자", "마케팅 담당자"],
    createdAt: "2023-09-15",
    slug: "project-atlas",
    isFeatured: true,
};

export default function ExamplesPage() {
    return (
        <RootLayout>
            <PageHeader
                title="컴포넌트 예시"
                description="YkMake 플랫폼의 다양한 카드 컴포넌트를 확인해보세요."
            />

            <Section>
                <h2 className="text-2xl font-bold mb-6">제품 카드</h2>
                <div className="max-w-md">
                    <ProductCard {...exampleProduct} />
                </div>
            </Section>

            <Section className="border-t">
                <h2 className="text-2xl font-bold mb-6">게시글 카드</h2>
                <div className="max-w-md">
                    <PostCard {...examplePost} />
                </div>
            </Section>

            <Section className="border-t">
                <h2 className="text-2xl font-bold mb-6">아이디어 카드</h2>
                <div className="max-w-md">
                    <IdeaCard {...exampleIdea} />
                </div>
            </Section>

            <Section className="border-t">
                <h2 className="text-2xl font-bold mb-6">구인/구직 카드</h2>
                <div className="max-w-md">
                    <JobCard {...exampleJob} />
                </div>
            </Section>

            <Section className="border-t">
                <h2 className="text-2xl font-bold mb-6">팀 카드</h2>
                <div className="max-w-md">
                    <TeamCard {...exampleTeam} />
                </div>
            </Section>
        </RootLayout>
    );
}