# Day 13: 검색 및 필터링 기능 개발

## 목표

오늘은 YkMake의 검색 및 필터링 기능을 개발합니다. 사용자들이 원하는 정보를 쉽게 찾을 수 있도록 다양한 검색 옵션과 필터를 구현합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성합니다:

```bash
# 검색 관련 라우트
touch app/routes/search.tsx
touch app/routes/search.products.tsx
touch app/routes/search.teams.tsx
touch app/routes/search.users.tsx

# 검색 컴포넌트
mkdir -p app/components/search
touch app/components/search/command-menu.tsx
touch app/components/search/search-nav.tsx

# 필터 컴포넌트
mkdir -p app/components/products
mkdir -p app/components/teams
touch app/components/products/product-filters.tsx
touch app/components/teams/team-filters.tsx

# 타입 정의 파일
touch app/lib/types/search.ts
touch app/lib/types/filters.ts

# 목업 데이터
touch app/lib/data/mock-search.ts
```

## shadcn 컴포넌트 추가

```bash
npx shadcn@latest add command
npx shadcn@latest add popover
npx shadcn@latest add badge
```

## 작업 목록

1. 타입 정의
2. 목업 데이터 구현
3. 통합 검색 컴포넌트 구현
4. 제품 필터링 기능 구현
5. 팀 필터링 기능 구현
6. 검색 결과 페이지 구현

## 1. 타입 정의

타입 정의를 위한 파일을 생성합니다.

### 검색 관련 타입 정의

`app/lib/types/search.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
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
```

### 필터 관련 타입 정의

`app/lib/types/filters.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
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
```

## 2. 목업 데이터 구현

목업 데이터를 사용하여 실제 API 연동 전에 UI를 개발합니다.

### 검색 데이터 생성

`app/lib/data/mock-search.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
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
```

## 3. 통합 검색 컴포넌트 구현

전체 사이트에서 사용할 수 있는 통합 검색 컴포넌트를 구현합니다.

### 통합 검색 컴포넌트 생성

`app/components/search/command-menu.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import * as React from "react";
import { useNavigate } from "@remix-run/react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import ClientOnly from "~/components/ui/client-only";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <ClientOnly>
      <>
        <p className="text-sm text-muted-foreground">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </p>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="무엇을 찾으시나요?" />
          <CommandList>
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
            <CommandGroup heading="추천">
              <CommandItem onSelect={() => navigate("/products")}>
                <span>제품 둘러보기</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/teams")}>
                <span>팀 찾기</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/jobs")}>
                <span>구인/구직</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="설정">
              <CommandItem onSelect={() => navigate("/settings/account")}>
                <User className="mr-2 h-4 w-4" />
                <span>계정</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/settings/notifications")}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>알림</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/settings/search")}>
                <Search className="mr-2 h-4 w-4" />
                <span>설정 검색</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    </ClientOnly>
  );
}
```

## 4. 검색 네비게이션 컴포넌트 구현

검색 결과 페이지에서 사용할 네비게이션 컴포넌트를 구현합니다.

### 검색 네비게이션 컴포넌트 생성

`app/components/search/search-nav.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { useLocation, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import ClientOnly from "~/components/ui/client-only";

interface SearchNavProps {
  className?: string;
}

export function SearchNav({ className }: SearchNavProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    const path = location.pathname;
    if (path === "/search") {
      setActiveTab("all");
    } else if (path.includes("/search/products")) {
      setActiveTab("products");
    } else if (path.includes("/search/teams")) {
      setActiveTab("teams");
    } else if (path.includes("/search/users")) {
      setActiveTab("users");
    }
  }, [location]);

  return (
    <ClientOnly>
      <div className={cn("flex flex-wrap p-2 bg-muted rounded-lg", className)}>
        <Button
          variant={activeTab === "all" ? "default" : "ghost"}
          asChild
          className="flex-1 justify-center"
        >
          <Link to="/search">전체</Link>
        </Button>
        <Button
          variant={activeTab === "products" ? "default" : "ghost"}
          asChild
          className="flex-1 justify-center"
        >
          <Link to="/search/products">제품</Link>
        </Button>
        <Button
          variant={activeTab === "teams" ? "default" : "ghost"}
          asChild
          className="flex-1 justify-center"
        >
          <Link to="/search/teams">팀</Link>
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          asChild
          className="flex-1 justify-center"
        >
          <Link to="/search/users">사용자</Link>
        </Button>
      </div>
    </ClientOnly>
  );
}
```

