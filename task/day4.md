# Day 4: 제품 리스팅 페이지

## 목표

오늘은 YkMake 플랫폼의 제품 리스팅 페이지를 개발합니다. 제품 라우트를 구성하고, 리더보드 페이지를 구현하며, 데이터 로더 함수를 설정하여 타입 안전성을 확보합니다.

## 작업 목록

1. 제품 라우트 구성
2. 리더보드 페이지 구현
3. 데이터 로더 함수 설정
4. 타입 안전성 확보

## 1. 제품 라우트 구성

제품 관련 라우트를 구성하여 사용자가 제품을 찾아보기 쉽게 합니다.

### 제품 라우트 구조

제품 페이지의 라우트 구조는 다음과 같습니다:

- `/products` - 제품 메인 페이지
- `/products/leaderboard` - 리더보드 페이지
- `/products/leaderboard/daily` - 일간 리더보드
- `/products/leaderboard/weekly` - 주간 리더보드
- `/products/leaderboard/monthly` - 월간 리더보드
- `/products/categories/:category` - 카테고리별 제품 목록
- `/products/search` - 제품 검색 페이지
- `/products/:slug` - 제품 상세 페이지

### 제품 라우트 파일 생성 (Flat 라우팅 방식)

Remix의 플랫 라우팅 방식을 사용하여 제품 관련 라우트 파일들을 생성합니다:

```bash
touch app/routes/products.tsx
touch app/routes/products._index.tsx
touch app/routes/products.leaderboard.tsx
touch app/routes/products.leaderboard._index.tsx
touch app/routes/products.leaderboard.daily.tsx
touch app/routes/products.leaderboard.weekly.tsx
touch app/routes/products.leaderboard.monthly.tsx
touch app/routes/products.categories.\$category.tsx
touch app/routes/products.search.tsx
touch app/routes/products.\$slug.tsx
```

> **참고**: Remix v2는 플랫 라우팅 방식을 권장합니다. 이 방식은 파일명만으로 URL 구조를 명확하게 표현하며, 정적 라우트와 동적 라우트 간의 충돌을 자연스럽게 해결합니다. 예를 들어, `products.new.tsx`는 `/products/new` URL에 매핑되며, `products.$slug.tsx`는 `/products/:slug` URL에 매핑됩니다.

## 2. 리더보드 페이지 구현

지금은 실제 데이터베이스 연동 전이므로, 임시 데이터를 사용하여 UI를 구현합니다.

### 제품 레이아웃 (products.tsx)

제품 페이지의 레이아웃 컴포넌트를 생성합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";

export default function ProductsLayout() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
}
```

### 리더보드 레이아웃 (products.leaderboard.tsx)

리더보드 페이지의 레이아웃 컴포넌트를 생성합니다:

```typescript
import { Outlet } from "@remix-run/react";

export default function LeaderboardLayout() {
  return <Outlet />;
}
```

> **참고**: 레이아웃 중첩을 방지하기 위해 `products.tsx`에서만 `RootLayout`을 사용하고, `products.leaderboard.tsx`에서는 `Outlet`만 사용합니다. 하위 페이지들에서도 각각 `RootLayout`을 제거하고 Fragment(`<>...</>`)를 사용합니다. 이렇게 하면 헤더와 푸터가 중복되는 문제를 방지할 수 있습니다.

### 타입 시스템 설정

먼저 제품 타입을 중앙에서 관리하기 위해 타입 파일을 생성합니다:

```bash
mkdir -p app/lib/types
touch app/lib/types/product.ts
```

`app/lib/types/product.ts` 파일에 Product 인터페이스를 정의합니다:

```typescript
export interface Product {
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
```

### 임시 데이터 생성

`app/lib/data/mock-products.ts` 파일을 생성하여 임시 제품 데이터를 추가합니다:

```typescript
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
```

### 제품 메인 페이지 (products._index.tsx)

제품 메인 페이지를 구현합니다:

```typescript
import { useLoaderData } from "@remix-run/react";
import { getFeaturedProducts, getLatestProducts, getAllCategories } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Link } from "@remix-run/react";
import { ArrowRight } from "lucide-react";

export async function loader() {
  const featuredProducts = getFeaturedProducts();
  const latestProducts = getLatestProducts(6);
  const allCategories = getAllCategories();
  
  return Response.json({
    featuredProducts,
    latestProducts,
    allCategories,
  });
}

