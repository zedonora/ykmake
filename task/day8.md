# Day 8: 구인/구직 및 팀 페이지 개발

## 목표

오늘은 YkMake의 핵심 기능 중 하나인 구인/구직 페이지와 팀 페이지를 개발합니다. 이 페이지들은 개발자들이 서로 협업할 수 있는 기회를 제공하고, 팀을 구성하여 프로젝트를 진행할 수 있도록 돕는 중요한 역할을 합니다.

## 작업 목록

1. 구인/구직 목록 페이지 구현
2. 구인/구직 상세 페이지 구현
3. 팀 목록 페이지 구현
4. 팀 상세 페이지 구현

## 주요 구현 내용:

- 구인/구직 목록 페이지 - 직무별, 지역별 필터링 기능과 검색 기능을 포함
- 구인/구직 상세 페이지 - 상세한 채용 정보와 지원 기능 구현
- 팀 목록 페이지 - 프로젝트 분야별, 상태별 필터링과 검색 기능 포함
- 팀 상세 페이지 - 프로젝트 정보, 팀원 구성, 참여 신청 기능 구현

## 라우팅 구조 설명

이 프로젝트에서는 Remix 플랫 파일 라우팅 방식을 사용합니다. 경로는 다음과 같습니다:

```text
/jobs (jobs.tsx - RootLayout)
├── index.tsx (구인/구직 목록)
├── $jobId.tsx (구인/구직 상세)
└── new.tsx (구인 공고 등록)
/teams (teams.tsx - RootLayout)
├── index.tsx (팀 목록)
├── $teamId.tsx (팀 상세)
└── new.tsx (팀 생성)
```

## 구현 과정

### 1. 파일 생성

먼저 필요한 라우트 파일들을 생성합니다:

```bash
touch app/routes/jobs.tsx
touch app/routes/jobs._index.tsx
touch app/routes/jobs.$jobId.tsx
touch app/routes/jobs.new.tsx
touch app/routes/teams.tsx
touch app/routes/teams._index.tsx
touch app/routes/teams.$teamId.tsx
touch app/routes/teams.new.tsx
touch app/components/cards/job-card.tsx
touch app/components/cards/team-card.tsx
touch app/lib/types/job.ts
touch app/lib/types/team.ts
touch app/lib/data/mock-jobs.ts
touch app/lib/data/mock-teams.ts
```

### 2. 라우트 레이아웃 구현

구인/구직과 팀 페이지의 레이아웃 컴포넌트를 구현합니다:

#### jobs.tsx (최상위 레이아웃)

```typescript
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";

export default function JobsLayout() {
    return (
        <RootLayout>
            <Outlet />
        </RootLayout>
    );
}
```

#### teams.tsx (최상위 레이아웃)

```typescript
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";

export default function TeamsLayout() {
    return (
        <RootLayout>
            <Outlet />
        </RootLayout>
    );
}
```

### 3. 타입 정의

Job과 Team 타입을 정의합니다:

#### app/lib/types/job.ts

```typescript
export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  location: string;
  type: "정규직" | "계약직" | "인턴" | "프리랜서";
  salary: string;
  experienceLevel: string;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
  tags: string[];
  postedAt: string;
  deadline?: string;
  contactEmail: string;
  contactPhone?: string;
  status: "active" | "filled" | "expired";
}
```

#### app/lib/types/team.ts

```typescript
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
```

### 4. 목업 데이터 생성

#### app/lib/data/mock-jobs.ts