## 5. 제품 필터링 기능 구현

제품 목록 페이지에 필터링 기능을 추가합니다.

### 제품 필터 컴포넌트 생성

`app/components/products/product-filters.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import ClientOnly from "~/components/ui/client-only";

const categories = [
  { value: "all", label: "전체" },
  { value: "web", label: "웹" },
  { value: "mobile", label: "모바일" },
  { value: "ai", label: "AI" },
  { value: "blockchain", label: "블록체인" },
];

const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "views", label: "조회순" },
];

export function ProductFilters() {
  const [category, setCategory] = React.useState("");
  const [sort, setSort] = React.useState("latest");
  const [open, setOpen] = React.useState(false);
  const [openSort, setOpenSort] = React.useState(false);

  return (
    <ClientOnly>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {category
                  ? categories.find((cat) => cat.value === category)?.label
                  : "카테고리"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="카테고리 검색..." />
                <CommandEmpty>카테고리를 찾을 수 없습니다.</CommandEmpty>
                <CommandGroup>
                  {categories.map((cat) => (
                    <CommandItem
                      key={cat.value}
                      onSelect={() => {
                        setCategory(cat.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          category === cat.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {cat.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {category && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setCategory("")}
            >
              {categories.find((cat) => cat.value === category)?.label} ✕
            </Badge>
          )}
        </div>

        <Popover open={openSort} onOpenChange={setOpenSort}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openSort}
              className="w-[150px] justify-between"
            >
              {sortOptions.find((option) => option.value === sort)?.label}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[150px] p-0">
            <Command>
              <CommandGroup>
                {sortOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      setSort(option.value);
                      setOpenSort(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        sort === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </ClientOnly>
  );
}
```

## 6. 팀 필터링 기능 구현

팀 목록 페이지에 필터링 기능을 추가합니다.

### 팀 필터 컴포넌트 생성

`app/components/teams/team-filters.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import ClientOnly from "~/components/ui/client-only";

const categories = [
  { value: "all", label: "전체" },
  { value: "development", label: "개발" },
  { value: "design", label: "디자인" },
  { value: "planning", label: "기획" },
  { value: "marketing", label: "마케팅" },
];

const statuses = [
  { value: "all", label: "전체" },
  { value: "recruiting", label: "모집 중" },
  { value: "in-progress", label: "진행 중" },
  { value: "completed", label: "완료" },
];

export function TeamFilters() {
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((cat) => cat !== value)
        : [...prev, value]
    );
  };

  return (
    <ClientOnly>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategories.includes(category.value) ? "default" : "outline"}
              onClick={() => toggleCategory(category.value)}
              className="h-8"
            >
              {category.label}
              {selectedCategories.includes(category.value) && (
                <Check className="ml-2 h-4 w-4" />
              )}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status.value}
              variant={selectedStatus === status.value ? "default" : "outline"}
              onClick={() => setSelectedStatus(status.value)}
              className="h-8"
            >
              {status.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="팀 이름 또는 설명 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {(selectedCategories.length > 0 || selectedStatus !== "all" || searchQuery) && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleCategory(cat)}
              >
                {categories.find((c) => c.value === cat)?.label} ✕
              </Badge>
            ))}
            {selectedStatus !== "all" && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSelectedStatus("all")}
              >
                {statuses.find((s) => s.value === selectedStatus)?.label} ✕
              </Badge>
            )}
            {searchQuery && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSearchQuery("")}
              >
                검색: {searchQuery} ✕
              </Badge>
            )}
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
```

## 7. 검색 결과 페이지 구현

통합 검색 결과를 보여주는 페이지를 구현합니다.

