# Day 11: 대시보드 및 분석 페이지 개발

## 목표

오늘은 YkMake의 대시보드와 분석 페이지를 더 자세히 개발합니다. 사용자들이 자신의 활동과 성과를 시각적으로 분석하고 모니터링할 수 있는 기능을 구현합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성합니다:

```bash
# 대시보드 분석 라우트
touch app/routes/dashboard.products.tsx
touch app/routes/dashboard.teams.tsx
touch app/routes/dashboard.activity.tsx

# 대시보드 차트 컴포넌트
mkdir -p app/components/dashboard
touch app/components/dashboard/activity-chart.tsx
touch app/components/dashboard/dashboard-nav.tsx

# 타입 정의 파일
touch app/lib/types/charts.ts
touch app/lib/types/analytics.ts

# 목업 데이터
touch app/lib/data/mock-analytics.ts
```

## shadn table 컴포넌트 추가

```bash
npx shadcn@latest add table
```

## 작업 목록

1. 타입 정의
2. 목업 데이터 구현
3. 대시보드 네비게이션 컴포넌트 구현
4. 대시보드 차트 컴포넌트 구현
5. 제품 분석 페이지 구현
6. 팀 분석 페이지 구현
7. 사용자 활동 분석 페이지 구현

## 1. 타입 정의

타입 정의를 위한 파일을 생성합니다.

### 차트 관련 타입 정의

`app/lib/types/charts.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
export interface ActivityChartData {
  name: string;
  제품: number;
  조회수: number;
  좋아요: number;
}

export interface ProductChartData {
  name: string;
  views: number;
  likes: number;
  comments: number;
}

export interface TeamChartData {
  name: string;
  members: number;
  projects: number;
  commits: number;
}

export interface UserActivityData {
  date: string;
  commits: number;
  comments: number;
  likes: number;
}
```

### 분석 관련 타입 정의

`app/lib/types/analytics.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { ActivityChartData, ProductChartData, TeamChartData, UserActivityData } from "./charts";

export interface ProductAnalytics {
  data: ProductChartData[];
}

export interface TeamAnalytics {
  data: TeamChartData[];
}

export interface ActivityAnalytics {
  data: UserActivityData[];
}

export interface DashboardChartData {
  activityData: ActivityChartData[];
}
```

## 2. 목업 데이터 구현

목업 데이터를 사용하여 실제 API 연동 전에 UI를 개발합니다.

### 분석 데이터 생성

`app/lib/data/mock-analytics.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { 
  DashboardChartData, 
  ProductAnalytics, 
  TeamAnalytics, 
  ActivityAnalytics 
} from "~/lib/types/analytics";
import type { 
  ActivityChartData, 
  ProductChartData, 
  TeamChartData, 
  UserActivityData 
} from "~/lib/types/charts";

// 대시보드 차트 데이터
export const activityChartData: ActivityChartData[] = [
  { name: "1월", 제품: 4, 조회수: 240, 좋아요: 24 },
  { name: "2월", 제품: 3, 조회수: 139, 좋아요: 18 },
  { name: "3월", 제품: 2, 조회수: 980, 좋아요: 79 },
  { name: "4월", 제품: 3, 조회수: 390, 좋아요: 45 },
  { name: "5월", 제품: 4, 조회수: 480, 좋아요: 76 },
  { name: "6월", 제품: 3, 조회수: 380, 좋아요: 34 },
  { name: "7월", 제품: 4, 조회수: 430, 좋아요: 89 },
];

// 제품 분석 데이터
export const productData: ProductChartData[] = [
  {
    name: "AI 챗봇",
    views: 523,
    likes: 128,
    comments: 45,
  },
  {
    name: "커뮤니티 플랫폼",
    views: 342,
    likes: 89,
    comments: 23,
  },
  {
    name: "포트폴리오 생성기",
    views: 289,
    likes: 67,
    comments: 12,
  },
];

// 팀 분석 데이터
export const teamData: TeamChartData[] = [
  {
    name: "AI 개발팀",
    members: 8,
    projects: 3,
    commits: 234,
  },
  {
    name: "웹 개발팀",
    members: 6,
    projects: 2,
    commits: 189,
  },
  {
    name: "디자인팀",
    members: 4,
    projects: 4,
    commits: 156,
  },
];

// 사용자 활동 분석 데이터
export const userActivityData: UserActivityData[] = [
  {
    date: "2024-03-01",
    commits: 5,
    comments: 3,
    likes: 8,
  },
  {
    date: "2024-03-02",
    commits: 3,
    comments: 4,
    likes: 12,
  },
  {
    date: "2024-03-03",
    commits: 7,
    comments: 2,
    likes: 5,
  },
  {
    date: "2024-03-04",
    commits: 4,
    comments: 6,
    likes: 9,
  },
  {
    date: "2024-03-05",
    commits: 6,
    comments: 3,
    likes: 7,
  },
];

export function getDashboardChartData(): DashboardChartData {
  return {
    activityData: activityChartData
  };
}

export function getProductAnalytics(): ProductAnalytics {
  return {
    data: productData
  };
}

export function getTeamAnalytics(): TeamAnalytics {
  return {
    data: teamData
  };
}

export function getActivityAnalytics(): ActivityAnalytics {
  return {
    data: userActivityData
  };
}
```