```typescript
import type { Job } from "~/lib/types/job";

export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "시니어 프론트엔드 개발자",
    company: "YkMake",
    companyLogo: "https://placehold.co/100x100?text=YkMake",
    description: "YkMake에서 웹 애플리케이션 개발에 참여할 시니어 프론트엔드 개발자를 찾고 있습니다.",
    location: "서울",
    type: "정규직",
    salary: "6000-8000만원",
    experienceLevel: "5년 이상",
    requirements: [
      "React, TypeScript 숙련자",
      "5년 이상의 프론트엔드 개발 경험",
      "웹 표준 및 웹 접근성에 대한 이해",
      "Git을 이용한 협업 경험"
    ],
    responsibilities: [
      "프론트엔드 아키텍처 설계 및 구현",
      "성능 최적화 및 코드 품질 개선",
      "주니어 개발자 멘토링",
      "신규 기술 검토 및 도입"
    ],
    benefits: [
      "유연근무제",
      "원격 근무 가능",
      "4대 보험",
      "연 2회 성과급",
      "점심 식대 제공",
      "업무 관련 도서 지원"
    ],
    tags: ["React", "TypeScript", "Next.js"],
    postedAt: "2023-05-15",
    deadline: "2023-06-15",
    contactEmail: "jobs@ykmake.com",
    contactPhone: "02-1234-5678",
    status: "active"
  },
  {
    id: "job-2",
    title: "백엔드 개발자",
    company: "YkMake",
    companyLogo: "https://placehold.co/100x100?text=YkMake",
    description: "YkMake에서 서버 애플리케이션 개발에 참여할 백엔드 개발자를 찾고 있습니다.",
    location: "원격",
    type: "계약직",
    salary: "4000-6000만원",
    experienceLevel: "3년 이상",
    requirements: [
      "Node.js, Python 기반 개발 경험",
      "RDBMS, NoSQL 활용 능력",
      "REST API 설계 및 개발 경험",
      "클라우드 서비스(AWS, GCP 등) 활용 경험"
    ],
    responsibilities: [
      "백엔드 API 개발 및 유지보수",
      "데이터베이스 설계 및 구현",
      "서버 인프라 관리",
      "백엔드 성능 최적화"
    ],
    benefits: [
      "유연근무제",
      "원격 근무 가능",
      "4대 보험",
      "업무 관련 도서 지원"
    ],
    tags: ["Node.js", "Python", "AWS"],
    postedAt: "2023-05-20",
    deadline: "2023-06-20",
    contactEmail: "jobs@ykmake.com",
    contactPhone: "02-1234-5678",
    status: "active"
  }
];

export function getAllJobs() {
  return mockJobs;
}

export function getJobById(id: string) {
  return mockJobs.find(job => job.id === id);
}

export function getJobsByLocation(location: string) {
  return mockJobs.filter(job => job.location.toLowerCase() === location.toLowerCase());
}

export function getJobsByType(type: string) {
  return mockJobs.filter(job => job.type.toLowerCase() === type.toLowerCase());
}

export function searchJobs(query: string) {
  const lowercaseQuery = query.toLowerCase();
  return mockJobs.filter(job => 
    job.title.toLowerCase().includes(lowercaseQuery) ||
    job.company.toLowerCase().includes(lowercaseQuery) ||
    job.description.toLowerCase().includes(lowercaseQuery) ||
    job.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}
```

#### app/lib/data/mock-teams.ts

```typescript
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
```

### 5. 카드 컴포넌트 구현

#### app/components/cards/job-card.tsx

