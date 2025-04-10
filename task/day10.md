# Day 10: 알림 및 메시지 페이지 개발

## 목표

오늘은 YkMake의 알림 시스템과 실시간 메시지 기능을 개발합니다. 사용자들이 중요한 알림을 받고 서로 소통할 수 있는 기능을 구현합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성합니다:

```bash
# 알림 페이지
touch app/routes/notifications.tsx
touch app/routes/notifications._index.tsx

# 메시지 관련 페이지
touch app/routes/messages.tsx
touch app/routes/messages._index.tsx
touch app/routes/messages.$userId.tsx

# 대시보드 페이지
touch app/routes/dashboard.tsx
touch app/routes/dashboard._index.tsx

# 타입 정의 파일
touch app/lib/types/notification.ts
touch app/lib/types/message.ts
touch app/lib/types/dashboard.ts

# 목업 데이터
touch app/lib/data/mock-notifications.ts
touch app/lib/data/mock-messages.ts
touch app/lib/data/mock-dashboard.ts
```

## 작업 목록

1. 타입 정의
2. 목업 데이터 구현
3. 알림 페이지 구현
4. 메시지 목록 페이지 구현
5. 메시지 상세 페이지 구현
6. 대시보드 페이지 기본 구조 구현

## 1. 타입 정의

타입 정의를 위한 파일을 생성합니다.

### 알림 관련 타입 정의

`app/types/notification.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
export interface Notification {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}
```

### 메시지 관련 타입 정의

`app/types/message.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "away";
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
}
```

### 대시보드 관련 타입 정의

`app/types/dashboard.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
export interface DashboardStats {
  totalProducts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface Activity {
  id: string;
  title: string;
  timestamp: string;
}

export interface PopularProduct {
  id: string;
  title: string;
  views: number;
}
```

## 2. 목업 데이터 구현

목업 데이터를 사용하여 실제 API 연동 전에 UI를 개발합니다.

### 알림 데이터 생성

`app/lib/data/mock-notifications.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { Notification } from "~/lib/types/notification";

export const notifications: Notification[] = [
  {
    id: "1",
    title: "새로운 팀 참여 요청이 있습니다",
    content: "AI 기반 제품 추천 시스템 팀에 참여 요청이 도착했습니다.",
    timestamp: "방금 전",
    isRead: false,
  },
  {
    id: "2",
    title: "새로운 댓글이 달렸습니다",
    content: "회원님의 게시글 \"Remix로 풀스택 앱 만들기\"에 새로운 댓글이 달렸습니다.",
    timestamp: "10분 전",
    isRead: false,
  },
  {
    id: "3",
    title: "제품이 추천되었습니다",
    content: "회원님의 제품이 이번 주 추천 제품으로 선정되었습니다.",
    timestamp: "1시간 전",
    isRead: true,
  },
  {
    id: "4",
    title: "새로운 팔로워가 생겼습니다",
    content: "홍길동님이 회원님을 팔로우하기 시작했습니다.",
    timestamp: "3시간 전",
    isRead: true,
  },
  {
    id: "5",
    title: "프로젝트 마감일이 다가옵니다",
    content: "\"모바일 앱 프로토타입\" 프로젝트의 마감일이 3일 남았습니다.",
    timestamp: "어제",
    isRead: true,
  }
];

export function getNotifications() {
  return notifications;
}

export function getUnreadCount() {
  return notifications.filter(notification => !notification.isRead).length;
}
```

### 메시지 데이터 생성