## 3. 대시보드 네비게이션 컴포넌트 구현

대시보드 내에서 각 분석 페이지로 쉽게 이동할 수 있는 네비게이션 메뉴를 구현합니다.

### 대시보드 네비게이션 컴포넌트 생성

`app/components/dashboard/dashboard-nav.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";

interface DashboardNavProps {
  className?: string;
}

export function DashboardNav({ className }: DashboardNavProps) {
  const location = useLocation();
  
  const navItems = [
    {
      title: "대시보드",
      href: "/dashboard",
      icon: "LayersIcon",
    },
    {
      title: "제품 분석",
      href: "/dashboard/products",
      icon: "BarChartIcon",
    },
    {
      title: "팀 분석",
      href: "/dashboard/teams",
      icon: "UsersIcon",
    },
    {
      title: "활동 분석",
      href: "/dashboard/activity",
      icon: "ActivityIcon",
    },
  ];

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            location.pathname === item.href
              ? "text-primary font-semibold"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
```

## 4. 대시보드 레이아웃 업데이트

대시보드 레이아웃에 네비게이션 메뉴를 추가합니다.

### 대시보드 레이아웃 컴포넌트 수정

`app/routes/dashboard.tsx` 파일을 수정하여 네비게이션 메뉴를 추가합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { DashboardNav } from "~/components/dashboard/dashboard-nav";

export default function DashboardLayout() {
  return (
    <div className="container py-8">
      <div className="border-b pb-4 mb-8">
        <DashboardNav />
      </div>
      <Outlet />
    </div>
  );
}
```

## 5. 대시보드 차트 컴포넌트 구현

대시보드에 차트를 추가하여 데이터를 시각화합니다. Recharts 라이브러리를 사용하여 구현합니다.

### Recharts 설치

```bash
npm install recharts
```

### 대시보드 차트 컴포넌트 생성

`app/components/dashboard/activity-chart.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "~/components/ui/card";
import type { ActivityChartData } from "~/lib/types/charts";