```typescript
import { Link } from "@remix-run/react";
import { MapPin, Building, Briefcase, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { Job } from "~/lib/types/job";

interface JobCardProps extends Partial<Job> {}

export function JobCard({
  id,
  title,
  company,
  companyLogo,
  location,
  type,
  salary,
  tags,
  postedAt,
  deadline,
  status
}: JobCardProps) {
  // 포스팅 날짜 포맷팅
  const formattedDate = postedAt ? new Date(postedAt).toLocaleDateString() : null;
  
  // 마감일까지 남은 날짜 계산
  let daysLeft = null;
  if (deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // 회사 이니셜
  const companyInitials = company
    ? company
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "C";

  return (
    <Card className="h-full flex flex-col hover:border-primary/50 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={companyLogo} alt={company} />
              <AvatarFallback>{companyInitials}</AvatarFallback>
            </Avatar>
            <div>
              <Link to={`/jobs/${id}`} className="hover:text-primary transition-colors">
                <h3 className="font-bold text-lg">{title}</h3>
              </Link>
              <p className="text-muted-foreground text-sm">{company}</p>
            </div>
          </div>
          {status === "filled" && (
            <Badge variant="secondary">채용 완료</Badge>
          )}
          {status === "expired" && (
            <Badge variant="destructive">마감됨</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
          {type && (
            <div className="flex items-center gap-1">
              <Briefcase size={14} />
              <span>{type}</span>
            </div>
          )}
          {salary && (
            <div className="flex items-center gap-1">
              <Building size={14} />
              <span>{salary}</span>
            </div>
          )}
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <div className="flex justify-between items-center w-full">
          {daysLeft !== null && daysLeft > 0 ? (
            <span className="text-xs text-muted-foreground">
              마감까지 {daysLeft}일 남음
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {status === "active" ? "상시 채용" : ""}
            </span>
          )}
          
          <Button size="sm" variant="outline" asChild>
            <Link to={`/jobs/${id}`}>자세히 보기</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

#### app/components/cards/team-card.tsx

```typescript
import { Link } from "@remix-run/react";
import { Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import type { Team } from "~/lib/types/team";

interface TeamCardProps extends Partial<Team> { }

export function TeamCard({
    id,
    name,
    description,
    members,
    maxMembers,
    tags,
    status,
    category
}: TeamCardProps) {
    // 모집 상태에 따른 배지 스타일
    const statusVariantMap = {
        recruiting: "default",
        "in-progress": "secondary",
        completed: "outline"
    };

    const statusTextMap = {
        recruiting: "모집 중",
        "in-progress": "진행 중",
        completed: "완료됨"
    };

    const statusVariant = status ? statusVariantMap[status as keyof typeof statusVariantMap] : "default";
    const statusText = status ? statusTextMap[status as keyof typeof statusTextMap] : "";

    // 팀원 수 계산
    const memberCount = members?.length || 0;
    const memberPercentage = maxMembers ? (memberCount / maxMembers) * 100 : 0;

    return (
        <Card className="h-full flex flex-col hover:border-primary/50 transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        {category && (
                            <Badge variant="outline" className="mb-1">{category}</Badge>
                        )}
                        <Link to={`/teams/${id}`} className="hover:text-primary transition-colors">
                            <h3 className="font-bold text-lg">{name}</h3>
                        </Link>
                    </div>
                    {status && (
                        <Badge variant={statusVariant as "default" | "secondary" | "outline" | "destructive" | null | undefined}>{statusText}</Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                {description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {description}
                    </p>
                )}

                {maxMembers && (
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                                <Users size={14} />
                                팀원 {memberCount}/{maxMembers}
                            </span>
                            <span className="text-muted-foreground">
                                {memberPercentage.toFixed(0)}%
                            </span>
                        </div>
                        <Progress value={memberPercentage} className="h-2" />
                    </div>
                )}

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2">
                <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to={`/teams/${id}`}>자세히 보기</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
```

### 6. 구인/구직 라우트 구현

#### app/routes/jobs._index.tsx

```typescript
import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { JobCard } from "~/components/cards/job-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { getAllJobs } from "~/lib/data/mock-jobs";
import type { Job } from "~/lib/types/job";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "구인/구직 - YkMake" },
        { name: "description", content: "YkMake에서 함께할 동료를 찾아보세요" },
    ];
};

export async function loader() {
    const jobs = getAllJobs();
    return Response.json({ jobs });
}

export default function JobsIndex() {
    const { jobs } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="구인/구직"
                description="YkMake에서 함께할 동료를 찾아보세요"
            >
                <Button size="lg" asChild>
                    <a href="/jobs/new">구인 공고 등록</a>
                </Button>
            </PageHeader>

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Input placeholder="검색어를 입력하세요" />
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="모든 직무" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">모든 직무</SelectItem>
                            <SelectItem value="frontend">프론트엔드</SelectItem>
                            <SelectItem value="backend">백엔드</SelectItem>
                            <SelectItem value="fullstack">풀스택</SelectItem>
                            <SelectItem value="mobile">모바일</SelectItem>
                            <SelectItem value="devops">DevOps</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="모든 지역" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">모든 지역</SelectItem>
                            <SelectItem value="seoul">서울</SelectItem>
                            <SelectItem value="gyeonggi">경기</SelectItem>
                            <SelectItem value="remote">원격</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job: Job) => (
                        <JobCard key={job.id} {...job} />
                    ))}
                </div>
            </Section>
        </>
    );
}

```

#### app/routes/jobs.$jobId.tsx

```typescript
import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getJobById } from "~/lib/data/mock-jobs";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data || !data.job) {
        return [
            { title: "Job Not Found - YkMake" },
            { name: "description", content: "This job posting could not be found" },
        ];
    }

    return [
        { title: `${data.job.title} - ${data.job.company} - YkMake` },
        { name: "description", content: data.job.description },
    ];
};

export async function loader({ params }: LoaderFunctionArgs) {
    const job = getJobById(params.jobId as string);

    if (!job) {
        throw new Response("Job not found", { status: 404 });
    }

    return Response.json({ job });
}

