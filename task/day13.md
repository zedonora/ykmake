# Day 13: 검색 및 필터링 기능 개발

## 목표

오늘은 YkMake의 검색 및 필터링 기능을 개발합니다. 사용자들이 원하는 정보를 쉽게 찾을 수 있도록 다양한 검색 옵션과 필터를 구현합니다.

## 작업 목록

1. 통합 검색 컴포넌트 구현
2. 제품 필터링 기능 구현
3. 팀 필터링 기능 구현
4. 검색 결과 페이지 구현

## 1. 통합 검색 컴포넌트 구현

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
            <CommandItem onSelect={() => navigate("/settings/appearance")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>테마</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

## 2. 제품 필터링 기능 구현

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
  );
}
```

## 3. 팀 필터링 기능 구현

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
  );
}
```

## 4. 검색 결과 페이지 구현

통합 검색 결과를 보여주는 페이지를 구현합니다.

### 검색 결과 페이지 컴포넌트 생성

`app/routes/search.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "검색 결과 - YkMake" },
    { name: "description", content: "YkMake에서 검색 결과를 확인하세요" },
  ];
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <RootLayout>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Input
            className="max-w-xl"
            placeholder="검색어를 입력하세요"
            defaultValue={query}
          />
          <Button>검색</Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">AI 챗봇</h3>
                    <p className="text-sm text-muted-foreground">
                      OpenAI API를 활용한 대화형 AI 챗봇
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">조회수 523</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">팀</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">AI 개발팀</h3>
                    <p className="text-sm text-muted-foreground">
                      AI 기반 제품 개발 팀
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">8명의 멤버</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">사용자</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">홍길동</h3>
                    <p className="text-sm text-muted-foreground">
                      프론트엔드 개발자
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">12개의 제품</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">AI 챗봇</h3>
                    <p className="text-sm text-muted-foreground">
                      OpenAI API를 활용한 대화형 AI 챗봇
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">조회수 523</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">AI 개발팀</h3>
                    <p className="text-sm text-muted-foreground">
                      AI 기반 제품 개발 팀
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">8명의 멤버</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">홍길동</h3>
                    <p className="text-sm text-muted-foreground">
                      프론트엔드 개발자
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">12개의 제품</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RootLayout>
  );
}
```

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