interface ActivityChartProps {
  data: ActivityChartData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">활동 추이</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="제품"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="조회수"
              stroke="#82ca9d"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="좋아요"
              stroke="#ffc658"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

## 6. 제품 분석 페이지 구현

제품별 성과와 통계를 보여주는 페이지를 구현합니다.

### 제품 분석 페이지 컴포넌트 생성

`app/routes/dashboard.products.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getProductAnalytics } from "~/lib/data/mock-analytics";
import type { ProductChartData } from "~/lib/types/charts";

export const meta: MetaFunction = () => {
  return [
    { title: "제품 분석 - YkMake" },
    { name: "description", content: "YkMake의 제품 성과를 분석하세요" },
  ];
};

export async function loader() {
  const { data } = getProductAnalytics();
  return { data };
}

export default function ProductAnalytics() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">제품 분석</h1>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">제품별 성과</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" name="조회수" />
                <Bar dataKey="likes" fill="#82ca9d" name="좋아요" />
                <Bar dataKey="comments" fill="#ffc658" name="댓글" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">제품 목록</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제품명</TableHead>
                <TableHead className="text-right">조회수</TableHead>
                <TableHead className="text-right">좋아요</TableHead>
                <TableHead className="text-right">댓글</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product: ProductChartData) => (
                <TableRow key={product.name}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{product.views}</TableCell>
                  <TableCell className="text-right">{product.likes}</TableCell>
                  <TableCell className="text-right">{product.comments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
```

## 7. 팀 분석 페이지 구현

팀별 활동과 성과를 분석하는 페이지를 구현합니다.

### 팀 분석 페이지 컴포넌트 생성

`app/routes/dashboard.teams.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getTeamAnalytics } from "~/lib/data/mock-analytics";
import type { TeamChartData } from "~/lib/types/charts";

export const meta: MetaFunction = () => {
  return [
    { title: "팀 분석 - YkMake" },
    { name: "description", content: "YkMake의 팀 활동을 분석하세요" },
  ];
};

export async function loader() {
  const { data } = getTeamAnalytics();
  return { data };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function TeamAnalytics() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">팀 분석</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">팀별 구성원 비율</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="members"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">팀 목록</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>팀명</TableHead>
                <TableHead className="text-right">구성원</TableHead>
                <TableHead className="text-right">프로젝트</TableHead>
                <TableHead className="text-right">커밋</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((team: TeamChartData) => (
                <TableRow key={team.name}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-right">{team.members}</TableCell>
                  <TableCell className="text-right">{team.projects}</TableCell>
                  <TableCell className="text-right">{team.commits}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
```

## 8. 사용자 활동 분석 페이지 구현

사용자의 개인 활동을 분석하는 페이지를 구현합니다.

### 사용자 활동 분석 페이지 컴포넌트 생성

`app/routes/dashboard.activity.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getActivityAnalytics } from "~/lib/data/mock-analytics";
import type { UserActivityData } from "~/lib/types/charts";

export const meta: MetaFunction = () => {
  return [
    { title: "활동 분석 - YkMake" },
    { name: "description", content: "YkMake에서의 활동을 분석하세요" },
  ];
};

export async function loader() {
  const { data } = getActivityAnalytics();
  return { data };
}

export default function ActivityAnalytics() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">활동 분석</h1>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">일별 활동</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="comments"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
                <Area
                  type="monotone"
                  dataKey="likes"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">최근 활동 내역</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead className="text-right">커밋</TableHead>
                <TableHead className="text-right">댓글</TableHead>
                <TableHead className="text-right">좋아요</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((activity: UserActivityData) => (
                <TableRow key={activity.date}>
                  <TableCell className="font-medium">{activity.date}</TableCell>
                  <TableCell className="text-right">{activity.commits}</TableCell>
                  <TableCell className="text-right">{activity.comments}</TableCell>
                  <TableCell className="text-right">{activity.likes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
```

## 대시보드 메인 페이지에 차트 컴포넌트 추가

`app/routes/dashboard._index.tsx` 파일을 수정하여 차트 컴포넌트를 추가합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { getDashboardData } from "~/lib/data/mock-dashboard";
import { getDashboardChartData } from "~/lib/data/mock-analytics";
import { ActivityChart } from "~/components/dashboard/activity-chart";
import type { Activity, PopularProduct } from "~/lib/types/dashboard";

export const meta: MetaFunction = () => {
  return [
    { title: "대시보드 - YkMake" },
    { name: "description", content: "YkMake 대시보드에서 활동 현황을 확인하세요" },
  ];
};

export async function loader() {
  const dashboardData = getDashboardData();
  const chartData = getDashboardChartData();
  return { ...dashboardData, ...chartData };
}

export default function Dashboard() {
  const { stats, activities, popularProducts, activityData } = useLoaderData<typeof loader>();
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="font-semibold text-muted-foreground">총 제품</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
          <Link to="/dashboard/products" className="mt-4 text-sm text-primary inline-block">
            자세히 보기 →
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-muted-foreground">총 조회수</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalViews.toLocaleString()}</p>
          <Link to="/dashboard/products" className="mt-4 text-sm text-primary inline-block">
            자세히 보기 →
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-muted-foreground">총 좋아요</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalLikes}</p>
          <Link to="/dashboard/activity" className="mt-4 text-sm text-primary inline-block">
            자세히 보기 →
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-muted-foreground">총 댓글</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalComments}</p>
          <Link to="/dashboard/activity" className="mt-4 text-sm text-primary inline-block">
            자세히 보기 →
          </Link>
        </Card>
      </div>
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">활동 추이</h2>
          <Link to="/dashboard/activity">
            <Button variant="outline" size="sm">활동 분석 자세히 보기</Button>
          </Link>
        </div>
        <ActivityChart data={activityData} />
      </div>

      <div className="grid gap-6 mt-8 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">최근 활동</h2>
            <Link to="/dashboard/activity">
              <Button variant="link" size="sm">자세히 보기</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {activities.map((activity: Activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <p className="text-sm">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">인기 제품</h2>
            <Link to="/dashboard/products">
              <Button variant="link" size="sm">자세히 보기</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {popularProducts.map((product: PopularProduct) => (
              <div key={product.id} className="flex items-center justify-between">
                <p className="text-sm">{product.title}</p>
                <p className="text-sm text-muted-foreground">조회수 {product.views}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
```

## 다음 단계

이제 대시보드와 분석 페이지의 기본적인 UI가 완성되었습니다! 다음 단계에서는 설정 및 관리자 페이지를 개발하여 사용자들이 자신의 계정과 권한을 관리할 수 있도록 만들 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL들을 통해 새로 만든 페이지들을 확인할 수 있습니다:
- `http://localhost:3000/dashboard` - 대시보드 메인 페이지
- `http://localhost:3000/dashboard/products` - 제품 분석
- `http://localhost:3000/dashboard/teams` - 팀 분석
- `http://localhost:3000/dashboard/activity` - 활동 분석

각 페이지는 상단 네비게이션 메뉴를 통해 쉽게 이동할 수 있으며, 대시보드 메인 페이지의 각 카드에도 관련 분석 페이지로 이동할 수 있는 링크가 포함되어 있습니다.