export default function JobDetail() {
    const { job } = useLoaderData<typeof loader>();

    // 회사 이니셜
    const companyInitials = job.company
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <PageHeader
                title={job.title}
                description={job.company}
            >
                <Button size="lg">지원하기</Button>
            </PageHeader>

            <Section>
                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={job.companyLogo} alt={job.company} />
                            <AvatarFallback>{companyInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold">{job.company}</h2>
                            <p className="text-muted-foreground">{job.location} · {job.type}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                            <h3 className="font-semibold mb-1">근무 형태</h3>
                            <p>{job.type}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">연봉</h3>
                            <p>{job.salary}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">근무 지역</h3>
                            <p>{job.location}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">경력</h3>
                            <p>{job.experienceLevel}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">주요 업무</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            {job.responsibilities.map((responsibility: string, index: number) => (
                                <li key={index}>{responsibility}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">자격 요건</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            {job.requirements.map((requirement: string, index: number) => (
                                <li key={index}>{requirement}</li>
                            ))}
                        </ul>
                    </div>

                    {job.benefits && job.benefits.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">혜택 및 복지</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                {job.benefits.map((benefit: string, index: number) => (
                                    <li key={index}>{benefit}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">기술 스택</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.tags.map((tag: string, index: number) => (
                                <Badge key={index}>{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button size="lg">지원하기</Button>
                    </div>
                </Card>
            </Section>
        </>
    );
}
```
### 7. 팀 라우트 구현

#### app/routes/teams._index.tsx

```typescript
import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { TeamCard } from "~/components/cards/team-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { getAllTeams } from "~/lib/data/mock-teams";
import type { Team } from "~/lib/types/team";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "팀 찾기 - YkMake" },
        { name: "description", content: "YkMake에서 함께할 팀을 찾아보세요" },
    ];
};

export async function loader() {
    const teams = getAllTeams();
    return Response.json({ teams });
}

export default function TeamsIndex() {
    const { teams } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="팀 찾기"
                description="프로젝트를 함께할 팀을 찾거나 직접 만들어보세요"
            >
                <Button size="lg" asChild>
                    <a href="/teams/new">팀 만들기</a>
                </Button>
            </PageHeader>

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Input placeholder="검색어를 입력하세요" />
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="모든 카테고리" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">모든 카테고리</SelectItem>
                            <SelectItem value="ai">AI</SelectItem>
                            <SelectItem value="web">웹</SelectItem>
                            <SelectItem value="mobile">모바일</SelectItem>
                            <SelectItem value="blockchain">블록체인</SelectItem>
                            <SelectItem value="game">게임</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="모든 상태" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">모든 상태</SelectItem>
                            <SelectItem value="recruiting">모집 중</SelectItem>
                            <SelectItem value="in-progress">진행 중</SelectItem>
                            <SelectItem value="completed">완료됨</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team: Team) => (
                        <TeamCard key={team.id} {...team} />
                    ))}
                </div>
            </Section>
        </>
    );
}
```

#### app/routes/teams.$teamId.tsx

```typescript
import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Progress } from "~/components/ui/progress";
import { Users, Calendar, MessageSquare } from "lucide-react";
import { getTeamById } from "~/lib/data/mock-teams";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import type { TeamMember } from "~/lib/types/team";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data || !data.team) {
        return [
            { title: "Team Not Found - YkMake" },
            { name: "description", content: "This team could not be found" },
        ];
    }

    return [
        { title: `${data.team.name} - YkMake` },
        { name: "description", content: data.team.description },
    ];
};

export async function loader({ params }: LoaderFunctionArgs) {
    const team = getTeamById(params.teamId as string);

    if (!team) {
        throw new Response("Team not found", { status: 404 });
    }

    return Response.json({ team });
}