export default function ProductsIndexPage() {
  const { featuredProducts, latestProducts, allCategories } = useLoaderData<typeof loader>();
  
  return (
    <>
      <PageHeader 
        title="제품 탐색"
        description="YkMake 커뮤니티에서 개발자들이 만든 다양한 제품을 발견하세요."
      >
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/products/submit">제품 등록하기</Link>
          </Button>
        </div>
      </PageHeader>
      
      {featuredProducts.length > 0 && (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">주목할 제품</h2>
            <Link to="/products/leaderboard" className="text-sm font-medium text-primary inline-flex items-center">
              모든 인기 제품 보기 <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product: Product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </Section>
      )}
      
      <Section className="bg-muted/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">최신 제품</h2>
          <Link to="/products/leaderboard/latest" className="text-sm font-medium text-primary inline-flex items-center">
            더 보기 <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestProducts.map((product: Product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </Section>
      
      <Section>
        <h2 className="text-2xl font-bold mb-6">카테고리별 탐색</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allCategories.map((category: string) => (
            <Link
              key={category}
              to={`/products/categories/${category.toLowerCase()}`}
              className="bg-background hover:bg-muted transition-colors rounded-lg border p-4 text-center"
            >
              <span className="font-medium">{category}</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
```

### 리더보드 메인 페이지 (products.leaderboard._index.tsx)

리더보드 메인 페이지를 구현합니다:

```typescript
import { Link, useLoaderData } from "@remix-run/react";
import { mockProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export async function loader() {
  // 업보트 순으로 정렬
  const popularProducts = [...mockProducts].sort((a, b) => b.upvotes - a.upvotes);
  
  return Response.json({
    popularProducts,
  });
}

export default function LeaderboardIndexPage() {
  const { popularProducts } = useLoaderData<typeof loader>();
  
  return (
    <>
      <PageHeader 
        title="제품 리더보드"
        description="YkMake 커뮤니티에서 인기 있는 제품들을 살펴보세요."
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild size="sm">
            <Link to="/products">전체 제품</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/products/submit">제품 등록하기</Link>
          </Button>
        </div>
      </PageHeader>
      
      <Section>
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="daily" asChild>
                <Link to="/products/leaderboard/daily">일간</Link>
              </TabsTrigger>
              <TabsTrigger value="weekly" asChild>
                <Link to="/products/leaderboard/weekly">주간</Link>
              </TabsTrigger>
              <TabsTrigger value="monthly" asChild>
                <Link to="/products/leaderboard/monthly">월간</Link>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProducts.map((product: Product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
```

### 일간 리더보드 페이지 (products.leaderboard.daily.tsx)

일간 리더보드 페이지를 구현합니다:

```typescript
import { Link, useLoaderData } from "@remix-run/react";
import { mockProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export async function loader() {
  // 실제로는 현재 날짜 기준으로 필터링해야 하지만, 목업 데이터이므로 랜덤하게 선택
  const dailyProducts = [...mockProducts]
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .sort((a, b) => b.upvotes - a.upvotes);
  
  return Response.json({
    dailyProducts,
  });
}

export default function LeaderboardDailyPage() {
  const { dailyProducts } = useLoaderData<typeof loader>();
  
  return (
    <>
      <PageHeader 
        title="일간 리더보드"
        description="오늘 가장 인기 있는 제품들을 확인하세요."
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild size="sm">
            <Link to="/products">전체 제품</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/products/submit">제품 등록하기</Link>
          </Button>
        </div>
      </PageHeader>
      
      <Section>
        <Tabs defaultValue="daily" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all" asChild>
                <Link to="/products/leaderboard">전체</Link>
              </TabsTrigger>
              <TabsTrigger value="daily">일간</TabsTrigger>
              <TabsTrigger value="weekly" asChild>
                <Link to="/products/leaderboard/weekly">주간</Link>
              </TabsTrigger>
              <TabsTrigger value="monthly" asChild>
                <Link to="/products/leaderboard/monthly">월간</Link>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="daily" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dailyProducts.map((product: Product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
```

### 주간 리더보드 페이지 (products.leaderboard.weekly.tsx)

주간 리더보드 페이지를 구현합니다:

```typescript
import { Link, useLoaderData } from "@remix-run/react";
import { mockProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export async function loader() {
  // 실제로는 현재 주 기준으로 필터링해야 하지만, 목업 데이터이므로 랜덤하게 선택
  const weeklyProducts = [...mockProducts]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)
    .sort((a, b) => b.upvotes - a.upvotes);
  
  return Response.json({
    weeklyProducts,
  });
}

export default function LeaderboardWeeklyPage() {
  const { weeklyProducts } = useLoaderData<typeof loader>();
  
  return (
    <>
      <PageHeader 
        title="주간 리더보드"
        description="이번 주 가장 인기 있는 제품들을 확인하세요."
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild size="sm">
            <Link to="/products">전체 제품</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/products/submit">제품 등록하기</Link>
          </Button>
        </div>
      </PageHeader>
      
      <Section>
        <Tabs defaultValue="weekly" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all" asChild>
                <Link to="/products/leaderboard">전체</Link>
              </TabsTrigger>
              <TabsTrigger value="daily" asChild>
                <Link to="/products/leaderboard/daily">일간</Link>
              </TabsTrigger>
              <TabsTrigger value="weekly">주간</TabsTrigger>
              <TabsTrigger value="monthly" asChild>
                <Link to="/products/leaderboard/monthly">월간</Link>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="weekly" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weeklyProducts.map((product: Product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
```

### 월간 리더보드 페이지 (products.leaderboard.monthly.tsx)

월간 리더보드 페이지를 구현합니다:

```typescript
import { Link, useLoaderData } from "@remix-run/react";
import { mockProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export async function loader() {
  // 실제로는 현재 월 기준으로 필터링해야 하지만, 목업 데이터이므로 랜덤하게 선택
  const monthlyProducts = [...mockProducts]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .sort((a, b) => b.upvotes - a.upvotes);
  
  return Response.json({
    monthlyProducts,
  });
}

export default function LeaderboardMonthlyPage() {
  const { monthlyProducts } = useLoaderData<typeof loader>();
  
  return (
    <>
      <PageHeader 
        title="월간 리더보드"
        description="이번 달 가장 인기 있는 제품들을 확인하세요."
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild size="sm">
            <Link to="/products">전체 제품</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/products/submit">제품 등록하기</Link>
          </Button>
        </div>
      </PageHeader>
      
      <Section>
        <Tabs defaultValue="monthly" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all" asChild>
                <Link to="/products/leaderboard">전체</Link>
              </TabsTrigger>
              <TabsTrigger value="daily" asChild>
                <Link to="/products/leaderboard/daily">일간</Link>
              </TabsTrigger>
              <TabsTrigger value="weekly" asChild>
                <Link to="/products/leaderboard/weekly">주간</Link>
              </TabsTrigger>
              <TabsTrigger value="monthly">월간</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="monthly" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthlyProducts.map((product: Product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
```

### 제품 상세 페이지 (products.$slug.tsx)

제품 상세 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { RootLayout } from "~/components/layouts/root-layout";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <RootLayout>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <div className="bg-muted/40 p-4 rounded text-center">
                                <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                <div className="mt-2">
                                    <Button asChild size="sm">
                                        <Link to="/auth/login">로그인하기</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <Button asChild className="w-full">
                                    <Link to="/auth/register">무료로 가입하기</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </RootLayout>
    );
}
```

### 제품 검색 페이지 (products.search.tsx)

제품 검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

## 3. 데이터 로더 함수 설정

Remix의 데이터 로딩 패턴을 활용하여 UI와 데이터를 연결합니다.

### 데이터 로더 함수와 Response.json

Remix v2에서는 기존의 `json` 함수 대신 `Response.json()`을 사용하는 것이 권장됩니다. 이는 Web API와의 일관성을 위한 변경사항입니다.

```typescript
// 이전 방식 (deprecated)
import { json } from "@remix-run/node";
return json({ data });

// 새로운 방식
return Response.json({ data });
```

### 타입 안전한 로더 함수 패턴

TypeScript와 Remix의 패턴을 활용하여 타입 안전한 데이터 로딩을 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Product } from "~/lib/types/product";

export async function loader({ params }: LoaderFunctionArgs) {
  // ... load data
  return Response.json({ data });
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>();
  
  // data는 타입 안전성이 보장됨
}
```

## 4. 타입 안전성 확보

TypeScript를 활용하여 데이터 타입을 명확히 정의하고, 타입 안전성을 확보합니다.

### 중앙 집중식 타입 관리

타입을 중앙에서 관리하면 코드의 일관성을 유지하고 재사용성을 높일 수 있습니다. `app/lib/types` 디렉토리에 도메인별 타입을 정의하고, 필요한 곳에서 import하여 사용합니다.

```typescript
// app/lib/types/product.ts
export interface Product {
  // ... properties
}

// app/routes/products.categories.$category.tsx
import { Product } from "~/lib/types/product";

// products.map((product: Product) => ...)
```

## 다음 단계

이제 제품 리스팅 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 페이지네이션과 필터링 기능을 추가하여 제품 리스팅 페이지를 더욱 개선할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/products - 제품 메인 페이지
- http://localhost:3000/products/leaderboard - 리더보드 페이지
- http://localhost:3000/products/leaderboard/daily - 일간 리더보드
- http://localhost:3000/products/categories/생산성 - 카테고리별 제품 목록
- http://localhost:3000/products/search?q=개발 - 제품 검색 페이지
- http://localhost:3000/products/devnote - 제품 상세 페이지
```

### UI 컴포넌트 추가

Tabs 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add tabs
```

### 제품 상세 페이지 (products.$slug.tsx)

제품 상세 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <div className="bg-muted/40 p-4 rounded text-center">
                                <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                <div className="mt-2">
                                    <Button asChild size="sm">
                                        <Link to="/auth/login">로그인하기</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <Button asChild className="w-full">
                                    <Link to="/auth/register">무료로 가입하기</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
```

### 제품 검색 페이지 (products.search.tsx)

제품 검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

## 3. 데이터 로더 함수 설정

Remix의 데이터 로딩 패턴을 활용하여 UI와 데이터를 연결합니다.

### 데이터 로더 함수와 Response.json

Remix v2에서는 기존의 `json` 함수 대신 `Response.json()`을 사용하는 것이 권장됩니다. 이는 Web API와의 일관성을 위한 변경사항입니다.

```typescript
// 이전 방식 (deprecated)
import { json } from "@remix-run/node";
return json({ data });

// 새로운 방식
return Response.json({ data });
```

### 타입 안전한 로더 함수 패턴

TypeScript와 Remix의 패턴을 활용하여 타입 안전한 데이터 로딩을 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Product } from "~/lib/types/product";

export async function loader({ params }: LoaderFunctionArgs) {
  // ... load data
  return Response.json({ data });
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>();
  
  // data는 타입 안전성이 보장됨
}
```

## 4. 타입 안전성 확보

TypeScript를 활용하여 데이터 타입을 명확히 정의하고, 타입 안전성을 확보합니다.

### 중앙 집중식 타입 관리

타입을 중앙에서 관리하면 코드의 일관성을 유지하고 재사용성을 높일 수 있습니다. `app/lib/types` 디렉토리에 도메인별 타입을 정의하고, 필요한 곳에서 import하여 사용합니다.

```typescript
// app/lib/types/product.ts
export interface Product {
  // ... properties
}

// app/routes/products.categories.$category.tsx
import { Product } from "~/lib/types/product";

// products.map((product: Product) => ...)
```

## 다음 단계

이제 제품 리스팅 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 페이지네이션과 필터링 기능을 추가하여 제품 리스팅 페이지를 더욱 개선할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/products - 제품 메인 페이지
- http://localhost:3000/products/leaderboard - 리더보드 페이지
- http://localhost:3000/products/leaderboard/daily - 일간 리더보드
- http://localhost:3000/products/categories/생산성 - 카테고리별 제품 목록
- http://localhost:3000/products/search?q=개발 - 제품 검색 페이지
- http://localhost:3000/products/devnote - 제품 상세 페이지
```

### UI 컴포넌트 추가

Tabs 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add tabs
```

### 제품 상세 페이지 (products.$slug.tsx)

제품 상세 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <div className="bg-muted/40 p-4 rounded text-center">
                                <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                <div className="mt-2">
                                    <Button asChild size="sm">
                                        <Link to="/auth/login">로그인하기</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <Button asChild className="w-full">
                                    <Link to="/auth/register">무료로 가입하기</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
```

### 제품 검색 페이지 (products.search.tsx)

제품 검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

### UI 컴포넌트 추가

Tabs 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add tabs
```

### 제품 상세 페이지 (products.$slug.tsx)

제품 상세 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <div className="bg-muted/40 p-4 rounded text-center">
                                <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                <div className="mt-2">
                                    <Button asChild size="sm">
                                        <Link to="/auth/login">로그인하기</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <Button asChild className="w-full">
                                    <Link to="/auth/register">무료로 가입하기</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
```

### 제품 검색 페이지 (products.search.tsx)

제품 검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

## 3. 데이터 로더 함수 설정

Remix의 데이터 로딩 패턴을 활용하여 UI와 데이터를 연결합니다.

### 데이터 로더 함수와 Response.json

Remix v2에서는 기존의 `json` 함수 대신 `Response.json()`을 사용하는 것이 권장됩니다. 이는 Web API와의 일관성을 위한 변경사항입니다.

```typescript
// 이전 방식 (deprecated)
import { json } from "@remix-run/node";
return json({ data });

// 새로운 방식
return Response.json({ data });
```

### 타입 안전한 로더 함수 패턴

TypeScript와 Remix의 패턴을 활용하여 타입 안전한 데이터 로딩을 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Product } from "~/lib/types/product";

export async function loader({ params }: LoaderFunctionArgs) {
  // ... load data
  return Response.json({ data });
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>();
  
  // data는 타입 안전성이 보장됨
}
```

## 4. 타입 안전성 확보

TypeScript를 활용하여 데이터 타입을 명확히 정의하고, 타입 안전성을 확보합니다.

### 중앙 집중식 타입 관리

타입을 중앙에서 관리하면 코드의 일관성을 유지하고 재사용성을 높일 수 있습니다. `app/lib/types` 디렉토리에 도메인별 타입을 정의하고, 필요한 곳에서 import하여 사용합니다.

```typescript
// app/lib/types/product.ts
export interface Product {
  // ... properties
}

// app/routes/products.categories.$category.tsx
import { Product } from "~/lib/types/product";

// products.map((product: Product) => ...)
```

## 다음 단계

이제 제품 리스팅 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 페이지네이션과 필터링 기능을 추가하여 제품 리스팅 페이지를 더욱 개선할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/products - 제품 메인 페이지
- http://localhost:3000/products/leaderboard - 리더보드 페이지
- http://localhost:3000/products/leaderboard/daily - 일간 리더보드
- http://localhost:3000/products/categories/생산성 - 카테고리별 제품 목록
- http://localhost:3000/products/search?q=개발 - 제품 검색 페이지
- http://localhost:3000/products/devnote - 제품 상세 페이지
```

### UI 컴포넌트 추가

Tabs 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add tabs
```

### 제품 상세 페이지 (products.$slug.tsx)

제품 상세 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <div className="bg-muted/40 p-4 rounded text-center">
                                <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                <div className="mt-2">
                                    <Button asChild size="sm">
                                        <Link to="/auth/login">로그인하기</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <Button asChild className="w-full">
                                    <Link to="/auth/register">무료로 가입하기</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
```

### 제품 검색 페이지 (products.search.tsx)

제품 검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

## 3. 데이터 로더 함수 설정

Remix의 데이터 로딩 패턴을 활용하여 UI와 데이터를 연결합니다.

### 데이터 로더 함수와 Response.json

Remix v2에서는 기존의 `json` 함수 대신 `Response.json()`을 사용하는 것이 권장됩니다. 이는 Web API와의 일관성을 위한 변경사항입니다.

```typescript
// 이전 방식 (deprecated)
import { json } from "@remix-run/node";
return json({ data });

// 새로운 방식
return Response.json({ data });
```

### 타입 안전한 로더 함수 패턴

TypeScript와 Remix의 패턴을 활용하여 타입 안전한 데이터 로딩을 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Product } from "~/lib/types/product";

export async function loader({ params }: LoaderFunctionArgs) {
  // ... load data
  return Response.json({ data });
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>();
  
  // data는 타입 안전성이 보장됨
}
```

## 4. 타입 안전성 확보

TypeScript를 활용하여 데이터 타입을 명확히 정의하고, 타입 안전성을 확보합니다.

### 중앙 집중식 타입 관리

타입을 중앙에서 관리하면 코드의 일관성을 유지하고 재사용성을 높일 수 있습니다. `app/lib/types` 디렉토리에 도메인별 타입을 정의하고, 필요한 곳에서 import하여 사용합니다.

```typescript
// app/lib/types/product.ts
export interface Product {
  // ... properties
}

// app/routes/products.categories.$category.tsx
import { Product } from "~/lib/types/product";

// products.map((product: Product) => ...)
```

## 다음 단계

이제 제품 리스팅 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 페이지네이션과 필터링 기능을 추가하여 제품 리스팅 페이지를 더욱 개선할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/products - 제품 메인 페이지
- http://localhost:3000/products/leaderboard - 리더보드 페이지
- http://localhost:3000/products/leaderboard/daily - 일간 리더보드
- http://localhost:3000/products/categories/생산성 - 카테고리별 제품 목록
- http://localhost:3000/products/search?q=개발 - 제품 검색 페이지
- http://localhost:3000/products/devnote - 제품 상세 페이지
```

### UI 컴포넌트 추가

Tabs 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add tabs
```

### 제품 상세 페이지 (products.$slug.tsx)

제품 상세 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <div className="bg-muted/40 p-4 rounded text-center">
                                <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                <div className="mt-2">
                                    <Button asChild size="sm">
                                        <Link to="/auth/login">로그인하기</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <Button asChild className="w-full">
                                    <Link to="/auth/register">무료로 가입하기</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
```

### 제품 검색 페이지 (products.search.tsx)

제품 검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

## 3. 데이터 로더 함수 설정

Remix의 데이터 로딩 패턴을 활용하여 UI와 데이터를 연결합니다.

### 데이터 로더 함수와 Response.json

Remix v2에서는 기존의 `json` 함수 대신 `Response.json()`을 사용하는 것이 권장됩니다. 이는 Web API와의 일관성을 위한 변경사항입니다.

```typescript
// 이전 방식 (deprecated)
import { json } from "@remix-run/node";
return json({ data });

// 새로운 방식
return Response.json({ data });
```

### 타입 안전한 로더 함수 패턴

TypeScript와 Remix의 패턴을 활용하여 타입 안전한 데이터 로딩을 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Product } from "~/lib/types/product";

export async function loader({ params }: LoaderFunctionArgs) {
  // ... load data
  return Response.json({ data });
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>();
  
  // data는 타입 안전성이 보장됨
}
```

## 4. 타입 안전성 확보

TypeScript를 활용하여 데이터 타입을 명확히 정의하고, 타입 안전성을 확보합니다.

### 중앙 집중식 타입 관리

타입을 중앙에서 관리하면 코드의 일관성을 유지하고 재사용성을 높일 수 있습니다. `app/lib/types` 디렉토리에 도메인별 타입을 정의하고, 필요한 곳에서 import하여 사용합니다.

```typescript
// app/lib/types/product.ts
export interface Product {
  // ... properties
}

// app/routes/products.categories.$category.tsx
import { Product } from "~/lib/types/product";

// products.map((product: Product) => ...)
```

## 다음 단계

이제 제품 리스팅 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 페이지네이션과 필터링 기능을 추가하여 제품 리스팅 페이지를 더욱 개선할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/products - 제품 메인 페이지
- http://localhost:3000/products/leaderboard - 리더보드 페이지
- http://localhost:3000/products/leaderboard/daily - 일간 리더보드
- http://localhost:3000/products/categories/생산성 - 카테고리별 제품 목록
- http://localhost:3000/products/search?q=개발 - 제품 검색 페이지
- http://localhost:3000/products/devnote - 제품 상세 페이지
```

### UI 컴포넌트 추가

Tabs 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add tabs
```

### 제품 상세 페이지 (products.$slug.tsx)

제품 상세 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <div className="bg-muted/40 p-4 rounded text-center">
                                <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                <div className="mt-2">
                                    <Button asChild size="sm">
                                        <Link to="/auth/login">로그인하기</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <Button asChild className="w-full">
                                    <Link to="/auth/register">무료로 가입하기</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
```

### 제품 검색 페이지 (products.search.tsx)

제품 검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

## 3. 데이터 로더 함수 설정

Remix의 데이터 로딩 패턴을 활용하여 UI와 데이터를 연결합니다.

### 데이터 로더 함수와 Response.json

Remix v2에서는 기존의 `json` 함수 대신 `Response.json()`을 사용하는 것이 권장됩니다. 이는 Web API와의 일관성을 위한 변경사항입니다.

```typescript
// 이전 방식 (deprecated)
import { json } from "@remix-run/node";
return json({ data });

// 새로운 방식
return Response.json({ data });
```

### 타입 안전한 로더 함수 패턴

TypeScript와 Remix의 패턴을 활용하여 타입 안전한 데이터 로딩을 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Product } from "~/lib/types/product";

export async function loader({ params }: LoaderFunctionArgs) {
  // ... load data
  return Response.json({ data });
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>();
  
  // data는 타입 안전성이 보장됨
}
```

## 4. 타입 안전성 확보

TypeScript를 활용하여 데이터 타입을 명확히 정의하고, 타입 안전성을 확보합니다.

### 중앙 집중식 타입 관리

타입을 중앙에서 관리하면 코드의 일관성을 유지하고 재사용성을 높일 수 있습니다. `app/lib/types` 디렉토리에 도메인별 타입을 정의하고, 필요한 곳에서 import하여 사용합니다.

```typescript
// app/lib/types/product.ts
export interface Product {
  // ... properties
}

// app/routes/products.categories.$category.tsx
import { Product } from "~/lib/types/product";

// products.map((product: Product) => ...)
```

## 다음 단계

이제 제품 리스팅 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 페이지네이션과 필터링 기능을 추가하여 제품 리스팅 페이지를 더욱 개선할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/products - 제품 메인 페이지
- http://localhost:3000/products/leaderboard - 리더보드 페이지
- http://localhost:3000/products/leaderboard/daily - 일간 리더보드
- http://localhost:3000/products/categories/생산성 - 카테고리별 제품 목록
- http://localhost:3000/products/search?q=개발 - 제품 검색 페이지
- http://localhost:3000/products/devnote - 제품 상세 페이지
```

### UI 컴포넌트 추가

Tabs 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add tabs
```

### 제품 상세 페이지 (products.$slug.tsx)

제품 상세 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <div className="bg-muted/40 p-4 rounded text-center">
                                <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                <div className="mt-2">
                                    <Button asChild size="sm">
                                        <Link to="/auth/login">로그인하기</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <Button asChild className="w-full">
                                    <Link to="/auth/register">무료로 가입하기</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
```

### 제품 검색 페이지 (products.search.tsx)

제품 검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

## 3. 데이터 로더 함수 설정

Remix의 데이터 로딩 패턴을 활용하여 UI와 데이터를 연결합니다.

### 데이터 로더 함수와 Response.json

Remix v2에서는 기존의 `json` 함수 대신 `Response.json()`을 사용하는 것이 권장됩니다. 이는 Web API와의 일관성을 위한 변경사항입니다.

```typescript
// 이전 방식 (deprecated)
import { json } from "@remix-run/node";
return json({ data });

// 새로운 방식
return Response.json({ data });
```

### 타입 안전한 로더 함수 패턴

TypeScript와 Remix의 패턴을 활용하여 타입 안전한 데이터 로딩을 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Product } from "~/lib/types/product";

export async function loader({ params }: LoaderFunctionArgs) {
  // ... load data
  return Response.json({ data });
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>();
  
  // data는 타입 안전성이 보장됨
}
```

## 4. 타입 안전성 확보

TypeScript를 활용하여 데이터 타입을 명확히 정의하고, 타입 안전성을 확보합니다.

### 중앙 집중식 타입 관리

타입을 중앙에서 관리하면 코드의 일관성을 유지하고 재사용성을 높일 수 있습니다. `app/lib/types` 디렉토리에 도메인별 타입을 정의하고, 필요한 곳에서 import하여 사용합니다.

```typescript
// app/lib/types/product.ts
export interface Product {
  // ... properties
}

// app/routes/products.categories.$category.tsx
import { Product } from "~/lib/types/product";

// products.map((product: Product) => ...)
```

## 다음 단계

이제 제품 리스팅 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 페이지네이션과 필터링 기능을 추가하여 제품 리스팅 페이지를 더욱 개선할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/products - 제품 메인 페이지
- http://localhost:3000/products/leaderboard - 리더보드 페이지
- http://localhost:3000/products/leaderboard/daily - 일간 리더보드
- http://localhost:3000/products/categories/생산성 - 카테고리별 제품 목록
- http://localhost:3000/products/search?q=개발 - 제품 검색 페이지
- http://localhost:3000/products/devnote - 제품 상세 페이지
```

### UI 컴포넌트 추가

Tabs 컴포넌트가 필요하므로 Shadcn UI에서 가져옵니다:

```bash
npx shadcn@latest add tabs
```

### 제품 상세 페이지 (products.$slug.tsx)

제품 상세 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProductBySlug, getPopularProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("Not Found", { status: 404 });
    }

    const product = getProductBySlug(slug);

    if (!product) {
        throw new Response("Not Found", { status: 404 });
    }

    const relatedProducts = getPopularProducts(3);

    return Response.json({
        product,
        relatedProducts,
    });
}

export default function ProductDetailPage() {
    const { product, relatedProducts } = useLoaderData<typeof loader>();

    const initials = product.authorName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <div className="bg-muted/20 border-b">
                <div className="container py-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link to="/products" className="inline-flex items-center">
                            <ArrowLeft size={16} className="mr-1" />
                            제품 목록으로 돌아가기
                        </Link>
                    </Button>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="aspect-video rounded-lg overflow-hidden mb-6">
                            <img
                                src={product.imageUrl || "https://placehold.co/600x400/png"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <div className="text-sm text-muted-foreground">
                                출시일: {product.launchDate}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.authorImageUrl} alt={product.authorName} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <span className="font-medium">{product.authorName}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">{product.description}</p>

                            {/* 실제 제품에서는 여기에 더 많은 내용이 들어갈 수 있습니다 */}
                            <p>이 섹션은 제품에 대한 상세한 설명을 포함하게 됩니다. 실제 구현 시에는 마크다운이나 리치 텍스트 형식으로 저장된 내용을 렌더링할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <Button className="inline-flex items-center">
                                <ThumbsUp size={16} className="mr-2" />
                                업보트 ({product.upvotes})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <MessageSquare size={16} className="mr-2" />
                                댓글 ({product.comments})
                            </Button>
                            <Button variant="outline" className="inline-flex items-center">
                                <Share2 size={16} className="mr-2" />
                                공유하기
                            </Button>
                        </div>

                        {/* 댓글 섹션 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">댓글</h2>
                            <div className="bg-muted/40 p-4 rounded text-center">
                                <p className="text-muted-foreground">댓글을 보려면 로그인하세요.</p>
                                <div className="mt-2">
                                    <Button asChild size="sm">
                                        <Link to="/auth/login">로그인하기</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-20">
                            <div className="bg-muted/20 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-bold mb-4">관련 제품</h2>
                                <div className="space-y-4">
                                    {relatedProducts.map((relatedProduct: Product) => (
                                        <div key={relatedProduct.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <Link
                                                to={`/products/${relatedProduct.slug}`}
                                                className="text-base font-medium hover:text-primary"
                                            >
                                                {relatedProduct.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-bold mb-4">더 많은 제품을 보고 싶으신가요?</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    YkMake 커뮤니티에 참여하여 다양한 제품을 발견하고 개발자들과 소통하세요.
                                </p>
                                <Button asChild className="w-full">
                                    <Link to="/auth/register">무료로 가입하기</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
```

### 제품 검색 페이지 (products.search.tsx)

제품 검색 페이지를 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { searchProducts } from "~/lib/data/mock-products";
import { Product } from "~/lib/types/product";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProductCard } from "~/components/cards/product-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Search, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    const products = query ? searchProducts(query) : [];

    return Response.json({
        query,
        products,
    });
}

export default function SearchPage() {
    const { query, products } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    return (
        <>
            <PageHeader
                title="제품 검색"
                description="원하는 제품을 찾아보세요."
            >
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products" className="inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" />
                        전체 제품
                    </Link>
                </Button>
            </PageHeader>

            <Section>
                <Form method="get" className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="제품명, 설명, 카테고리 등으로 검색"
                                className="pl-8"
                                defaultValue={searchParams.get("q") || ""}
                            />
                        </div>
                        <Button type="submit">검색</Button>
                    </div>
                </Form>

                {query && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium">
                            "{query}" 검색 결과 <span className="text-muted-foreground">({products.length}개)</span>
                        </h2>
                    </div>
                )}

                {query && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: Product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            '{query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">검색어를 입력하세요</h3>
                        <p className="text-muted-foreground">
                            제품명, 설명, 카테고리 등으로 검색할 수 있습니다.
                        </p>
                    </div>
                )}
            </Section>
        </>
    );
}
```

## 3. 데이터 로더 함수 설정

Remix의 데이터 로딩 패턴을 활용하여 UI와 데이터를 연결합니다.

### 데이터 로더 함수와 Response.json

Remix v2에서는 기존의 `json` 함수 대신 `Response.json()`을 사용하는 것이 권장됩니다. 이는 Web API와의 일관성을 위한 변경사항입니다.

```typescript
// 이전 방식 (deprecated)
import { json } from "@remix-run/node";
return json({ data });

// 새로운 방식
return Response.json({ data });
```

### 타입 안전한 로더 함수 패턴

TypeScript와 Remix의 패턴을 활용하여 타입 안전한 데이터 로딩을 구현합니다:

```typescript
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Product } from "~/lib/types/product";

export async function loader({ params }: LoaderFunctionArgs) {
  // ... load data
  return Response.json({ data });
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>();
  
  // data는 타입 안전성이 보장됨
}
```

## 4. 타입 안전성 확보

TypeScript를 활용하여 데이터 타입을 명확히 정의하고, 타입 안전성을 확보합니다.

### 중앙 집중식 타입 관리

타입을 중앙에서 관리하면 코드의 일관성을 유지하고 재사용성을 높일 수 있습니다. `app/lib/types` 디렉토리에 도메인별 타입을 정의하고, 필요한 곳에서 import하여 사용합니다.

```typescript
// app/lib/types/product.ts
export interface Product {
  // ... properties
}

// app/routes/products.categories.$category.tsx
import { Product } from "~/lib/types/product";

// products.map((product: Product) => ...)
```

## 다음 단계

이제 제품 리스팅 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 페이지네이션과 필터링 기능을 추가하여 제품 리스팅 페이지를 더욱 개선할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/products - 제품 메인 페이지
- http://localhost:3000/products/leaderboard - 리더보드 페이지
- http://localhost:3000/products/leaderboard/daily - 일간 리더보드
- http://localhost:3000/products/categories/생산성 - 카테고리별 제품 목록
- http://localhost:3000/products/search?q=개발 - 제품