`app/lib/data/mock-messages.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { User, Message, Conversation } from "~/lib/types/message";

export const users: User[] = [
  {
    id: "1",
    name: "김영희",
    status: "online"
  },
  {
    id: "2",
    name: "이철수",
    status: "online"
  },
  {
    id: "3",
    name: "박민수",
    status: "away"
  },
  {
    id: "4",
    name: "정지원",
    status: "offline"
  }
];

export const messages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      senderId: "current-user",
      receiverId: "1",
      content: "안녕하세요! 프로젝트 관련해서 문의드립니다.",
      timestamp: "2023-06-15T09:00:00",
      isRead: true
    },
    {
      id: "m2",
      senderId: "1",
      receiverId: "current-user",
      content: "네, 어떤 점이 궁금하신가요?",
      timestamp: "2023-06-15T09:02:00",
      isRead: true
    },
    {
      id: "m3",
      senderId: "current-user",
      receiverId: "1",
      content: "현재 진행 중인 AI 기반 제품 추천 시스템 프로젝트에 참여하고 싶습니다.",
      timestamp: "2023-06-15T09:05:00",
      isRead: true
    },
    {
      id: "m4",
      senderId: "1",
      receiverId: "current-user",
      content: "좋습니다! 어떤 기술 스택을 보유하고 계신가요?",
      timestamp: "2023-06-15T09:10:00",
      isRead: true
    }
  ],
  "2": [
    {
      id: "m5",
      senderId: "current-user",
      receiverId: "2",
      content: "팀 참여 신청 관련해서 문의드립니다.",
      timestamp: "2023-06-14T15:30:00",
      isRead: true
    },
    {
      id: "m6",
      senderId: "2",
      receiverId: "current-user",
      content: "팀 참여 신청 관련 답변입니다. 지원해주셔서 감사합니다.",
      timestamp: "2023-06-14T16:00:00",
      isRead: true
    }
  ],
  "3": [
    {
      id: "m7",
      senderId: "3",
      receiverId: "current-user",
      content: "제품 피드백 감사합니다!",
      timestamp: "2023-06-13T10:15:00",
      isRead: true
    }
  ]
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    participants: ["current-user", "1"],
    lastMessage: messages["1"][messages["1"].length - 1]
  },
  {
    id: "c2",
    participants: ["current-user", "2"],
    lastMessage: messages["2"][messages["2"].length - 1]
  },
  {
    id: "c3",
    participants: ["current-user", "3"],
    lastMessage: messages["3"][messages["3"].length - 1]
  }
];

export function getConversations() {
  return conversations.map(conversation => {
    const otherParticipantId = conversation.participants.find(p => p !== "current-user") || "";
    const otherParticipant = users.find(user => user.id === otherParticipantId);
    
    return {
      ...conversation,
      user: otherParticipant
    };
  });
}

export function getConversation(userId: string) {
  return {
    messages: messages[userId] || [],
    user: users.find(user => user.id === userId)
  };
}
```

### 대시보드 데이터 생성

`app/lib/data/mock-dashboard.ts` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { DashboardStats, Activity, PopularProduct } from "~/lib/types/dashboard";

export const dashboardStats: DashboardStats = {
  totalProducts: 12,
  totalViews: 1234,
  totalLikes: 256,
  totalComments: 89
};

export const recentActivities: Activity[] = [
  {
    id: "a1",
    title: "새 제품 등록: AI 챗봇",
    timestamp: "방금 전"
  },
  {
    id: "a2",
    title: "댓글 작성: Remix 튜토리얼",
    timestamp: "1시간 전"
  },
  {
    id: "a3",
    title: "팀 참여: 블록체인 프로젝트",
    timestamp: "어제"
  },
  {
    id: "a4",
    title: "좋아요: 웹 컴포넌트 라이브러리",
    timestamp: "2일 전"
  }
];

export const popularProducts: PopularProduct[] = [
  {
    id: "p1",
    title: "AI 챗봇",
    views: 523
  },
  {
    id: "p2",
    title: "커뮤니티 플랫폼",
    views: 342
  },
  {
    id: "p3",
    title: "포트폴리오 생성기",
    views: 289
  },
  {
    id: "p4",
    title: "코드 리뷰 도구",
    views: 187
  }
];

export function getDashboardData() {
  return {
    stats: dashboardStats,
    activities: recentActivities,
    popularProducts: popularProducts
  };
}
```

## 3. 알림 페이지 구현

알림 페이지는 사용자가 받은 모든 알림을 확인할 수 있는 페이지입니다.

### 알림 레이아웃 생성

`app/routes/notifications.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { Outlet } from "@remix-run/react";

export default function NotificationsLayout() {
  return (
    <div className="container py-8">
      <Outlet />
    </div>
  );
}
```

### 알림 페이지 컴포넌트 생성

`app/routes/notifications._index.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { getNotifications } from "~/lib/data/mock-notifications";
import type { Notification } from "~/lib/types/notification";

export const meta: MetaFunction = () => {
  return [
    { title: "알림 - YkMake" },
    { name: "description", content: "YkMake의 알림을 확인하세요" },
  ];
};

export async function loader() {
  const notifications = getNotifications();
  return { notifications };
}

export default function Notifications() {
  const { notifications } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">알림</h1>
        <Button variant="outline">모두 읽음 표시</Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification: Notification) => (
          <Card key={notification.id} className="p-4 hover:bg-muted/50 cursor-pointer">
            <div className="flex items-start gap-4">
              <div className={`h-2 w-2 mt-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-primary'}`} />
              <div className="flex-1">
                <p className="font-medium">
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notification.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.timestamp}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
```

## 4. 메시지 목록 페이지 구현

메시지 목록 페이지는 사용자가 주고받은 모든 대화 목록을 보여주는 페이지입니다.

### 메시지 레이아웃 생성

`app/routes/messages.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { Outlet } from "@remix-run/react";