export default function TeamDetail() {
    const { team } = useLoaderData<typeof loader>();

    // 상태에 따른 배지 스타일
    const statusVariantMap = {
        recruiting: "default",
        "in-progress": "secondary",
        completed: "outline"
    };

    const statusTextMap = {
        recruiting: "모집 중",
        "in-progress": "진행 중",
        completed: "완료됨"
    };

    const statusVariant = statusVariantMap[team.status as keyof typeof statusVariantMap] || "default";
    const statusText = statusTextMap[team.status as keyof typeof statusTextMap] || "";

    // 팀원 수 계산
    const memberCount = team.members.length;
    const memberPercentage = (memberCount / team.maxMembers) * 100;

    // 날짜 포맷팅
    const formattedDate = new Date(team.createdAt).toLocaleDateString();

    return (
        <>
            <PageHeader
                title={team.name}
                description={team.description}
            >
                <div className="flex gap-2">
                    <Button size="lg" variant="outline">메시지 보내기</Button>
                    <Button size="lg">참여 신청</Button>
                </div>
            </PageHeader>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 왼쪽 사이드바 - 팀 정보 */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>팀 정보</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            팀원 {memberCount}/{team.maxMembers}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {memberPercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <Progress value={memberPercentage} className="h-2" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">카테고리</h3>
                                    <Badge>{team.category}</Badge>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">상태</h3>
                                    <Badge variant={statusVariant as "default" | "secondary" | "outline" | "destructive" | null | undefined}>{statusText}</Badge>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">생성일</h3>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar size={14} />
                                        <span>{formattedDate}</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">기술 스택</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {team.tags.map((tag: string, index: number) => (
                                            <Badge key={index} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>모집 중인 포지션</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {team.openPositions.map((position: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Badge variant="outline" className="w-2 h-2 p-0 rounded-full" />
                                            <span>{position}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 오른쪽 메인 컨텐츠 - 팀원 정보 */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>팀원</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {team.members.map((member: TeamMember) => (
                                        <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={member.avatarUrl} alt={member.name} />
                                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{member.name}</h3>
                                                    {member.isLeader && (
                                                        <Badge variant="secondary" className="text-xs">팀장</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="gap-1">
                                                <MessageSquare size={14} />
                                                <span>메시지</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>팀 소개</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line">{team.description}</p>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="lg">문의하기</Button>
                            <Button size="lg">참여 신청</Button>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
```

#### app/routes/jobs.new.tsx

```typescript
import { Form } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function NewJobPage() {
    return (
        <>
            <PageHeader
                title="구인 공고 등록"
                description="YkMake에서 함께할 팀원을 모집해보세요"
            />

            <Section>
                <Card>
                    <CardHeader>
                        <CardTitle>공고 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form method="post" className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">공고 제목</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="채용 포지션을 포함한 제목을 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="company">회사명</Label>
                                    <Input
                                        id="company"
                                        name="company"
                                        placeholder="회사 또는 팀 이름을 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="companyLogo">회사 로고 URL</Label>
                                    <Input
                                        id="companyLogo"
                                        name="companyLogo"
                                        placeholder="회사 로고 이미지 URL을 입력하세요 (선택사항)"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">간략한 설명</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="공고에 대한 간략한 설명을 입력하세요"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="location">근무 지역</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            placeholder="근무 지역을 입력하세요"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="type">근무 형태</Label>
                                        <Select name="type">
                                            <SelectTrigger>
                                                <SelectValue placeholder="선택하세요" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">선택하세요</SelectItem>
                                                <SelectItem value="정규직">정규직</SelectItem>
                                                <SelectItem value="계약직">계약직</SelectItem>
                                                <SelectItem value="인턴">인턴</SelectItem>
                                                <SelectItem value="프리랜서">프리랜서</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="salary">급여</Label>
                                        <Input
                                            id="salary"
                                            name="salary"
                                            placeholder="급여 범위를 입력하세요"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="experienceLevel">경력 요건</Label>
                                        <Input
                                            id="experienceLevel"
                                            name="experienceLevel"
                                            placeholder="필요 경력을 입력하세요"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="requirements">자격 요건</Label>
                                    <Textarea
                                        id="requirements"
                                        name="requirements"
                                        placeholder="자격 요건을 한 줄에 하나씩 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="responsibilities">주요 업무</Label>
                                    <Textarea
                                        id="responsibilities"
                                        name="responsibilities"
                                        placeholder="주요 업무를 한 줄에 하나씩 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="benefits">복리후생</Label>
                                    <Textarea
                                        id="benefits"
                                        name="benefits"
                                        placeholder="복리후생을 한 줄에 하나씩 입력하세요"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tags">기술 스택</Label>
                                    <Input
                                        id="tags"
                                        name="tags"
                                        placeholder="쉼표로 구분하여 입력하세요 (예: React, TypeScript, Node.js)"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="contactEmail">연락처 이메일</Label>
                                        <Input
                                            id="contactEmail"
                                            name="contactEmail"
                                            type="email"
                                            placeholder="지원자 연락처 이메일을 입력하세요"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="contactPhone">연락처 전화번호</Label>
                                        <Input
                                            id="contactPhone"
                                            name="contactPhone"
                                            placeholder="지원자 연락처 전화번호를 입력하세요 (선택사항)"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="deadline">마감일</Label>
                                        <Input
                                            id="deadline"
                                            name="deadline"
                                            type="date"
                                            placeholder="지원 마감일을 입력하세요 (선택사항)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <a href="/jobs">취소</a>
                                </Button>
                                <Button type="submit">등록하기</Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </Section>
        </>
    );
}
```

#### app/routes/teams.new.tsx

```typescript
import { Form } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function NewTeamPage() {
    return (
        <>
            <PageHeader
                title="팀 만들기"
                description="새로운 프로젝트를 위한 팀을 구성해보세요"
            />

            <Section>
                <Card>
                    <CardHeader>
                        <CardTitle>팀 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form method="post" className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">팀 이름</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="팀 이름을 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">팀 소개</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="팀과 프로젝트에 대한 설명을 입력하세요"
                                        rows={5}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">카테고리</Label>
                                    <Select name="category">
                                        <SelectTrigger>
                                            <SelectValue placeholder="선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">선택하세요</SelectItem>
                                            <SelectItem value="AI">AI</SelectItem>
                                            <SelectItem value="웹">웹</SelectItem>
                                            <SelectItem value="모바일">모바일</SelectItem>
                                            <SelectItem value="블록체인">블록체인</SelectItem>
                                            <SelectItem value="게임">게임</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="maxMembers">최대 팀원 수</Label>
                                    <Input
                                        id="maxMembers"
                                        name="maxMembers"
                                        type="number"
                                        min="2"
                                        defaultValue="5"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="openPositions">모집 포지션</Label>
                                    <Textarea
                                        id="openPositions"
                                        name="openPositions"
                                        placeholder="모집하는 포지션을 한 줄에 하나씩 입력하세요 (예: 프론트엔드 개발자 - 1명)"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tags">기술 스택</Label>
                                    <Input
                                        id="tags"
                                        name="tags"
                                        placeholder="쉼표로 구분하여 입력하세요 (예: React, TypeScript, Node.js)"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <a href="/teams">취소</a>
                                </Button>
                                <Button type="submit">등록하기</Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </Section>
        </>
    );
}
```

## 구현 결과 및 결론

Day 8에서는 YkMake 플랫폼의 중요한 기능인 구인/구직 및 팀 관리 기능을 구현했습니다. 주요 작업 내용은 다음과 같습니다:

1. 구인/구직 목록 페이지 구현
2. 구인/구직 상세 페이지 구현
3. 구인 공고 등록 페이지 구현
4. 팀 목록 페이지 구현
5. 팀 상세 페이지 구현
6. 팀 생성 페이지 구현
7. Job 및 Team 관련 데이터 모델 정의
8. 필요한 컴포넌트 구현 (JobCard, TeamCard 등)

이 구현을 통해 YkMake 플랫폼 사용자들은 다음과 같은 기능을 활용할 수 있게 되었습니다:
- 다양한 직무와 지역별로 구인/구직 정보 검색 및 필터링
- 상세한 채용 정보 확인 및 지원 기능
- 프로젝트 분야별, 상태별 팀 검색 및 필터링
- 팀 정보 확인 및 참여 신청
- 구인 공고 등록 및 팀 생성

이러한 기능은 YkMake가 단순한 프로젝트 공유 플랫폼을 넘어 실질적인 협업과 네트워킹이 가능한 메이커 커뮤니티로 발전하는데 핵심적인 역할을 합니다.

## 다음 단계

개발 서버를 실행하여 구현한 구인/구직 및 팀 관리 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/jobs - 구인/구직 목록 페이지
- http://localhost:3000/jobs/job-1 - 구인/구직 상세 페이지
- http://localhost:3000/jobs/new - 구인 공고 등록 페이지
- http://localhost:3000/teams - 팀 목록 페이지
- http://localhost:3000/teams/team-1 - 팀 상세 페이지
- http://localhost:3000/teams/new - 팀 생성 페이지

다음 단계에서는 YkMake 플랫폼의 사용자 경험을 더욱 향상시키기 위한 채팅 및 메시지 기능과 알림 시스템을 구현할 예정입니다. 이를 통해 사용자들은 실시간으로 소통하고 중요한 이벤트에 대한 알림을 받을 수 있게 될 것입니다.