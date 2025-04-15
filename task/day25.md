# Day 25: 검색 기능 강화 및 필터링/정렬 옵션 추가

## 목표

사용자가 원하는 정보를 더 쉽고 빠르게 찾을 수 있도록 검색 기능을 강화하고, 다양한 목록 페이지에 필터링 및 정렬 옵션을 추가합니다.

## 작업 목록

1. 통합 검색 컴포넌트 개선 (예: 자동 완성, 검색 범위 지정)
2. 목록 페이지 필터링 UI 구현 (예: 카테고리, 태그, 상태)
3. 목록 페이지 정렬 UI 구현 (예: 최신순, 인기순, 관련도순)
4. 백엔드(Loader)에서 검색, 필터링, 정렬 파라미터 처리 로직 구현

## 파일 생성 명령어

!!!bash
mkdir -p app/components/search app/components/filters app/components/sorting app/utils/search
touch app/components/search/GlobalSearchInput.tsx # 기존 CommandMenu 개선 또는 대체
touch app/components/filters/CategoryFilter.tsx
touch app/components/filters/TagFilter.tsx
touch app/components/filters/StatusFilter.tsx # (필요시)
touch app/components/sorting/SortDropdown.tsx
touch app/utils/search/search.server.ts # 검색 관련 서버 로직
touch app/utils/search/filter.server.ts # 필터링 관련 서버 로직
touch app/utils/search/sort.server.ts # 정렬 관련 서버 로직
# 기존 목록 페이지 (app/routes/products._index.tsx, app/routes/posts._index.tsx, app/routes/teams._index.tsx 등) 및 해당 loader 수정 필요
# CommandMenu (app/components/search/command-menu.tsx) 수정 또는 교체 필요
!!!

## 필수 라이브러리 설치 (및 도구)

검색 기능 구현 방식에 따라 추가 라이브러리가 필요할 수 있습니다.
- **Algolia:** `npm install algoliasearch react-instantsearch-hooks-web`
- **MeiliSearch:** `npm install meilisearch instant-meilisearch`
- **Supabase Full-Text Search:** 별도 라이브러리 불필요, Supabase 클라이언트 사용

필터링/정렬 UI 구현을 위해 Radix UI 또는 Shadcn/ui 컴포넌트 (Select, DropdownMenu, Checkbox 등)를 활용합니다.

## 1. 통합 검색 컴포넌트 개선

기존의 `CommandMenu` 또는 새로운 `GlobalSearchInput` 컴포넌트를 개선하여, 검색 범위를 지정하거나 자동 완성 기능을 추가하는 것을 고려합니다. 여기서는 간단한 입력 필드 형태의 개선 예시를 보여줍니다.

### 통합 검색 입력 컴포넌트 (`GlobalSearchInput.tsx` 예시)

!!!typescript
import { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export function GlobalSearchInput() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchScope, setSearchScope] = useState('all'); // 검색 범위 (all, products, posts, teams 등)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // 검색 페이지로 이동하거나, 범위에 따라 해당 목록 페이지로 이동
      const searchParams = new URLSearchParams({
        query: searchTerm.trim(),
      });
      if (searchScope !== 'all') {
         searchParams.set('scope', searchScope);
         // 범위별 페이지로 이동
         navigate(`/${searchScope}?${searchParams.toString()}`); 
      } else {
        // 통합 검색 결과 페이지로 이동 (예: /search)
         navigate(`/search?${searchParams.toString()}`);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-md">
       <Select value={searchScope} onValueChange={setSearchScope}>
         <SelectTrigger className="w-[100px]">
           <SelectValue placeholder="범위" />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value="all">전체</SelectItem>
           <SelectItem value="products">제품</SelectItem>
           <SelectItem value="posts">게시글</SelectItem>
           <SelectItem value="teams">팀</SelectItem>
           <SelectItem value="ideas">아이디어</SelectItem>
         </SelectContent>
       </Select>
       <div className="relative flex-1">
         <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
         <Input
           type="search"
           placeholder="검색어를 입력하세요..."
           className="pl-9"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
       </div>
      <Button type="submit" size="sm">검색</Button>
    </form>
  );
}
!!!

## 2. 목록 페이지 필터링 UI 구현

각 목록 페이지(제품, 게시글 등)에 관련 필터링 옵션을 제공합니다.

### 카테고리 필터 컴포넌트 (`CategoryFilter.tsx` 예시)

!!!typescript
import { useSearchParams, Link } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface CategoryFilterProps {
  categories: { value: string; label: string }[];
  basePath: string; // 예: "/products"
}