export default function MessagesLayout() {
  return (
    <div className="container py-8">
      <Outlet />
    </div>
  );
}
```

### 메시지 목록 페이지 컴포넌트 생성

`app/routes/messages._index.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getConversations } from "~/lib/data/mock-messages";

export const meta: MetaFunction = () => {
  return [
    { title: "메시지 - YkMake" },
    { name: "description", content: "YkMake의 메시지를 확인하세요" },
  ];
};

export async function loader() {
  const conversations = getConversations();
  return { conversations };
}

export default function Messages() {
  const { conversations } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">메시지</h1>
        <Input
          className="max-w-xs"
          placeholder="대화 검색"
        />
      </div>

      <div className="space-y-4">
        {conversations.map((conversation) => (
          <Link key={conversation.id} to={`/messages/${conversation.user?.id}`}>
            <Card className="p-4 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.user?.id}`} />
                  <AvatarFallback>{conversation.user?.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{conversation.user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.lastMessage.timestamp.includes('T') 
                        ? new Date(conversation.lastMessage.timestamp).toLocaleDateString('ko-KR', { 
                            month: 'short', 
                            day: 'numeric' 
                          }) 
                        : conversation.lastMessage.timestamp}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {conversation.lastMessage.content}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## 5. 메시지 상세 페이지 구현

메시지 상세 페이지는 특정 사용자와의 대화 내용을 보여주고 새로운 메시지를 보낼 수 있는 페이지입니다.

### 메시지 상세 페이지 컴포넌트 생성

`app/routes/messages.$userId.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getConversation } from "~/lib/data/mock-messages";
import type { Message, User } from "~/lib/types/message";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.user) {
    return [
      { title: "메시지 - YkMake" },
      { name: "description", content: "대화를 시작하세요" },
    ];
  }
  
  return [
    { title: `${data.user.name}와의 대화 - YkMake` },
    { name: "description", content: `YkMake에서 ${data.user.name}님과 대화하세요` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = params.userId as string;
  const { messages, user } = getConversation(userId);
  
  return { messages, user };
}

export default function MessageDetail() {
  const { messages, user } = useLoaderData<typeof loader>();

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 p-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} />
          <AvatarFallback>{user?.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-muted-foreground">
            {user?.status === 'online' ? '온라인' : 
             user?.status === 'away' ? '자리비움' : '오프라인'}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message: Message) => (
          <div 
            key={message.id} 
            className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`rounded-lg p-3 max-w-[70%] ${
                message.senderId === 'current-user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.includes('T') 
                  ? new Date(message.timestamp).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) 
                  : message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <form className="flex gap-4">
          <Input
            className="flex-1"
            placeholder="메시지를 입력하세요..."
          />
          <Button type="submit">보내기</Button>
        </form>
      </div>
    </Card>
  );
}
```

## 6. 대시보드 페이지 기본 구조 구현

대시보드 페이지는 사용자의 활동 현황과 통계를 보여주는 페이지입니다.

### 대시보드 레이아웃 생성

`app/routes/dashboard.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import { Outlet } from "@remix-run/react";

export default function DashboardLayout() {
  return (
    <div className="container py-8">
      <Outlet />
    </div>
  );
}
```

### 대시보드 페이지 컴포넌트 생성

`app/routes/dashboard._index.tsx` 파일을 생성하고 다음과 같이 구현합니다:

```typescript
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { getDashboardData } from "~/lib/data/mock-dashboard";
import type { Activity, PopularProduct } from "~/lib/types/dashboard";

export const meta: MetaFunction = () => {
  return [
    { title: "대시보드 - YkMake" },
    { name: "description", content: "YkMake 대시보드에서 활동 현황을 확인하세요" },
  ];
};

export async function loader() {
  const dashboardData = getDashboardData();
  return dashboardData;
}

export default function Dashboard() {
  const { stats, activities, popularProducts } = useLoaderData<typeof loader>();
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="font-semibold text-muted-foreground">총 제품</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-muted-foreground">총 조회수</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalViews.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-muted-foreground">총 좋아요</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalLikes}</p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-muted-foreground">총 댓글</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalComments}</p>
        </Card>
      </div>

      <div className="grid gap-6 mt-8 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
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
          <h2 className="text-xl font-semibold mb-4">인기 제품</h2>
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

이제 알림 및 메시지 페이지의 기본적인 UI가 완성되었습니다! 다음 단계에서는 대시보드 및 분석 페이지를 개발하여 사용자들이 자신의 활동을 더 자세히 분석하고 모니터링할 수 있도록 만들 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL들을 통해 새로 만든 페이지들을 확인할 수 있습니다:
- `http://localhost:3000/notifications`
- `http://localhost:3000/messages`
- `http://localhost:3000/messages/1`
- `http://localhost:3000/dashboard`

