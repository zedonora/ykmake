# Day 3: 카드 컴포넌트 개발

## 목표

오늘은 YkMake 플랫폼의 핵심 콘텐츠를 표시하기 위한 다양한 카드 컴포넌트를 개발합니다. 제품 카드, 게시글 카드, IdeasGPT 카드, 구인/구직 카드, 팀 카드 등을 구현하여 사이트의 핵심 콘텐츠를 시각적으로 표현합니다.

## 작업 목록

1. 제품 카드 구현
2. 게시글 카드 구현
3. IdeasGPT 카드 구현
4. 구인/구직 카드 구현
5. 팀 카드 구현

## 1. 제품 카드 구현

제품 카드는 제품의 이미지, 제목, 설명, 카테고리, 업보트 수, 댓글 수 등을 보여줍니다.

### 제품 카드 컴포넌트 생성

`app/components/cards/product-card.tsx` 파일을 생성합니다:

```typescript
import { Link } from "@remix-run/react";
import { 
  ArrowUpRight, 
  MessageSquare, 
  ThumbsUp, 
  Users2 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  upvotes: number;
  comments: number;
  authorName: string;
  authorImageUrl?: string;
  launchDate: string;
  slug: string;
  featured?: boolean;
}

export function ProductCard({
  id,
  title,
  description,
  imageUrl,
  category,
  upvotes,
  comments,
  authorName,
  authorImageUrl,
  launchDate,
  slug,
  featured = false,
}: ProductCardProps) {
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className={`overflow-hidden ${featured ? 'border-primary/50 shadow-md' : ''}`}>
      <div className="aspect-video relative overflow-hidden">
        <img
          src={imageUrl || "https://placehold.co/600x400/png"}
          alt={title}
          className="object-cover w-full h-full"
        />
        {featured && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              주목할 제품
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2">
              {category}
            </Badge>
            <CardTitle className="text-xl">
              <Link 
                to={`/products/${slug}`} 
                className="hover:underline hover:text-primary transition-colors"
              >
                {title}
              </Link>
            </CardTitle>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center text-sm text-muted-foreground">
          <span>출시일: {launchDate}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={authorImageUrl} alt={authorName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm font-medium">{authorName}</div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <ThumbsUp size={18} className="mr-1" />
            <span className="text-xs">{upvotes}</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MessageSquare size={18} className="mr-1" />
            <span className="text-xs">{comments}</span>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/products/${slug}`} className="inline-flex items-center">
              보기 <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

### Badge 컴포넌트 추가

Badge 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add badge
npx shadcn@latest add avatar
```

## 2. 게시글 카드 구현

게시글 카드는 게시글의 제목, 내용 미리보기, 작성자, 작성일, 댓글 수, 좋아요 수 등을 보여줍니다.

### 게시글 카드 컴포넌트 생성

`app/components/cards/post-card.tsx` 파일을 생성합니다:

```typescript
import { Link } from "@remix-run/react";
import { Calendar, MessageSquare, ThumbsUp } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export interface PostCardProps {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorImageUrl?: string;
  publishedAt: string;
  likes: number;
  comments: number;
  tags: string[];
  slug: string;
  isPinned?: boolean;
}