export function CategoryFilter({ categories, basePath }: CategoryFilterProps) {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category');

  const createQueryString = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    params.delete('page'); // 필터 변경 시 1페이지로
    return params.toString();
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        asChild
        variant={currentCategory === null ? 'default' : 'outline'}
        size="sm"
      >
        <Link to={`${basePath}?${createQueryString('category', null)}`}>전체</Link>
      </Button>
      {categories.map((category) => (
        <Button
          key={category.value}
          asChild
          variant={currentCategory === category.value ? 'default' : 'outline'}
          size="sm"
        >
          <Link to={`${basePath}?${createQueryString('category', category.value)}`}>
            {category.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
!!!

### 태그 필터 컴포넌트 (`TagFilter.tsx` 예시 - Checkbox 사용)

!!!typescript
import { useSearchParams, Form } from '@remix-run/react';
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface TagFilterProps {
  availableTags: string[];
}

export function TagFilter({ availableTags }: TagFilterProps) {
  const [searchParams] = useSearchParams();
  const currentTags = searchParams.getAll('tags');

  return (
    <Card className="mb-6">
      <CardHeader>
         <CardTitle className="text-base">태그 필터</CardTitle>
      </CardHeader>
      <CardContent>
         <Form method="get" replace> {/* GET 요청으로 URL 업데이트 */} 
           {/* 기존 다른 파라미터 유지 */}
           {Array.from(searchParams.entries()).map(([key, value]) => {
             if (key !== 'tags') {
               return <input key={key} type="hidden" name={key} value={value} />;
             }
             return null;
           })}

           <div className="space-y-3">
             {availableTags.map((tag) => (
               <div key={tag} className="flex items-center space-x-2">
                 <Checkbox 
                   id={`tag-${tag}`}
                   name="tags"
                   value={tag}
                   defaultChecked={currentTags.includes(tag)}
                 />
                 <Label htmlFor={`tag-${tag}`} className="text-sm font-normal cursor-pointer">
                   {tag}
                 </Label>
               </div>
             ))}
           </div>
           <Button type="submit" size="sm" className="mt-4">적용</Button>
         </Form>
      </CardContent>
    </Card>
  );
}
!!!

## 3. 목록 페이지 정렬 UI 구현

### 정렬 드롭다운 컴포넌트 (`SortDropdown.tsx` 예시)

!!!typescript
import { useSearchParams, Link } from '@remix-run/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface SortOption {
  value: string; // 예: 'created_at-desc', 'popularity-desc', 'name-asc'
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  basePath: string;
  defaultSort: string;
}

export function SortDropdown({ options, basePath, defaultSort }: SortDropdownProps) {
  const [searchParams] = useSearchParams();
  const currentSort = searchParams.get('sort') || defaultSort;

  const createQueryString = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === defaultSort) {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    params.delete('page'); // 정렬 변경 시 1페이지로
    return params.toString();
  };

  const currentSortLabel = options.find(opt => opt.value === currentSort)?.label || '정렬 기준';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {currentSortLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>정렬 기준</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={currentSort}>
          {options.map((option) => (
             <DropdownMenuRadioItem key={option.value} value={option.value} asChild>
               {/* Link를 사용하여 페이지 이동 */}
               <Link to={`${basePath}?${createQueryString('sort', option.value)}`} className="w-full">
                  {option.label}
               </Link>
             </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
!!!

## 4. 백엔드 로직 구현 (Loader 수정)

각 목록 페이지의 `loader` 함수에서 URLSearchParams를 통해 검색어(`query`), 필터(`category`, `tags` 등), 정렬(`sort`) 파라미터를 읽어와 Supabase 또는 다른 검색 엔진 쿼리에 반영합니다.

### 서버 유틸리티 함수 예시

**`app/utils/search/search.server.ts` (검색 로직 예시 - Supabase):**

!!!typescript
import { SupabaseClient } from '@supabase/supabase-js';

export function applySearchQuery(queryBuilder: any, searchTerm: string | null, searchFields: string[]) {
  if (!searchTerm || searchFields.length === 0) {
    return queryBuilder;
  }
  
  // Supabase Full-Text Search 사용 예시 (tsvector 및 websearch_to_tsquery)
  // 테이블에 tsvector 컬럼이 필요합니다 (예: search_vector)
  // return queryBuilder.textSearch('search_vector', searchTerm, { type: 'websearch' });
  
  // 또는 간단한 LIKE 검색 (성능에 주의)
   const likePattern = `%${searchTerm.replace(/%/g, '\%').replace(/_/g, '\_')}%`;
   const orConditions = searchFields.map(field => `${field}.ilike.${likePattern}`).join(',');
   return queryBuilder.or(orConditions);
}
!!!

**`app/utils/search/filter.server.ts` (필터링 로직 예시):**

!!!typescript
export function applyCategoryFilter(queryBuilder: any, category: string | null) {
  if (!category) {
    return queryBuilder;
  }
  return queryBuilder.eq('category', category);
}

export function applyTagsFilter(queryBuilder: any, tags: string[] | null) {
  if (!tags || tags.length === 0) {
    return queryBuilder;
  }
  // tags 컬럼이 text[] 타입이라고 가정
  return queryBuilder.overlaps('tags', tags);
}
!!!

**`app/utils/search/sort.server.ts` (정렬 로직 예시):**

!!!typescript
interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  nulls?: 'first' | 'last';
}

const SORT_MAP: Record<string, SortOption> = {
  'created_at-desc': { field: 'created_at', direction: 'desc' },
  'created_at-asc': { field: 'created_at', direction: 'asc' },
  'popularity-desc': { field: 'view_count', direction: 'desc', nulls: 'last' }, // 예시
  'name-asc': { field: 'name', direction: 'asc' },
  'name-desc': { field: 'name', direction: 'desc' },
};

export function applySorting(queryBuilder: any, sortKey: string | null, defaultSort: SortOption) {
  const sortOption = sortKey ? SORT_MAP[sortKey] : defaultSort;
  
  if (!sortOption) {
    console.warn(`Invalid sort key: ${sortKey}. Using default sort.`);
    sortOption = defaultSort;
  }

  return queryBuilder.order(sortOption.field, { 
     ascending: sortOption.direction === 'asc', 
     nullsFirst: sortOption.nulls === 'first' 
  });
}
!!!

### 게시글 목록 페이지 로더 수정 예시 (`app/routes/posts._index.tsx`)

!!!typescript
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import { applySearchQuery } from "~/utils/search/search.server";
import { applyCategoryFilter } from "~/utils/search/filter.server";
import { applySorting } from "~/utils/search/sort.server";
// import { PostList } from "~/components/posts/PostList";
import { CategoryFilter } from "~/components/filters/CategoryFilter";
import { SortDropdown } from "~/components/sorting/SortDropdown";
import { Pagination } from "~/components/ui/pagination-controls"; // 페이지네이션 컴포넌트 가정

const ITEMS_PER_PAGE = 10;
const DEFAULT_SORT = { field: 'created_at', direction: 'desc' };
const POST_CATEGORIES = [
   { value: "question", label: "질문" },
   { value: "discussion", label: "토론" },
   { value: "showcase", label: "소개" },
   // ... 기타 카테고리
];
const SORT_OPTIONS = [
  { value: "created_at-desc", label: "최신순" },
  { value: "popularity-desc", label: "인기순" }, // 'view_count' 등 필요
  { value: "comments-desc", label: "댓글 많은 순" }, // 'comment_count' 등 필요
  { value: "created_at-asc", label: "오래된 순" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const searchTerm = searchParams.get('query');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('posts')
    .select('*, author:profiles(name, avatar_url), comment_count:comments(count)', { count: 'exact' }); // 댓글 수 등 필요시 조인 또는 계산

  // 1. 검색 적용
  query = applySearchQuery(query, searchTerm, ['title', 'content']); // 검색 대상 필드 지정

  // 2. 필터 적용
  query = applyCategoryFilter(query, category);

  // 3. 정렬 적용
  query = applySorting(query, sort, DEFAULT_SORT);
  
  // 4. 페이지네이션 적용
  query = query.range(from, to);

  const { data: posts, error, count } = await query;

  if (error) {
    console.error("게시글 목록 로드 오류:", error);
    throw new Response("게시글 목록을 불러올 수 없습니다.", { status: 500 });
  }

  return json({
    posts: posts || [],
    currentPage: page,
    totalPages: Math.ceil((count ?? 0) / ITEMS_PER_PAGE),
    categories: POST_CATEGORIES,
    sortOptions: SORT_OPTIONS,
    defaultSortValue: 'created_at-desc'
  });
}

export default function PostsIndexPage() {
  const { posts, currentPage, totalPages, categories, sortOptions, defaultSortValue } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">게시글 목록</h1>
      
      {/* 필터 및 정렬 UI */}
      <div className="mb-6">
         <CategoryFilter categories={categories} basePath="/posts" />
      </div>
      <div className="flex justify-between items-center mb-4">
         {/* 검색 입력 필드는 헤더에 있다고 가정 */}
         <SortDropdown options={sortOptions} basePath="/posts" defaultSort={defaultSortValue} />
      </div>

      {/* 게시글 목록 */}
      {posts.length > 0 ? (
         <div className="space-y-4">
           {/* <PostList posts={posts} /> */}
           {posts.map((post: any) => (
             <div key={post.id} className="border p-4 rounded">
               <h2 className="font-semibold">{post.title}</h2>
               <p className="text-sm text-muted-foreground">by {post.author?.name} - {new Date(post.created_at).toLocaleDateString()}</p>
             </div>
           ))}
         </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
           {searchParams.toString() ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
        </p>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
!!!

## 실행 및 테스트

1. 헤더의 검색 입력 필드에 검색어를 입력하고 범위(전체, 제품, 게시글 등)를 선택하여 검색합니다.
2. 제품, 게시글 등 목록 페이지에서 카테고리, 태그 필터를 적용해봅니다.
3. 목록 페이지에서 정렬 드롭다운을 사용하여 정렬 순서를 변경해봅니다.
4. URL의 쿼리 파라미터가 정상적으로 변경되고, 그에 따라 결과가 필터링/정렬되는지 확인합니다.
5. 검색, 필터링, 정렬을 복합적으로 사용했을 때도 결과가 올바르게 나오는지 확인합니다.

!!!bash
# 개발 서버 실행
npm run dev

# 브라우저에서 각 목록 페이지 접근하여 테스트
# 예: /posts?category=question&sort=popularity-desc&page=2
!!!

## 다음 단계

검색, 필터링, 정렬 기능 구현이 완료되었습니다! Day 26에서는 알림 시스템 구현 (실시간 알림 포함) 및 이메일 알림 설정을 진행합니다. 