### 검색 결과 페이지 컴포넌트 생성

`app/routes/search.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { RootLayout } from "~/components/layouts/root-layout";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { SearchNav } from "~/components/search/search-nav";
import { search } from "~/lib/data/mock-search";
import type { SearchResult } from "~/lib/types/search";

export const meta: MetaFunction = () => {
  return [
    { title: "검색 결과 - YkMake" },
    { name: "description", content: "YkMake에서 검색 결과를 확인하세요" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "all";

  const results = search(query, type);
  return { results, query, type };
}

export default function SearchResults() {
  const { results, query, type } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(query);

  return (
    <RootLayout>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Input
            className="max-w-xl"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button>검색</Button>
        </div>

        <div className="mb-8">
          <SearchNav />
        </div>

        <Tabs defaultValue={type} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="products">제품</TabsTrigger>
            <TabsTrigger value="teams">팀</TabsTrigger>
            <TabsTrigger value="users">사용자</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">제품</h2>
              <div className="space-y-4">
                {results.results
                  .filter((result) => result.type === "product")
                  .map((result) => (
                    <div key={result.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        조회수 {result.metadata?.views}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">팀</h2>
              <div className="space-y-4">
                {results.results
                  .filter((result) => result.type === "team")
                  .map((result) => (
                    <div key={result.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.metadata?.members}명의 멤버
                      </p>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">사용자</h2>
              <div className="space-y-4">
                {results.results
                  .filter((result) => result.type === "user")
                  .map((result) => (
                    <div key={result.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.metadata?.products}개의 제품
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6">
              <div className="space-y-4">
                {results.results
                  .filter((result) => result.type === "product")
                  .map((result) => (
                    <div key={result.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        조회수 {result.metadata?.views}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card className="p-6">
              <div className="space-y-4">
                {results.results
                  .filter((result) => result.type === "team")
                  .map((result) => (
                    <div key={result.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.metadata?.members}명의 멤버
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="space-y-4">
                {results.results
                  .filter((result) => result.type === "user")
                  .map((result) => (
                    <div key={result.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.metadata?.products}개의 제품
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RootLayout>
  );
}
```

## 8. 검색 기능 구현 완료

이제 검색 기능이 완성되었습니다! 다음 URL들을 통해 새로 만든 검색 기능을 테스트해볼 수 있습니다:

### 1. 통합 검색 페이지
- URL: http://localhost:3000/search?q=AI
- 기능: 헤더에 추가된 ⌘K 단축키를 통해 검색 메뉴를 띄우고 통합 검색 기능 이용
- 구현 방식: Command+K(맥) 또는 Ctrl+K(윈도우) 키를 누르면 전체 페이지에서 검색 기능 사용 가능

### 2. 검색 결과 페이지
- URL: http://localhost:3000/search
- 기능: 통합 검색 결과에서 제품, 팀, 사용자 등 탭별로 결과 확인 가능
- 구성: 상단 검색창, 탭 네비게이션, 검색 결과 카드로 구성

### 구현 내용
1. 루트 레이아웃에 검색 버튼 및 명령어 메뉴 추가
2. 검색 관련 타입 정의 및 목업 데이터 구현
3. 검색 페이지와 네비게이션 컴포넌트 구현
4. shadcn UI 컴포넌트 활용

이제 애플리케이션에서 전역 검색(⌘+K)을 사용하거나 직접 검색 페이지로 이동하여 검색 결과를 확인할 수 있습니다. 실제 검색 결과는 현재 목업 데이터를 기반으로 표시됩니다.

## 다음 단계

이제 검색 및 필터링 기능의 기본적인 UI가 완성되었습니다! 다음 단계에서는 API 연동 및 데이터베이스 작업을 진행하여 실제 데이터를 사용할 수 있도록 만들 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL들을 통해 새로 만든 페이지들을 확인할 수 있습니다:
- `http://localhost:3000/search?q=AI`
- `http://localhost:3000/products` (필터 적용)
- `http://localhost:3000/teams` (필터 적용) 