export function PostCard({
  id,
  title,
  content,
  authorName,
  authorImageUrl,
  publishedAt,
  likes,
  comments,
  tags,
  slug,
  isPinned = false,
}: PostCardProps) {
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className={`${isPinned ? 'border-primary/50 shadow-sm' : ''}`}>
      <CardHeader className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.slice(0, 3).map((tag) => (
            <Link key={tag} to={`/community/categories/${tag.toLowerCase()}`}>
              <Badge variant="secondary" className="hover:bg-secondary/80">
                {tag}
              </Badge>
            </Link>
          ))}
          {isPinned && (
            <Badge variant="outline" className="bg-primary/5 text-primary">
              공지
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl">
          <Link 
            to={`/community/${slug}`}
            className="hover:underline hover:text-primary transition-colors"
          >
            {title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2 mt-2">
          {content}
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={authorImageUrl} alt={authorName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{authorName}</div>
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar size={12} className="mr-1" />
              {publishedAt}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground inline-flex items-center">
            <ThumbsUp size={14} className="mr-1" />
            {likes}
          </span>
          <span className="text-sm text-muted-foreground inline-flex items-center">
            <MessageSquare size={14} className="mr-1" />
            {comments}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/community/${slug}`} className="inline-flex items-center">
              읽기 <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

## 3. IdeasGPT 카드 구현

IdeasGPT 카드는 AI가 생성한 아이디어를 표시합니다.

### IdeasGPT 카드 컴포넌트 생성

`app/components/cards/idea-card.tsx` 파일을 생성합니다:

```typescript
import { Link } from "@remix-run/react";
import { ArrowUpRight, Calendar, Save, Share2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export interface IdeaCardProps {
  id: string;
  title: string;
  description: string;
  categories: string[];
  generatedAt: string;
  slug: string;
  isBookmarked?: boolean;
}

export function IdeaCard({
  id,
  title,
  description,
  categories,
  generatedAt,
  slug,
  isBookmarked = false,
}: IdeaCardProps) {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {categories.map((category) => (
            <Badge key={category} variant="outline">
              {category}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-xl">
          <Link 
            to={`/ideas/${slug}`}
            className="hover:underline hover:text-primary transition-colors"
          >
            {title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription className="line-clamp-3">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 border-t flex flex-wrap justify-between gap-2">
        <div className="text-xs text-muted-foreground flex items-center">
          <Calendar size={12} className="mr-1" />
          {generatedAt}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="저장">
            <Save size={16} className={isBookmarked ? "fill-primary text-primary" : ""} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="공유">
            <Share2 size={16} />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/ideas/${slug}`} className="inline-flex items-center">
              자세히 <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

## 4. 구인/구직 카드 구현

구인/구직 카드는 구인/구직 게시글의 정보를 표시합니다.

### 구인/구직 카드 컴포넌트 생성

`app/components/cards/job-card.tsx` 파일을 생성합니다:

```typescript
import { Link } from "@remix-run/react";
import { ArrowUpRight, Briefcase, Calendar, MapPin } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export interface JobCardProps {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  jobType: "full-time" | "part-time" | "contract" | "freelance" | "remote";
  postedAt: string;
  skills: string[];
  slug: string;
  salary?: string;
  isFeatured?: boolean;
}

export function JobCard({
  id,
  title,
  companyName,
  companyLogo,
  location,
  jobType,
  postedAt,
  skills,
  slug,
  salary,
  isFeatured = false,
}: JobCardProps) {
  const companyInitials = companyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
    
  const jobTypeColors: Record<string, string> = {
    "full-time": "bg-blue-100 text-blue-800",
    "part-time": "bg-purple-100 text-purple-800",
    "contract": "bg-amber-100 text-amber-800",
    "freelance": "bg-green-100 text-green-800",
    "remote": "bg-cyan-100 text-cyan-800",
  };
  
  const jobTypeLabels: Record<string, string> = {
    "full-time": "정규직",
    "part-time": "계약직",
    "contract": "프리랜서",
    "freelance": "아르바이트",
    "remote": "원격",
  };

  return (
    <Card className={`${isFeatured ? 'border-primary/50 shadow-md' : ''}`}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={companyLogo} alt={companyName} />
              <AvatarFallback>{companyInitials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                <Link 
                  to={`/jobs/${slug}`}
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {title}
                </Link>
              </CardTitle>
              <CardDescription className="font-medium text-foreground/80">
                {companyName}
              </CardDescription>
            </div>
          </div>
          {isFeatured && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
          <Badge variant="outline" className={`${jobTypeColors[jobType]} border-0`}>
            {jobTypeLabels[jobType]}
          </Badge>
          <span className="flex items-center">
            <MapPin size={14} className="mr-1" />
            {location}
          </span>
          {salary && (
            <span className="font-medium text-foreground">
              {salary}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-secondary/50">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t flex flex-wrap justify-between items-center gap-2">
        <div className="text-xs text-muted-foreground flex items-center">
          <Calendar size={12} className="mr-1" />
          {postedAt} 게시
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/jobs/${slug}`} className="inline-flex items-center">
            지원하기 <ArrowUpRight size={14} className="ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## 5. 팀 카드 구현

팀 카드는 팀 정보와 모집 현황을 표시합니다.

### 팀 카드 컴포넌트 생성

`app/components/cards/team-card.tsx` 파일을 생성합니다:

```typescript
import { Link } from "@remix-run/react";
import { ArrowUpRight, Calendar, Users } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Progress } from "~/components/ui/progress";

export interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
}

export interface TeamCardProps {
  id: string;
  name: string;
  description: string;
  teamLogo?: string;
  skills: string[];
  members: TeamMember[];
  maxMembers: number;
  lookingFor: string[];
  createdAt: string;
  slug: string;
}

export function TeamCard({
  id,
  name,
  description,
  teamLogo,
  skills,
  members,
  maxMembers,
  lookingFor,
  createdAt,
  slug,
}: TeamCardProps) {
  const nameInitials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
    
  const progress = (members.length / maxMembers) * 100;

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={teamLogo} alt={name} />
            <AvatarFallback>{nameInitials}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl">
            <Link 
              to={`/teams/${slug}`}
              className="hover:underline hover:text-primary transition-colors"
            >
              {name}
            </Link>
          </CardTitle>
        </div>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">팀원</span>
            <span className="font-medium">{members.length}/{maxMembers}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">모집 분야</h4>
          <div className="flex flex-wrap gap-2">
            {lookingFor.map((role) => (
              <Badge key={role} variant="outline" className="bg-primary/5">
                {role}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">기술 스택</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-secondary/50">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t flex flex-wrap justify-between items-center gap-2">
        <div className="text-xs text-muted-foreground flex items-center">
          <Calendar size={12} className="mr-1" />
          {createdAt} 생성
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/teams/${slug}`} className="inline-flex items-center">
            상세 정보 <ArrowUpRight size={14} className="ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Progress 컴포넌트 추가

Progress 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add progress
```

## 파일 구조 및 라우팅 업데이트

이제 카드 컴포넌트들을 준비했으니, 실제 페이지에서 이 컴포넌트들을 사용하기 위한 파일 구조를 업데이트합니다.

### Remix의 플랫 라우팅 구조

Remix v2에서는 플랫 라우팅 방식을 사용하여 URL 경로와 파일 이름을 직접적으로 매핑할 수 있습니다. 이를 통해 파일 구조만 보고도 URL 구조를 쉽게 이해할 수 있습니다.

```
app/routes/
├── _index.tsx               # / (메인 페이지)
├── products.tsx             # /products (레이아웃)
├── products._index.tsx      # /products (컨텐츠)
├── products.$slug.tsx       # /products/:slug
├── community.tsx            # /community (레이아웃)
├── community._index.tsx     # /community (컨텐츠)
├── community.$slug.tsx      # /community/:slug
├── ideas.tsx                # /ideas (레이아웃)
├── ideas._index.tsx         # /ideas (컨텐츠)
├── ideas.$slug.tsx          # /ideas/:slug
├── jobs.tsx                 # /jobs (레이아웃)
├── jobs._index.tsx          # /jobs (컨텐츠)
├── jobs.$slug.tsx           # /jobs/:slug
├── teams.tsx                # /teams (레이아웃)
├── teams._index.tsx         # /teams (컨텐츠)
└── teams.$slug.tsx          # /teams/:slug
```

이러한 파일 구조에서 각 페이지는 해당 경로의 데이터를 로드하고, 앞서 만든 카드 컴포넌트들을 활용하여 콘텐츠를 렌더링합니다. 예를 들어, `products._index.tsx`는 제품 목록을 가져와 `ProductCard` 컴포넌트를 사용하여 표시합니다.

### 중첩 레이아웃 구현

Remix의 플랫 라우팅에서도 중첩 레이아웃을 구현할 수 있습니다. 예를 들어 `products.tsx`는 레이아웃을 제공하고, `products._index.tsx`는 해당 레이아웃 내에서 콘텐츠를 표시합니다:

```typescript
// app/routes/products.tsx
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";

export default function ProductsLayout() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
}

// app/routes/products._index.tsx
import { useLoaderData } from "@remix-run/react";
import { ProductCard } from "~/components/cards/product-card";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";

export async function loader() {
  // 제품 데이터 로드
  return Response.json({ products: [] });
}

export default function ProductsIndexPage() {
  const { products } = useLoaderData<typeof loader>();
  
  return (
    <>
      <PageHeader 
        title="제품 탐색"
        description="다양한 개발자 제품을 발견하세요."
      />
      
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </Section>
    </>
  );
}
```

## 다음 단계

오늘은 YkMake 플랫폼의 핵심 콘텐츠를 표시하기 위한 다양한 카드 컴포넌트들을 구현했습니다. 내일은 이 컴포넌트들을 활용하여 제품 리스팅 페이지를 개발하겠습니다.

다음을 실행하여 오늘의 변경사항을 확인해보세요:

```bash
npm run dev
```