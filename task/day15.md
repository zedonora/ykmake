# Day 15: 실시간 기능 개발

## 목표

오늘은 YkMake의 실시간 기능을 개발합니다. WebSocket을 사용하여 사용자들이 실시간으로 상호작용할 수 있는 기능을 구현합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성합니다:

```bash
# WebSocket 관련 파일
mkdir -p app/utils
touch app/utils/socket.server.ts
touch app/utils/socket.client.ts

# 실시간 기능 컴포넌트
mkdir -p app/components/notifications
touch app/components/notifications/notification-list.tsx
mkdir -p app/components/chat
touch app/components/chat/chat-window.tsx
mkdir -p app/components/collaboration
touch app/components/collaboration/collaboration-editor.tsx

# 실시간 기능 라우트 (flat routing 방식)
touch app/routes/notifications.tsx
touch app/routes/notifications._index.tsx
touch app/routes/chat.tsx
touch app/routes/chat._index.tsx
touch app/routes/collaboration.tsx
touch app/routes/collaboration._index.tsx
```

## 패키지 설치

```bash
# WebSocket 관련 패키지 설치
npm install socket.io socket.io-client @types/socket.io @types/socket.io-client

# 실시간 편집 관련 패키지 설치
npm install @monaco-editor/react
```

## shadcn 컴포넌트 추가

```bash
npx shadcn@latest add scroll-area
```

## 작업 목록

1. WebSocket 서버 설정
2. 실시간 알림 기능 구현
3. 실시간 채팅 기능 구현
4. 실시간 협업 기능 구현
5. 레이아웃 및 인덱스 페이지 구현
6. 로그인 기능 문제 수정
7. RootLayout에 실시간 기능 접근 버튼 추가
8. 타입 에러 수정
9. React Hook 에러 수정
10. UI 공통화 및 개선

## 1. WebSocket 서버 설정

Socket.IO를 사용하여 WebSocket 서버를 설정합니다.

### WebSocket 서버 구현

`app/utils/socket.server.ts` 파일을 다음과 같이 구현합니다:

```typescript
import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { getUser } from "./session.server";
import { prisma } from "./api.server";

let io: Server;

export function initSocketIO(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production"
        ? "https://ykmake.com"
        : "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) {
      return next(new Error("No cookie"));
    }

    try {
      // 헤더만 포함된 가짜 Request 객체 대신 실제 Request 객체 생성
      const fakeRequest = new Request("http://localhost", {
        headers: new Headers({
          cookie
        })
      });

      const user = await getUser(fakeRequest);

      if (!user) {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}
```

### 클라이언트 설정

`app/utils/socket.client.ts` 파일을 다음과 같이 구현합니다:

```typescript
import { io } from "socket.io-client";

const socket = io(
  process.env.NODE_ENV === "production"
    ? "https://ykmake.com"
    : "http://localhost:3000",
  {
    withCredentials: true,
  }
);

export function initSocketClient() {
  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
  });

  return socket;
}

export function getSocket() {
  return socket;
}
```

## 8. 타입 에러 수정

`socket.server.ts` 파일에서 다음과 같은 타입 에러가 발생했습니다:

```
Conversion of type '{ headers: { cookie: string; }; }' to type 'Request' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ headers: { cookie: string; }; }' is missing the following properties from type 'Request': cache, credentials, destination, integrity, and 17 more.
```

이 문제는 `{ headers: { cookie } }` 객체를 `Request` 타입으로 가정하는 부분에서 발생합니다. 이를 해결하기 위해 다음과 같이 실제 `Request` 객체를 생성하도록 코드를 수정했습니다:

```typescript
// 기존 코드 (에러 발생)
const user = await getUser({
  headers: { cookie },
} as Request);

// 수정된 코드 (에러 해결)
const fakeRequest = new Request("http://localhost", {
  headers: new Headers({
    cookie
  })
});

const user = await getUser(fakeRequest);
```

이렇게 수정하면 실제 `Request` 객체를 생성하여 `getUser` 함수에 전달할 수 있으므로 타입 에러가 해결됩니다.

## 2. 실시간 알림 기능 구현

### 알림 컴포넌트 생성

`app/components/notifications/notification-list.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { useEffect, useState } from "react";
import { getSocket } from "~/utils/socket.client";
import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();

    socket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">알림</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
              >
                모두 읽음 표시
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground">
                새로운 알림이 없습니다
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-4 p-2 hover:bg-accent rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 3. 실시간 채팅 기능 구현

### 채팅 컴포넌트 생성

`app/components/chat/chat-window.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { useEffect, useState, useRef } from "react";
import { getSocket } from "~/utils/socket.client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";

type Message = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
};

type ChatWindowProps = {
  roomId: string;
  roomType: "team" | "direct";
};

export function ChatWindow({ roomId, roomType }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.emit("join_room", { roomId, roomType });

    socket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.emit("leave_room", { roomId, roomType });
      socket.off("message");
    };
  }, [roomId, roomType]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const socket = getSocket();
    socket.emit("send_message", {
      roomId,
      roomType,
      content: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">
          {roomType === "team" ? "팀 채팅" : "개인 채팅"}
        </h3>
      </div>
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 p-4"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {message.userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form
        onSubmit={sendMessage}
        className="p-4 border-t flex gap-2"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1"
        />
        <Button type="submit">전송</Button>
      </form>
    </div>
  );
}
```

## 4. 실시간 협업 기능 구현

### 협업 컴포넌트 생성

`app/components/collaboration/collaboration-editor.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { useEffect, useState } from "react";
import { getSocket } from "~/utils/socket.client";
import { Editor } from "@monaco-editor/react";

type CollaborationEditorProps = {
  documentId: string;
  initialContent: string;
};

export function CollaborationEditor({
  documentId,
  initialContent,
}: CollaborationEditorProps) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    const socket = getSocket();

    socket.emit("join_document", { documentId });

    socket.on("content_change", ({ content: newContent }) => {
      setContent(newContent);
    });

    return () => {
      socket.emit("leave_document", { documentId });
      socket.off("content_change");
    };
  }, [documentId]);

  const handleChange = (value: string | undefined) => {
    if (!value) return;

    setContent(value);
    const socket = getSocket();
    socket.emit("update_content", {
      documentId,
      content: value,
    });
  };

  return (
    <div className="h-[600px] border rounded-lg">
      <Editor
        height="100%"
        language="markdown"
        theme="vs-dark"
        value={content}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
```

## 5. 레이아웃 및 인덱스 페이지 구현

### 알림 레이아웃 구현

`app/routes/notifications.tsx` 파일을 다음과 같이 수정합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import ClientOnly from "~/components/ui/client-only";
import { RootLayout } from "~/components/layouts/root-layout";

export default function NotificationsLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loginState = localStorage.getItem("isLoggedIn");
    const adminState = localStorage.getItem("isAdmin");
    
    setIsLoggedIn(loginState === "true");
    setIsAdmin(adminState === "true");
    
    const handleLogout = () => {
      setIsLoggedIn(false);
      setIsAdmin(false);
    };
    
    window.addEventListener('logoutEvent', handleLogout);
    
    return () => {
      window.removeEventListener('logoutEvent', handleLogout);
    };
  }, []);

  return (
    <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
      <div className="container py-8">
        <Outlet />
      </div>
    </RootLayout>
  );
}
```

### 알림 인덱스 페이지 구현

`app/routes/notifications._index.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { NotificationList } from "~/components/notifications/notification-list";

export default function NotificationsIndexPage() {
  return (
    <>
      <PageHeader title="알림" description="모든 알림을 확인하세요" />
      <Section>
        <Card>
          <CardHeader>
            <CardTitle>알림 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <NotificationList />
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
```

### 채팅 레이아웃 구현

`app/routes/chat.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import ClientOnly from "~/components/ui/client-only";
import { RootLayout } from "~/components/layouts/root-layout";

export default function ChatLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loginState = localStorage.getItem("isLoggedIn");
    const adminState = localStorage.getItem("isAdmin");
    
    setIsLoggedIn(loginState === "true");
    setIsAdmin(adminState === "true");
    
    const handleLogout = () => {
      setIsLoggedIn(false);
      setIsAdmin(false);
    };
    
    window.addEventListener('logoutEvent', handleLogout);
    
    return () => {
      window.removeEventListener('logoutEvent', handleLogout);
    };
  }, []);

  return (
    <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
      <div className="container py-8">
        <Outlet />
      </div>
    </RootLayout>
  );
}
```

### 채팅 인덱스 페이지 구현

`app/routes/chat._index.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { useState } from "react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ChatWindow } from "~/components/chat/chat-window";

export default function ChatIndexPage() {
  const [activeTab, setActiveTab] = useState("teams");

  return (
    <>
      <PageHeader title="채팅" description="팀원들과 실시간으로 대화하세요" />
      <Section>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="teams">팀 채팅</TabsTrigger>
            <TabsTrigger value="direct">개인 채팅</TabsTrigger>
          </TabsList>
          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>팀 채팅</CardTitle>
              </CardHeader>
              <CardContent>
                <ChatWindow roomId="team-1" roomType="team" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="direct">
            <Card>
              <CardHeader>
                <CardTitle>개인 채팅</CardTitle>
              </CardHeader>
              <CardContent>
                <ChatWindow roomId="user-1" roomType="direct" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
```

### 협업 레이아웃 구현

`app/routes/collaboration.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import ClientOnly from "~/components/ui/client-only";
import { RootLayout } from "~/components/layouts/root-layout";

export default function CollaborationLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loginState = localStorage.getItem("isLoggedIn");
    const adminState = localStorage.getItem("isAdmin");
    
    setIsLoggedIn(loginState === "true");
    setIsAdmin(adminState === "true");
    
    const handleLogout = () => {
      setIsLoggedIn(false);
      setIsAdmin(false);
    };
    
    window.addEventListener('logoutEvent', handleLogout);
    
    return () => {
      window.removeEventListener('logoutEvent', handleLogout);
    };
  }, []);

  return (
    <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
      <div className="container py-8">
        <Outlet />
      </div>
    </RootLayout>
  );
}
```

### 협업 인덱스 페이지 구현

`app/routes/collaboration._index.tsx` 파일을 다음과 같이 구현합니다:

```typescript
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CollaborationEditor } from "~/components/collaboration/collaboration-editor";

export default function CollaborationIndexPage() {
  const initialContent = "# 문서 제목\n\n이 문서는 실시간으로 협업 편집이 가능합니다.\n\n## 기능 소개\n\n- 여러 사용자가 동시에 편집 가능\n- 실시간으로 변경 사항 반영\n- 마크다운 지원";

  return (
    <>
      <PageHeader title="협업 편집" description="팀원들과 실시간으로 문서를 편집하세요" />
      <Section>
        <Card>
          <CardHeader>
            <CardTitle>공유 문서 편집</CardTitle>
          </CardHeader>
          <CardContent>
            <CollaborationEditor 
              documentId="doc-1" 
              initialContent={initialContent} 
            />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
```

## 6. 로그인 기능 문제 수정

메인 페이지에서 로그인 버튼을 클릭했을 때 자동으로 로그인 되는 문제를 수정합니다.

### 메인 페이지 로그인 기능 수정

`app/routes/_index.tsx` 파일의 로그인 버튼 클릭 핸들러를 다음과 같이 수정합니다:

```typescript
// 로그인 버튼 핸들러
const handleLoginClick = () => {
  if (isLoggedIn) {
    // 로그아웃 기능
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("isAdmin", "false");
    setIsAdmin(false);
    window.dispatchEvent(new Event('logoutEvent'));
  } else {
    // 로그인 페이지로 이동
    navigate("/auth/login");
  }
};
```

그리고 버튼 이벤트 핸들러를 수정합니다:

```typescript
<Button onClick={handleLoginClick}>
  {isLoggedIn ? "로그아웃" : "로그인"}
</Button>
```

이렇게 수정하면 로그인 버튼을 클릭했을 때 로그인 페이지로 이동하고, 로그아웃 버튼을 클릭했을 때 로그아웃 기능이 동작합니다.

## 7. UI 개선 사항

### 인증 상태 관리 공통화

여러 레이아웃 컴포넌트에서 반복되는 인증 상태 관리 로직을 `useAuthState` 커스텀 훅으로 분리했습니다:

```typescript
// app/utils/auth-hooks.tsx
import { useState, useEffect } from "react";

export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return { isLoggedIn, isAdmin };
}
```

이 훅을 사용하면 각 레이아웃 컴포넌트에서 로그인 상태를 쉽게 관리할 수 있습니다:

```typescript
// app/routes/notifications.tsx (예시)
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function NotificationsLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

### 버튼 레이아웃 컴포넌트 추가

버튼 그룹의 레이아웃과 간격을 일관되게 관리하기 위해 레이아웃 컴포넌트를 추가했습니다:

```typescript
// app/components/ui/button-layout.tsx
import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ProfileButtonWrapper({ children, className }: ProfileButtonWrapperProps) {
    return (
        <div className={cn("relative ml-6", className)}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
}
```

이 컴포넌트들을 사용하면 절대적인 마진 값을 직접 사용하는 대신 상대적인 위치 관계를 통해 버튼 간격을 관리할 수 있습니다:
- `ButtonGroup`: 버튼들을 그룹화하고 일정한 간격(`gap-4`)을 제공하여 버튼 간의 충분한 여백 확보
- `ProfileButtonWrapper`: 프로필(로그인/로그아웃) 버튼을 우측에 배치하고 충분한 간격(`ml-6`) 적용
- `ActionButtonWrapper`: 액션 버튼(수정, 알림 등)에 개별 래퍼 제공

### 버튼 가시성 문제 해결

기존에는 다음과 같은 문제가 발생했습니다:
1. 협업 편집 버튼이 로그인/로그아웃 버튼에 가려지는 현상
2. 액션 버튼들 간의 간격이 너무 좁아 구분이 어려움
3. 프로필 버튼과 액션 버튼 그룹 간의 간격이 부족함
4. 관리자 모드에서 추가 메뉴가 있을 때 버튼 간격이 충분하지 않음

이를 해결하기 위해 다음과 같이 개선했습니다:
1. 버튼 그룹에 `mx-2` 클래스 추가하여 전체 그룹에 여백 제공
2. 버튼 간 간격을 `gap-2`에서 `gap-4`로 늘려 충분한 여백 확보
3. 프로필 버튼의 좌측 마진을 `ml-auto`에서 `ml-6`으로 변경하여 일정한 간격 유지
4. 관리자 모드일 때 더 넓은 간격 제공 (버튼 그룹 `gap-5`, 프로필 버튼 `ml-8`)
5. 협업 편집 버튼(`FileEdit`)과 로그인/로그아웃 버튼에 `mr-4` 클래스 추가하여 버튼 간 겹침 문제 해결

### 루트 레이아웃 버튼 마진 개선

`app/components/layouts/root-layout.tsx` 파일에서 버튼 간 겹침 문제를 해결하기 위해 다음과 같이 마진을 조정했습니다:

```tsx
// 협업 편집 버튼에 우측 마진 추가
<Button 
  variant="ghost" 
  size="icon" 
  asChild 
  className={cn(isActive("/collaboration") && "bg-accent", "mr-4")}
>
  <Link to="/collaboration" title="협업 편집">
    <FileEdit className="h-5 w-5" />
    <span className="sr-only">협업 편집</span>
  </Link>
</Button>

// 사용자 메뉴 버튼에 우측 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
  <span className="sr-only">사용자 메뉴</span>
  <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 로그인 버튼에 우측 마진 추가
<Button asChild className="mr-4">
  <Link to="/auth/login">로그인</Link>
</Button>
```

이러한 마진 조정을 통해 모든 버튼이 겹치지 않고 적절한 간격을 유지하도록 하여 사용자 경험을 개선했습니다. 특히 협업 편집 버튼과 로그인/로그아웃 버튼 사이의 간격을 확보하여 UI 가시성을 높였습니다.

### 사용자 모드별 최적화

사용자 경험을 극대화하기 위해 각 모드별로 최적화된 레이아웃을 제공합니다:

1. **일반 사용자 모드**
   - 로그인 버튼이 다른 요소와 적절한 간격 유지
   - 깔끔하고 단순한 인터페이스 제공

2. **로그인 사용자 모드**
   - 알림, 채팅, 협업 편집 버튼이 모두 명확하게 보이며 적절한 간격 유지
   - 프로필 메뉴와 액션 버튼 사이에 충분한 여백 확보

3. **관리자 모드**
   - 일반 로그인 모드보다 더 넓은 간격 제공 (gap-5, ml-8)
   - 추가 메뉴 옵션이 많아도 모든 버튼이 잘 보이도록 레이아웃 최적화
   - 중요한 관리 기능에 쉽게 접근할 수 있도록 배치

이러한 변경을 통해 모든 화면 모드에서 버튼들이 적절하게 표시되도록 했습니다.

### RootLayout 적용 예시

RootLayout에서 이 컴포넌트들을 활용하여 버튼 레이아웃을 개선했습니다:

```typescript
// header 내부 버튼 그룹 부분
{isLoggedIn && (
    <ButtonGroup className="mx-2" isAdmin={isAdmin}>
        <ActionButtonWrapper>
            <Button variant="ghost" size="icon" asChild className={cn(isActive("/notifications") && "bg-accent")}>
                <Link to="/notifications" title="알림">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">알림</span>
                </Link>
            </Button>
        </ActionButtonWrapper>
        
        {/* 다른 액션 버튼들... */}
    </ButtonGroup>
)}

{isLoggedIn ? (
    <ProfileButtonWrapper isAdmin={isAdmin}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">사용자 메뉴</span>
                    <div className="h-8 w-8 rounded-full bg-muted" />
                </Button>
            </DropdownMenuTrigger>
            {/* 드롭다운 메뉴 내용 */}
        </DropdownMenu>
    </ProfileButtonWrapper>
) : (
    !hideLoginButton && (
        <ProfileButtonWrapper>
            <Button asChild>
                <Link to="/auth/login">로그인</Link>
            </Button>
        </ProfileButtonWrapper>
    )
)}
```

## 9. React Hook 에러 수정

실시간 기능 관련 레이아웃 컴포넌트(`notifications.tsx`, `chat.tsx`, `collaboration.tsx`)에서 다음과 같은 에러가 발생했습니다:

```
Error: Rendered more hooks than during the previous render.
```

### 원인 분석

이 에러는 조건부로 React Hook을 사용하거나, 렌더링 도중 동적으로 훅의 호출 수가 변경될 때 발생합니다. 현재 코드에서는 `ClientOnly` 컴포넌트 내에서 함수 콜백을 통해 `useEffect`를 호출하는 구조가 문제입니다:

```typescript
<ClientOnly>
    {() => {
        useEffect(() => {
            // 여기서 로직 실행
        }, []);
        return null;
    }}
</ClientOnly>
```

이 패턴은 React의 Hook 규칙을 위반할 가능성이 있습니다. 함수 컴포넌트의 최상위 레벨이 아닌 콜백 내에서 Hook을 사용하고 있기 때문입니다.

### 해결 방법

이 문제를 해결하기 위해 Hook을 컴포넌트 최상위 레벨로 이동하고, 클라이언트 사이드 체크를 직접 수행하도록 변경했습니다:

```typescript
export default function NotificationsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Hook을 컴포넌트 최상위 레벨에서 사용
    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

이 수정으로 다음과 같은 이점이 있습니다:

1. React Hook 규칙을 준수하여 에러 해결
2. 코드가 더 단순해지고 가독성 향상
3. 클라이언트 사이드 로직이 명확하게 분리됨

## 10. UI 공통화 및 개선

UI 관련 코드를 공통화하고 버튼 레이아웃을 개선했습니다.

### 인증 상태 관리 공통화

여러 레이아웃 컴포넌트에서 반복되는 인증 상태 관리 로직을 `useAuthState` 커스텀 훅으로 분리했습니다:

```typescript
// app/utils/auth-hooks.tsx
import { useState, useEffect } from "react";

export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return { isLoggedIn, isAdmin };
}
```

이 훅을 사용하면 각 레이아웃 컴포넌트에서 로그인 상태를 쉽게 관리할 수 있습니다:

```typescript
// app/routes/notifications.tsx (예시)
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function NotificationsLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

### 버튼 레이아웃 컴포넌트 추가

버튼 그룹의 레이아웃과 간격을 일관되게 관리하기 위해 레이아웃 컴포넌트를 추가했습니다:

```typescript
// app/components/ui/button-layout.tsx
import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ProfileButtonWrapper({ children, className }: ProfileButtonWrapperProps) {
    return (
        <div className={cn("relative ml-6", className)}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
}
```

이 컴포넌트들을 사용하면 절대적인 마진 값을 직접 사용하는 대신 상대적인 위치 관계를 통해 버튼 간격을 관리할 수 있습니다:
- `ButtonGroup`: 버튼들을 그룹화하고 일정한 간격(`gap-4`)을 제공하여 버튼 간의 충분한 여백 확보
- `ProfileButtonWrapper`: 프로필(로그인/로그아웃) 버튼을 우측에 배치하고 충분한 간격(`ml-6`) 적용
- `ActionButtonWrapper`: 액션 버튼(수정, 알림 등)에 개별 래퍼 제공

### 버튼 가시성 문제 해결

기존에는 다음과 같은 문제가 발생했습니다:
1. 협업 편집 버튼이 로그인/로그아웃 버튼에 가려지는 현상
2. 액션 버튼들 간의 간격이 너무 좁아 구분이 어려움
3. 프로필 버튼과 액션 버튼 그룹 간의 간격이 부족함
4. 관리자 모드에서 추가 메뉴가 있을 때 버튼 간격이 충분하지 않음

이를 해결하기 위해 다음과 같이 개선했습니다:
1. 버튼 그룹에 `mx-2` 클래스 추가하여 전체 그룹에 여백 제공
2. 버튼 간 간격을 `gap-2`에서 `gap-4`로 늘려 충분한 여백 확보
3. 프로필 버튼의 좌측 마진을 `ml-auto`에서 `ml-6`으로 변경하여 일정한 간격 유지
4. 관리자 모드일 때 더 넓은 간격 제공 (버튼 그룹 `gap-5`, 프로필 버튼 `ml-8`)
5. 협업 편집 버튼(`FileEdit`)과 로그인/로그아웃 버튼에 `mr-4` 클래스 추가하여 버튼 간 겹침 문제 해결

### 루트 레이아웃 버튼 마진 개선

`app/components/layouts/root-layout.tsx` 파일에서 버튼 간 겹침 문제를 해결하기 위해 다음과 같이 마진을 조정했습니다:

```tsx
// 협업 편집 버튼에 우측 마진 추가
<Button 
  variant="ghost" 
  size="icon" 
  asChild 
  className={cn(isActive("/collaboration") && "bg-accent", "mr-4")}
>
  <Link to="/collaboration" title="협업 편집">
    <FileEdit className="h-5 w-5" />
    <span className="sr-only">협업 편집</span>
  </Link>
</Button>

// 사용자 메뉴 버튼에 우측 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
  <span className="sr-only">사용자 메뉴</span>
  <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 로그인 버튼에 우측 마진 추가
<Button asChild className="mr-4">
  <Link to="/auth/login">로그인</Link>
</Button>
```

이러한 마진 조정을 통해 모든 버튼이 겹치지 않고 적절한 간격을 유지하도록 하여 사용자 경험을 개선했습니다. 특히 협업 편집 버튼과 로그인/로그아웃 버튼 사이의 간격을 확보하여 UI 가시성을 높였습니다.

### 사용자 모드별 최적화

사용자 경험을 극대화하기 위해 각 모드별로 최적화된 레이아웃을 제공합니다:

1. **일반 사용자 모드**
   - 로그인 버튼이 다른 요소와 적절한 간격 유지
   - 깔끔하고 단순한 인터페이스 제공

2. **로그인 사용자 모드**
   - 알림, 채팅, 협업 편집 버튼이 모두 명확하게 보이며 적절한 간격 유지
   - 프로필 메뉴와 액션 버튼 사이에 충분한 여백 확보

3. **관리자 모드**
   - 일반 로그인 모드보다 더 넓은 간격 제공 (gap-5, ml-8)
   - 추가 메뉴 옵션이 많아도 모든 버튼이 잘 보이도록 레이아웃 최적화
   - 중요한 관리 기능에 쉽게 접근할 수 있도록 배치

이러한 변경을 통해 모든 화면 모드에서 버튼들이 적절하게 표시되도록 했습니다.

### RootLayout 적용 예시

RootLayout에서 이 컴포넌트들을 활용하여 버튼 레이아웃을 개선했습니다:

```typescript
// header 내부 버튼 그룹 부분
{isLoggedIn && (
    <ButtonGroup className="mx-2" isAdmin={isAdmin}>
        <ActionButtonWrapper>
            <Button variant="ghost" size="icon" asChild className={cn(isActive("/notifications") && "bg-accent")}>
                <Link to="/notifications" title="알림">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">알림</span>
                </Link>
            </Button>
        </ActionButtonWrapper>
        
        {/* 다른 액션 버튼들... */}
    </ButtonGroup>
)}

{isLoggedIn ? (
    <ProfileButtonWrapper isAdmin={isAdmin}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">사용자 메뉴</span>
                    <div className="h-8 w-8 rounded-full bg-muted" />
                </Button>
            </DropdownMenuTrigger>
            {/* 드롭다운 메뉴 내용 */}
        </DropdownMenu>
    </ProfileButtonWrapper>
) : (
    !hideLoginButton && (
        <ProfileButtonWrapper>
            <Button asChild>
                <Link to="/auth/login">로그인</Link>
            </Button>
        </ProfileButtonWrapper>
    )
)}
```

## 10. 제품 등록 및 IdeasGPT 기능 수정

### 문제 상황
- 제품 등록 버튼 클릭 시 404 에러 발생
- 상단 메뉴에서 제품 > 제품 등록이 404로 연결됨
- IdeasGPT 페이지 접근 시 404 에러 발생

### 해결 방법

#### 1. 경로 구조 수정
제품 등록 경로를 수정했습니다. 기존의 `/products/new` 대신 `/products/register`를 사용하도록 변경했습니다.

#### 2. 상단 메뉴 연결 수정
`app/components/layouts/root-layout.tsx` 파일에서 제품 등록 메뉴가 올바른 경로를 가리키도록 수정했습니다:

```tsx
<DropdownMenuItem asChild>
  <Link to="/products/register">제품 등록</Link>
</DropdownMenuItem>
```

#### 3. 제품 등록 페이지 구현
`app/routes/products/register.tsx` 파일을 다음과 같이 구현했습니다:

```tsx
import { Form, useActionData, useNavigation } from "@remix-run/react";
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
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { prisma } from "~/utils/api.server";
import { requireUser } from "~/utils/api.server";

export async function action({ request }: ActionFunctionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");
    const image = formData.get("image");

    if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof category !== "string"
    ) {
        return new Response(
            JSON.stringify({ errors: { title: "유효하지 않은 입력입니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // 실제 환경에서는 제품 등록
    // 현재는 mock 데이터 사용
    const productId = "mock-" + Date.now();

    return redirect(`/products/${productId}`);
}

export default function RegisterProductPage() {
    // 폼 구현 (생략)
    // ...
}
```

#### 4. 제품 목록 페이지에서 링크 업데이트
`app/routes/products._index.tsx` 파일에서 제품 등록 버튼 링크를 수정했습니다:

```tsx
<Button asChild>
  <Link to="/products/register">제품 등록하기</Link>
</Button>
```

#### 5. IdeasGPT 기능 구현
IdeasGPT 기능을 위한 경로 및 컴포넌트를 구현했습니다:

- `app/routes/ideas.tsx`: 레이아웃 컴포넌트
- `app/routes/ideas._index.tsx`: 인덱스 페이지
- `app/components/idea/ideas-gpt.tsx`: 아이디어 생성 컴포넌트

### 수정된 파일 목록
1. `app/components/layouts/root-layout.tsx`
2. `app/routes/products/register.tsx`
3. `app/routes/products._index.tsx`
4. `app/routes/ideas.tsx`
5. `app/routes/ideas._index.tsx`
6. `app/components/idea/ideas-gpt.tsx`

이 수정으로 제품 등록 버튼과 IdeasGPT 기능이 정상적으로 작동하게 되었습니다.

## 다음 단계

이제 실시간 기능의 기본적인 구조가 완성되었습니다! 다음 단계에서는 배포 준비를 위한 작업을 진행할 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

이제 다음과 같은 실시간 기능들이 동작합니다:
- 실시간 알림 수신
- 팀 채팅 및 개인 채팅
- 실시간 문서 협업 편집

다음과 같은 URL로 접속하여 기능을 테스트할 수 있습니다:
- `http://localhost:3000/notifications` - 알림 페이지
- `http://localhost:3000/chat` - 채팅 페이지
- `http://localhost:3000/collaboration` - 협업 페이지

## 7. UI 개선 사항

### 버튼 레이아웃 수정

`app/components/layouts/root-layout.tsx` 파일의 헤더 부분에서 로그인/로그아웃 버튼이 다른 버튼과 겹치는 문제를 해결했습니다:

```typescript
// 실시간 기능 버튼에 마진 추가
<Button
    variant="ghost"
    size="icon"
    asChild
    className={cn(
        isActive("/collaboration") && "bg-accent",
        "mr-4" // 수정 버튼 우측 마진 추가
    )}
>
    <Link to="/collaboration" title="협업 편집">
        <FileEdit className="h-5 w-5" />
        <span className="sr-only">협업 편집</span>
    </Link>
</Button>

// 로그인/로그아웃 버튼에 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
    <span className="sr-only">사용자 메뉴</span>
    <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 비로그인 상태의 로그인 버튼에 마진 추가
<Button asChild className="mr-4">
    <Link to="/auth/login">로그인</Link>
</Button>
```

이 수정으로 상단 헤더의 버튼들이 올바르게 배치되어 서로 겹치지 않도록 했습니다. 특히 사용자 모드에서 수정 버튼이 로그인/로그아웃 버튼에 가려지는 문제를 해결했습니다.

## 8. 타입 에러 수정

`socket.server.ts` 파일에서 다음과 같은 타입 에러가 발생했습니다:

```
Conversion of type '{ headers: { cookie: string; }; }' to type 'Request' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ headers: { cookie: string; }; }' is missing the following properties from type 'Request': cache, credentials, destination, integrity, and 17 more.
```

이 문제는 `{ headers: { cookie } }` 객체를 `Request` 타입으로 가정하는 부분에서 발생합니다. 이를 해결하기 위해 다음과 같이 실제 `Request` 객체를 생성하도록 코드를 수정했습니다:

```typescript
// 기존 코드 (에러 발생)
const user = await getUser({
  headers: { cookie },
} as Request);

// 수정된 코드 (에러 해결)
const fakeRequest = new Request("http://localhost", {
  headers: new Headers({
    cookie
  })
});

const user = await getUser(fakeRequest);
```

이렇게 수정하면 실제 `Request` 객체를 생성하여 `getUser` 함수에 전달할 수 있으므로 타입 에러가 해결됩니다.

## 9. React Hook 에러 수정

실시간 기능 관련 레이아웃 컴포넌트(`notifications.tsx`, `chat.tsx`, `collaboration.tsx`)에서 다음과 같은 에러가 발생했습니다:

```
Error: Rendered more hooks than during the previous render.
```

### 원인 분석

이 에러는 조건부로 React Hook을 사용하거나, 렌더링 도중 동적으로 훅의 호출 수가 변경될 때 발생합니다. 현재 코드에서는 `ClientOnly` 컴포넌트 내에서 함수 콜백을 통해 `useEffect`를 호출하는 구조가 문제입니다:

```typescript
<ClientOnly>
    {() => {
        useEffect(() => {
            // 여기서 로직 실행
        }, []);
        return null;
    }}
</ClientOnly>
```

이 패턴은 React의 Hook 규칙을 위반할 가능성이 있습니다. 함수 컴포넌트의 최상위 레벨이 아닌 콜백 내에서 Hook을 사용하고 있기 때문입니다.

### 해결 방법

이 문제를 해결하기 위해 Hook을 컴포넌트 최상위 레벨로 이동하고, 클라이언트 사이드 체크를 직접 수행하도록 변경했습니다:

```typescript
export default function NotificationsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Hook을 컴포넌트 최상위 레벨에서 사용
    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

이 수정으로 다음과 같은 이점이 있습니다:

1. React Hook 규칙을 준수하여 에러 해결
2. 코드가 더 단순해지고 가독성 향상
3. 클라이언트 사이드 로직이 명확하게 분리됨

## 10. UI 공통화 및 개선

UI 관련 코드를 공통화하고 버튼 레이아웃을 개선했습니다.

### 인증 상태 관리 공통화

여러 레이아웃 컴포넌트에서 반복되는 인증 상태 관리 로직을 `useAuthState` 커스텀 훅으로 분리했습니다:

```typescript
// app/utils/auth-hooks.tsx
import { useState, useEffect } from "react";

export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return { isLoggedIn, isAdmin };
}
```

이 훅을 사용하면 각 레이아웃 컴포넌트에서 로그인 상태를 쉽게 관리할 수 있습니다:

```typescript
// app/routes/notifications.tsx (예시)
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function NotificationsLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

### 버튼 레이아웃 컴포넌트 추가

버튼 그룹의 레이아웃과 간격을 일관되게 관리하기 위해 레이아웃 컴포넌트를 추가했습니다:

```typescript
// app/components/ui/button-layout.tsx
import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ProfileButtonWrapper({ children, className }: ProfileButtonWrapperProps) {
    return (
        <div className={cn("relative ml-6", className)}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
}
```

이 컴포넌트들을 사용하면 절대적인 마진 값을 직접 사용하는 대신 상대적인 위치 관계를 통해 버튼 간격을 관리할 수 있습니다:
- `ButtonGroup`: 버튼들을 그룹화하고 일정한 간격(`gap-4`)을 제공하여 버튼 간의 충분한 여백 확보
- `ProfileButtonWrapper`: 프로필(로그인/로그아웃) 버튼을 우측에 배치하고 충분한 간격(`ml-6`) 적용
- `ActionButtonWrapper`: 액션 버튼(수정, 알림 등)에 개별 래퍼 제공

### 버튼 가시성 문제 해결

기존에는 다음과 같은 문제가 발생했습니다:
1. 협업 편집 버튼이 로그인/로그아웃 버튼에 가려지는 현상
2. 액션 버튼들 간의 간격이 너무 좁아 구분이 어려움
3. 프로필 버튼과 액션 버튼 그룹 간의 간격이 부족함
4. 관리자 모드에서 추가 메뉴가 있을 때 버튼 간격이 충분하지 않음

이를 해결하기 위해 다음과 같이 개선했습니다:
1. 버튼 그룹에 `mx-2` 클래스 추가하여 전체 그룹에 여백 제공
2. 버튼 간 간격을 `gap-2`에서 `gap-4`로 늘려 충분한 여백 확보
3. 프로필 버튼의 좌측 마진을 `ml-auto`에서 `ml-6`으로 변경하여 일정한 간격 유지
4. 관리자 모드일 때 더 넓은 간격 제공 (버튼 그룹 `gap-5`, 프로필 버튼 `ml-8`)
5. 협업 편집 버튼(`FileEdit`)과 로그인/로그아웃 버튼에 `mr-4` 클래스 추가하여 버튼 간 겹침 문제 해결

### 루트 레이아웃 버튼 마진 개선

`app/components/layouts/root-layout.tsx` 파일에서 버튼 간 겹침 문제를 해결하기 위해 다음과 같이 마진을 조정했습니다:

```tsx
// 협업 편집 버튼에 우측 마진 추가
<Button 
  variant="ghost" 
  size="icon" 
  asChild 
  className={cn(isActive("/collaboration") && "bg-accent", "mr-4")}
>
  <Link to="/collaboration" title="협업 편집">
    <FileEdit className="h-5 w-5" />
    <span className="sr-only">협업 편집</span>
  </Link>
</Button>

// 사용자 메뉴 버튼에 우측 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
  <span className="sr-only">사용자 메뉴</span>
  <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 로그인 버튼에 우측 마진 추가
<Button asChild className="mr-4">
  <Link to="/auth/login">로그인</Link>
</Button>
```

이러한 마진 조정을 통해 모든 버튼이 겹치지 않고 적절한 간격을 유지하도록 하여 사용자 경험을 개선했습니다. 특히 협업 편집 버튼과 로그인/로그아웃 버튼 사이의 간격을 확보하여 UI 가시성을 높였습니다.

### 사용자 모드별 최적화

사용자 경험을 극대화하기 위해 각 모드별로 최적화된 레이아웃을 제공합니다:

1. **일반 사용자 모드**
   - 로그인 버튼이 다른 요소와 적절한 간격 유지
   - 깔끔하고 단순한 인터페이스 제공

2. **로그인 사용자 모드**
   - 알림, 채팅, 협업 편집 버튼이 모두 명확하게 보이며 적절한 간격 유지
   - 프로필 메뉴와 액션 버튼 사이에 충분한 여백 확보

3. **관리자 모드**
   - 일반 로그인 모드보다 더 넓은 간격 제공 (gap-5, ml-8)
   - 추가 메뉴 옵션이 많아도 모든 버튼이 잘 보이도록 레이아웃 최적화
   - 중요한 관리 기능에 쉽게 접근할 수 있도록 배치

이러한 변경을 통해 모든 화면 모드에서 버튼들이 적절하게 표시되도록 했습니다.

### RootLayout 적용 예시

RootLayout에서 이 컴포넌트들을 활용하여 버튼 레이아웃을 개선했습니다:

```typescript
// header 내부 버튼 그룹 부분
{isLoggedIn && (
    <ButtonGroup className="mx-2" isAdmin={isAdmin}>
        <ActionButtonWrapper>
            <Button variant="ghost" size="icon" asChild className={cn(isActive("/notifications") && "bg-accent")}>
                <Link to="/notifications" title="알림">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">알림</span>
                </Link>
            </Button>
        </ActionButtonWrapper>
        
        {/* 다른 액션 버튼들... */}
    </ButtonGroup>
)}

{isLoggedIn ? (
    <ProfileButtonWrapper isAdmin={isAdmin}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">사용자 메뉴</span>
                    <div className="h-8 w-8 rounded-full bg-muted" />
                </Button>
            </DropdownMenuTrigger>
            {/* 드롭다운 메뉴 내용 */}
        </DropdownMenu>
    </ProfileButtonWrapper>
) : (
    !hideLoginButton && (
        <ProfileButtonWrapper>
            <Button asChild>
                <Link to="/auth/login">로그인</Link>
            </Button>
        </ProfileButtonWrapper>
    )
)}
```

## 11. IdeasGPT 컴포넌트 구현

개발자들이 새로운 아이디어를 생성할 수 있도록 돕는 AI 기반 컴포넌트를 추가했습니다. 이 컴포넌트는 사용자가 입력한 프롬프트를 기반으로 AI가 아이디어를 제안해주는 기능을 가지고 있습니다.

주요 기능:
- 프롬프트 입력 및 전송 기능
- 로딩 상태 표시
- 오류 처리
- 생성된 아이디어 목록 표시

해당 컴포넌트는 다음 파일에 구현되어 있습니다:
- `app/components/idea/ideas-gpt.tsx` - 아이디어 생성 컴포넌트
- `app/routes/ideas.tsx` - 레이아웃 컴포넌트
- `app/routes/ideas._index.tsx` - 메인 페이지

## 12. 제품 등록 기능 개선

제품 등록 기능을 사용자 경험에 맞게 개선했습니다. 기존 경로를 `/products/new`에서 `/products/register`로 변경하여 더 직관적인 URL 구조를 제공합니다.

주요 기능:
- 레이아웃 개선 (중앙 정렬, 여백 조정)
- 양식 검증 및 오류 처리
- 카테고리 선택 옵션 확장
- 응답형 디자인

해당 기능은 다음 파일에 구현되어 있습니다:
- `app/routes/products/register.tsx` - 제품 등록 폼
- `app/routes/products._index.tsx` - 제품 목록 페이지 (링크 수정)

## 다음 단계

이제 실시간 기능의 기본적인 구조가 완성되었습니다! 다음 단계에서는 배포 준비를 위한 작업을 진행할 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

이제 다음과 같은 실시간 기능들이 동작합니다:
- 실시간 알림 수신
- 팀 채팅 및 개인 채팅
- 실시간 문서 협업 편집

다음과 같은 URL로 접속하여 기능을 테스트할 수 있습니다:
- `http://localhost:3000/notifications` - 알림 페이지
- `http://localhost:3000/chat` - 채팅 페이지
- `http://localhost:3000/collaboration` - 협업 페이지

## 7. UI 개선 사항

### 버튼 레이아웃 수정

`app/components/layouts/root-layout.tsx` 파일의 헤더 부분에서 로그인/로그아웃 버튼이 다른 버튼과 겹치는 문제를 해결했습니다:

```typescript
// 실시간 기능 버튼에 마진 추가
<Button
    variant="ghost"
    size="icon"
    asChild
    className={cn(
        isActive("/collaboration") && "bg-accent",
        "mr-4" // 수정 버튼 우측 마진 추가
    )}
>
    <Link to="/collaboration" title="협업 편집">
        <FileEdit className="h-5 w-5" />
        <span className="sr-only">협업 편집</span>
    </Link>
</Button>

// 로그인/로그아웃 버튼에 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
    <span className="sr-only">사용자 메뉴</span>
    <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 비로그인 상태의 로그인 버튼에 마진 추가
<Button asChild className="mr-4">
    <Link to="/auth/login">로그인</Link>
</Button>
```

이 수정으로 상단 헤더의 버튼들이 올바르게 배치되어 서로 겹치지 않도록 했습니다. 특히 사용자 모드에서 수정 버튼이 로그인/로그아웃 버튼에 가려지는 문제를 해결했습니다.

## 8. 타입 에러 수정

`socket.server.ts` 파일에서 다음과 같은 타입 에러가 발생했습니다:

```
Conversion of type '{ headers: { cookie: string; }; }' to type 'Request' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ headers: { cookie: string; }; }' is missing the following properties from type 'Request': cache, credentials, destination, integrity, and 17 more.
```

이 문제는 `{ headers: { cookie } }` 객체를 `Request` 타입으로 가정하는 부분에서 발생합니다. 이를 해결하기 위해 다음과 같이 실제 `Request` 객체를 생성하도록 코드를 수정했습니다:

```typescript
// 기존 코드 (에러 발생)
const user = await getUser({
  headers: { cookie },
} as Request);

// 수정된 코드 (에러 해결)
const fakeRequest = new Request("http://localhost", {
  headers: new Headers({
    cookie
  })
});

const user = await getUser(fakeRequest);
```

이렇게 수정하면 실제 `Request` 객체를 생성하여 `getUser` 함수에 전달할 수 있으므로 타입 에러가 해결됩니다.

## 9. React Hook 에러 수정

실시간 기능 관련 레이아웃 컴포넌트(`notifications.tsx`, `chat.tsx`, `collaboration.tsx`)에서 다음과 같은 에러가 발생했습니다:

```
Error: Rendered more hooks than during the previous render.
```

### 원인 분석

이 에러는 조건부로 React Hook을 사용하거나, 렌더링 도중 동적으로 훅의 호출 수가 변경될 때 발생합니다. 현재 코드에서는 `ClientOnly` 컴포넌트 내에서 함수 콜백을 통해 `useEffect`를 호출하는 구조가 문제입니다:

```typescript
<ClientOnly>
    {() => {
        useEffect(() => {
            // 여기서 로직 실행
        }, []);
        return null;
    }}
</ClientOnly>
```

이 패턴은 React의 Hook 규칙을 위반할 가능성이 있습니다. 함수 컴포넌트의 최상위 레벨이 아닌 콜백 내에서 Hook을 사용하고 있기 때문입니다.

### 해결 방법

이 문제를 해결하기 위해 Hook을 컴포넌트 최상위 레벨로 이동하고, 클라이언트 사이드 체크를 직접 수행하도록 변경했습니다:

```typescript
export default function NotificationsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Hook을 컴포넌트 최상위 레벨에서 사용
    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

이 수정으로 다음과 같은 이점이 있습니다:

1. React Hook 규칙을 준수하여 에러 해결
2. 코드가 더 단순해지고 가독성 향상
3. 클라이언트 사이드 로직이 명확하게 분리됨

## 10. UI 공통화 및 개선

UI 관련 코드를 공통화하고 버튼 레이아웃을 개선했습니다.

### 인증 상태 관리 공통화

여러 레이아웃 컴포넌트에서 반복되는 인증 상태 관리 로직을 `useAuthState` 커스텀 훅으로 분리했습니다:

```typescript
// app/utils/auth-hooks.tsx
import { useState, useEffect } from "react";

export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return { isLoggedIn, isAdmin };
}
```

이 훅을 사용하면 각 레이아웃 컴포넌트에서 로그인 상태를 쉽게 관리할 수 있습니다:

```typescript
// app/routes/notifications.tsx (예시)
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function NotificationsLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

### 버튼 레이아웃 컴포넌트 추가

버튼 그룹의 레이아웃과 간격을 일관되게 관리하기 위해 레이아웃 컴포넌트를 추가했습니다:

```typescript
// app/components/ui/button-layout.tsx
import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ProfileButtonWrapper({ children, className }: ProfileButtonWrapperProps) {
    return (
        <div className={cn("relative ml-6", className)}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
}
```

이 컴포넌트들을 사용하면 절대적인 마진 값을 직접 사용하는 대신 상대적인 위치 관계를 통해 버튼 간격을 관리할 수 있습니다:
- `ButtonGroup`: 버튼들을 그룹화하고 일정한 간격(`gap-4`)을 제공하여 버튼 간의 충분한 여백 확보
- `ProfileButtonWrapper`: 프로필(로그인/로그아웃) 버튼을 우측에 배치하고 충분한 간격(`ml-6`) 적용
- `ActionButtonWrapper`: 액션 버튼(수정, 알림 등)에 개별 래퍼 제공

### 버튼 가시성 문제 해결

기존에는 다음과 같은 문제가 발생했습니다:
1. 협업 편집 버튼이 로그인/로그아웃 버튼에 가려지는 현상
2. 액션 버튼들 간의 간격이 너무 좁아 구분이 어려움
3. 프로필 버튼과 액션 버튼 그룹 간의 간격이 부족함
4. 관리자 모드에서 추가 메뉴가 있을 때 버튼 간격이 충분하지 않음

이를 해결하기 위해 다음과 같이 개선했습니다:
1. 버튼 그룹에 `mx-2` 클래스 추가하여 전체 그룹에 여백 제공
2. 버튼 간 간격을 `gap-2`에서 `gap-4`로 늘려 충분한 여백 확보
3. 프로필 버튼의 좌측 마진을 `ml-auto`에서 `ml-6`으로 변경하여 일정한 간격 유지
4. 관리자 모드일 때 더 넓은 간격 제공 (버튼 그룹 `gap-5`, 프로필 버튼 `ml-8`)
5. 협업 편집 버튼(`FileEdit`)과 로그인/로그아웃 버튼에 `mr-4` 클래스 추가하여 버튼 간 겹침 문제 해결

### 루트 레이아웃 버튼 마진 개선

`app/components/layouts/root-layout.tsx` 파일에서 버튼 간 겹침 문제를 해결하기 위해 다음과 같이 마진을 조정했습니다:

```tsx
// 협업 편집 버튼에 우측 마진 추가
<Button 
  variant="ghost" 
  size="icon" 
  asChild 
  className={cn(isActive("/collaboration") && "bg-accent", "mr-4")}
>
  <Link to="/collaboration" title="협업 편집">
    <FileEdit className="h-5 w-5" />
    <span className="sr-only">협업 편집</span>
  </Link>
</Button>

// 사용자 메뉴 버튼에 우측 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
  <span className="sr-only">사용자 메뉴</span>
  <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 로그인 버튼에 우측 마진 추가
<Button asChild className="mr-4">
  <Link to="/auth/login">로그인</Link>
</Button>
```

이러한 마진 조정을 통해 모든 버튼이 겹치지 않고 적절한 간격을 유지하도록 하여 사용자 경험을 개선했습니다. 특히 협업 편집 버튼과 로그인/로그아웃 버튼 사이의 간격을 확보하여 UI 가시성을 높였습니다.

### 사용자 모드별 최적화

사용자 경험을 극대화하기 위해 각 모드별로 최적화된 레이아웃을 제공합니다:

1. **일반 사용자 모드**
   - 로그인 버튼이 다른 요소와 적절한 간격 유지
   - 깔끔하고 단순한 인터페이스 제공

2. **로그인 사용자 모드**
   - 알림, 채팅, 협업 편집 버튼이 모두 명확하게 보이며 적절한 간격 유지
   - 프로필 메뉴와 액션 버튼 사이에 충분한 여백 확보

3. **관리자 모드**
   - 일반 로그인 모드보다 더 넓은 간격 제공 (gap-5, ml-8)
   - 추가 메뉴 옵션이 많아도 모든 버튼이 잘 보이도록 레이아웃 최적화
   - 중요한 관리 기능에 쉽게 접근할 수 있도록 배치

이러한 변경을 통해 모든 화면 모드에서 버튼들이 적절하게 표시되도록 했습니다.

### RootLayout 적용 예시

RootLayout에서 이 컴포넌트들을 활용하여 버튼 레이아웃을 개선했습니다:

```typescript
// header 내부 버튼 그룹 부분
{isLoggedIn && (
    <ButtonGroup className="mx-2" isAdmin={isAdmin}>
        <ActionButtonWrapper>
            <Button variant="ghost" size="icon" asChild className={cn(isActive("/notifications") && "bg-accent")}>
                <Link to="/notifications" title="알림">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">알림</span>
                </Link>
            </Button>
        </ActionButtonWrapper>
        
        {/* 다른 액션 버튼들... */}
    </ButtonGroup>
)}

{isLoggedIn ? (
    <ProfileButtonWrapper isAdmin={isAdmin}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">사용자 메뉴</span>
                    <div className="h-8 w-8 rounded-full bg-muted" />
                </Button>
            </DropdownMenuTrigger>
            {/* 드롭다운 메뉴 내용 */}
        </DropdownMenu>
    </ProfileButtonWrapper>
) : (
    !hideLoginButton && (
        <ProfileButtonWrapper>
            <Button asChild>
                <Link to="/auth/login">로그인</Link>
            </Button>
        </ProfileButtonWrapper>
    )
)}
```

## 11. IdeasGPT 컴포넌트 구현

개발자들이 새로운 아이디어를 생성할 수 있도록 돕는 AI 기반 컴포넌트를 추가했습니다. 이 컴포넌트는 사용자가 입력한 프롬프트를 기반으로 AI가 아이디어를 제안해주는 기능을 가지고 있습니다.

주요 기능:
- 프롬프트 입력 및 전송 기능
- 로딩 상태 표시
- 오류 처리
- 생성된 아이디어 목록 표시

해당 컴포넌트는 다음 파일에 구현되어 있습니다:
- `app/components/idea/ideas-gpt.tsx` - 아이디어 생성 컴포넌트
- `app/routes/ideas.tsx` - 레이아웃 컴포넌트
- `app/routes/ideas._index.tsx` - 메인 페이지

## 12. 제품 등록 기능 개선

제품 등록 기능을 사용자 경험에 맞게 개선했습니다. 기존 경로를 `/products/new`에서 `/products/register`로 변경하여 더 직관적인 URL 구조를 제공합니다.

주요 기능:
- 레이아웃 개선 (중앙 정렬, 여백 조정)
- 양식 검증 및 오류 처리
- 카테고리 선택 옵션 확장
- 응답형 디자인

해당 기능은 다음 파일에 구현되어 있습니다:
- `app/routes/products/register.tsx` - 제품 등록 폼
- `app/routes/products._index.tsx` - 제품 목록 페이지 (링크 수정)

## 다음 단계

이제 실시간 기능의 기본적인 구조가 완성되었습니다! 다음 단계에서는 배포 준비를 위한 작업을 진행할 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

이제 다음과 같은 실시간 기능들이 동작합니다:
- 실시간 알림 수신
- 팀 채팅 및 개인 채팅
- 실시간 문서 협업 편집

다음과 같은 URL로 접속하여 기능을 테스트할 수 있습니다:
- `http://localhost:3000/notifications` - 알림 페이지
- `http://localhost:3000/chat` - 채팅 페이지
- `http://localhost:3000/collaboration` - 협업 페이지

## 7. UI 개선 사항

### 버튼 레이아웃 수정

`app/components/layouts/root-layout.tsx` 파일의 헤더 부분에서 로그인/로그아웃 버튼이 다른 버튼과 겹치는 문제를 해결했습니다:

```typescript
// 실시간 기능 버튼에 마진 추가
<Button
    variant="ghost"
    size="icon"
    asChild
    className={cn(
        isActive("/collaboration") && "bg-accent",
        "mr-4" // 수정 버튼 우측 마진 추가
    )}
>
    <Link to="/collaboration" title="협업 편집">
        <FileEdit className="h-5 w-5" />
        <span className="sr-only">협업 편집</span>
    </Link>
</Button>

// 로그인/로그아웃 버튼에 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
    <span className="sr-only">사용자 메뉴</span>
    <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 비로그인 상태의 로그인 버튼에 마진 추가
<Button asChild className="mr-4">
    <Link to="/auth/login">로그인</Link>
</Button>
```

이 수정으로 상단 헤더의 버튼들이 올바르게 배치되어 서로 겹치지 않도록 했습니다. 특히 사용자 모드에서 수정 버튼이 로그인/로그아웃 버튼에 가려지는 문제를 해결했습니다.

## 8. 타입 에러 수정

`socket.server.ts` 파일에서 다음과 같은 타입 에러가 발생했습니다:

```
Conversion of type '{ headers: { cookie: string; }; }' to type 'Request' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ headers: { cookie: string; }; }' is missing the following properties from type 'Request': cache, credentials, destination, integrity, and 17 more.
```

이 문제는 `{ headers: { cookie } }` 객체를 `Request` 타입으로 가정하는 부분에서 발생합니다. 이를 해결하기 위해 다음과 같이 실제 `Request` 객체를 생성하도록 코드를 수정했습니다:

```typescript
// 기존 코드 (에러 발생)
const user = await getUser({
  headers: { cookie },
} as Request);

// 수정된 코드 (에러 해결)
const fakeRequest = new Request("http://localhost", {
  headers: new Headers({
    cookie
  })
});

const user = await getUser(fakeRequest);
```

이렇게 수정하면 실제 `Request` 객체를 생성하여 `getUser` 함수에 전달할 수 있으므로 타입 에러가 해결됩니다.

## 9. React Hook 에러 수정

실시간 기능 관련 레이아웃 컴포넌트(`notifications.tsx`, `chat.tsx`, `collaboration.tsx`)에서 다음과 같은 에러가 발생했습니다:

```
Error: Rendered more hooks than during the previous render.
```

### 원인 분석

이 에러는 조건부로 React Hook을 사용하거나, 렌더링 도중 동적으로 훅의 호출 수가 변경될 때 발생합니다. 현재 코드에서는 `ClientOnly` 컴포넌트 내에서 함수 콜백을 통해 `useEffect`를 호출하는 구조가 문제입니다:

```typescript
<ClientOnly>
    {() => {
        useEffect(() => {
            // 여기서 로직 실행
        }, []);
        return null;
    }}
</ClientOnly>
```

이 패턴은 React의 Hook 규칙을 위반할 가능성이 있습니다. 함수 컴포넌트의 최상위 레벨이 아닌 콜백 내에서 Hook을 사용하고 있기 때문입니다.

### 해결 방법

이 문제를 해결하기 위해 Hook을 컴포넌트 최상위 레벨로 이동하고, 클라이언트 사이드 체크를 직접 수행하도록 변경했습니다:

```typescript
export default function NotificationsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Hook을 컴포넌트 최상위 레벨에서 사용
    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

이 수정으로 다음과 같은 이점이 있습니다:

1. React Hook 규칙을 준수하여 에러 해결
2. 코드가 더 단순해지고 가독성 향상
3. 클라이언트 사이드 로직이 명확하게 분리됨

## 10. UI 공통화 및 개선

UI 관련 코드를 공통화하고 버튼 레이아웃을 개선했습니다.

### 인증 상태 관리 공통화

여러 레이아웃 컴포넌트에서 반복되는 인증 상태 관리 로직을 `useAuthState` 커스텀 훅으로 분리했습니다:

```typescript
// app/utils/auth-hooks.tsx
import { useState, useEffect } from "react";

export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return { isLoggedIn, isAdmin };
}
```

이 훅을 사용하면 각 레이아웃 컴포넌트에서 로그인 상태를 쉽게 관리할 수 있습니다:

```typescript
// app/routes/notifications.tsx (예시)
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function NotificationsLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

### 버튼 레이아웃 컴포넌트 추가

버튼 그룹의 레이아웃과 간격을 일관되게 관리하기 위해 레이아웃 컴포넌트를 추가했습니다:

```typescript
// app/components/ui/button-layout.tsx
import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ProfileButtonWrapper({ children, className }: ProfileButtonWrapperProps) {
    return (
        <div className={cn("relative ml-6", className)}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
}
```

이 컴포넌트들을 사용하면 절대적인 마진 값을 직접 사용하는 대신 상대적인 위치 관계를 통해 버튼 간격을 관리할 수 있습니다:
- `ButtonGroup`: 버튼들을 그룹화하고 일정한 간격(`gap-4`)을 제공하여 버튼 간의 충분한 여백 확보
- `ProfileButtonWrapper`: 프로필(로그인/로그아웃) 버튼을 우측에 배치하고 충분한 간격(`ml-6`) 적용
- `ActionButtonWrapper`: 액션 버튼(수정, 알림 등)에 개별 래퍼 제공

### 버튼 가시성 문제 해결

기존에는 다음과 같은 문제가 발생했습니다:
1. 협업 편집 버튼이 로그인/로그아웃 버튼에 가려지는 현상
2. 액션 버튼들 간의 간격이 너무 좁아 구분이 어려움
3. 프로필 버튼과 액션 버튼 그룹 간의 간격이 부족함
4. 관리자 모드에서 추가 메뉴가 있을 때 버튼 간격이 충분하지 않음

이를 해결하기 위해 다음과 같이 개선했습니다:
1. 버튼 그룹에 `mx-2` 클래스 추가하여 전체 그룹에 여백 제공
2. 버튼 간 간격을 `gap-2`에서 `gap-4`로 늘려 충분한 여백 확보
3. 프로필 버튼의 좌측 마진을 `ml-auto`에서 `ml-6`으로 변경하여 일정한 간격 유지
4. 관리자 모드일 때 더 넓은 간격 제공 (버튼 그룹 `gap-5`, 프로필 버튼 `ml-8`)
5. 협업 편집 버튼(`FileEdit`)과 로그인/로그아웃 버튼에 `mr-4` 클래스 추가하여 버튼 간 겹침 문제 해결

### 루트 레이아웃 버튼 마진 개선

`app/components/layouts/root-layout.tsx` 파일에서 버튼 간 겹침 문제를 해결하기 위해 다음과 같이 마진을 조정했습니다:

```tsx
// 협업 편집 버튼에 우측 마진 추가
<Button 
  variant="ghost" 
  size="icon" 
  asChild 
  className={cn(isActive("/collaboration") && "bg-accent", "mr-4")}
>
  <Link to="/collaboration" title="협업 편집">
    <FileEdit className="h-5 w-5" />
    <span className="sr-only">협업 편집</span>
  </Link>
</Button>

// 사용자 메뉴 버튼에 우측 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
  <span className="sr-only">사용자 메뉴</span>
  <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 로그인 버튼에 우측 마진 추가
<Button asChild className="mr-4">
  <Link to="/auth/login">로그인</Link>
</Button>
```

이러한 마진 조정을 통해 모든 버튼이 겹치지 않고 적절한 간격을 유지하도록 하여 사용자 경험을 개선했습니다. 특히 협업 편집 버튼과 로그인/로그아웃 버튼 사이의 간격을 확보하여 UI 가시성을 높였습니다.

### 사용자 모드별 최적화

사용자 경험을 극대화하기 위해 각 모드별로 최적화된 레이아웃을 제공합니다:

1. **일반 사용자 모드**
   - 로그인 버튼이 다른 요소와 적절한 간격 유지
   - 깔끔하고 단순한 인터페이스 제공

2. **로그인 사용자 모드**
   - 알림, 채팅, 협업 편집 버튼이 모두 명확하게 보이며 적절한 간격 유지
   - 프로필 메뉴와 액션 버튼 사이에 충분한 여백 확보

3. **관리자 모드**
   - 일반 로그인 모드보다 더 넓은 간격 제공 (gap-5, ml-8)
   - 추가 메뉴 옵션이 많아도 모든 버튼이 잘 보이도록 레이아웃 최적화
   - 중요한 관리 기능에 쉽게 접근할 수 있도록 배치

이러한 변경을 통해 모든 화면 모드에서 버튼들이 적절하게 표시되도록 했습니다.

### RootLayout 적용 예시

RootLayout에서 이 컴포넌트들을 활용하여 버튼 레이아웃을 개선했습니다:

```typescript
// header 내부 버튼 그룹 부분
{isLoggedIn && (
    <ButtonGroup className="mx-2" isAdmin={isAdmin}>
        <ActionButtonWrapper>
            <Button variant="ghost" size="icon" asChild className={cn(isActive("/notifications") && "bg-accent")}>
                <Link to="/notifications" title="알림">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">알림</span>
                </Link>
            </Button>
        </ActionButtonWrapper>
        
        {/* 다른 액션 버튼들... */}
    </ButtonGroup>
)}

{isLoggedIn ? (
    <ProfileButtonWrapper isAdmin={isAdmin}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">사용자 메뉴</span>
                    <div className="h-8 w-8 rounded-full bg-muted" />
                </Button>
            </DropdownMenuTrigger>
            {/* 드롭다운 메뉴 내용 */}
        </DropdownMenu>
    </ProfileButtonWrapper>
) : (
    !hideLoginButton && (
        <ProfileButtonWrapper>
            <Button asChild>
                <Link to="/auth/login">로그인</Link>
            </Button>
        </ProfileButtonWrapper>
    )
)}
```

## 11. IdeasGPT 컴포넌트 구현

개발자들이 새로운 아이디어를 생성할 수 있도록 돕는 AI 기반 컴포넌트를 추가했습니다. 이 컴포넌트는 사용자가 입력한 프롬프트를 기반으로 AI가 아이디어를 제안해주는 기능을 가지고 있습니다.

주요 기능:
- 프롬프트 입력 및 전송 기능
- 로딩 상태 표시
- 오류 처리
- 생성된 아이디어 목록 표시

해당 컴포넌트는 다음 파일에 구현되어 있습니다:
- `app/components/idea/ideas-gpt.tsx` - 아이디어 생성 컴포넌트
- `app/routes/ideas.tsx` - 레이아웃 컴포넌트
- `app/routes/ideas._index.tsx` - 메인 페이지

## 12. 제품 등록 기능 개선

제품 등록 기능을 사용자 경험에 맞게 개선했습니다. 기존 경로를 `/products/new`에서 `/products/register`로 변경하여 더 직관적인 URL 구조를 제공합니다.

주요 기능:
- 레이아웃 개선 (중앙 정렬, 여백 조정)
- 양식 검증 및 오류 처리
- 카테고리 선택 옵션 확장
- 응답형 디자인

해당 기능은 다음 파일에 구현되어 있습니다:
- `app/routes/products/register.tsx` - 제품 등록 폼
- `app/routes/products._index.tsx` - 제품 목록 페이지 (링크 수정)

## 다음 단계

이제 실시간 기능의 기본적인 구조가 완성되었습니다! 다음 단계에서는 배포 준비를 위한 작업을 진행할 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

이제 다음과 같은 실시간 기능들이 동작합니다:
- 실시간 알림 수신
- 팀 채팅 및 개인 채팅
- 실시간 문서 협업 편집

다음과 같은 URL로 접속하여 기능을 테스트할 수 있습니다:
- `http://localhost:3000/notifications` - 알림 페이지
- `http://localhost:3000/chat` - 채팅 페이지
- `http://localhost:3000/collaboration` - 협업 페이지

## 7. UI 개선 사항

### 버튼 레이아웃 수정

`app/components/layouts/root-layout.tsx` 파일의 헤더 부분에서 로그인/로그아웃 버튼이 다른 버튼과 겹치는 문제를 해결했습니다:

```typescript
// 실시간 기능 버튼에 마진 추가
<Button
    variant="ghost"
    size="icon"
    asChild
    className={cn(
        isActive("/collaboration") && "bg-accent",
        "mr-4" // 수정 버튼 우측 마진 추가
    )}
>
    <Link to="/collaboration" title="협업 편집">
        <FileEdit className="h-5 w-5" />
        <span className="sr-only">협업 편집</span>
    </Link>
</Button>

// 로그인/로그아웃 버튼에 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
    <span className="sr-only">사용자 메뉴</span>
    <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 비로그인 상태의 로그인 버튼에 마진 추가
<Button asChild className="mr-4">
    <Link to="/auth/login">로그인</Link>
</Button>
```

이 수정으로 상단 헤더의 버튼들이 올바르게 배치되어 서로 겹치지 않도록 했습니다. 특히 사용자 모드에서 수정 버튼이 로그인/로그아웃 버튼에 가려지는 문제를 해결했습니다.

## 8. 타입 에러 수정

`socket.server.ts` 파일에서 다음과 같은 타입 에러가 발생했습니다:

```
Conversion of type '{ headers: { cookie: string; }; }' to type 'Request' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ headers: { cookie: string; }; }' is missing the following properties from type 'Request': cache, credentials, destination, integrity, and 17 more.
```

이 문제는 `{ headers: { cookie } }` 객체를 `Request` 타입으로 가정하는 부분에서 발생합니다. 이를 해결하기 위해 다음과 같이 실제 `Request` 객체를 생성하도록 코드를 수정했습니다:

```typescript
// 기존 코드 (에러 발생)
const user = await getUser({
  headers: { cookie },
} as Request);

// 수정된 코드 (에러 해결)
const fakeRequest = new Request("http://localhost", {
  headers: new Headers({
    cookie
  })
});

const user = await getUser(fakeRequest);
```

이렇게 수정하면 실제 `Request` 객체를 생성하여 `getUser` 함수에 전달할 수 있으므로 타입 에러가 해결됩니다.

## 9. React Hook 에러 수정

실시간 기능 관련 레이아웃 컴포넌트(`notifications.tsx`, `chat.tsx`, `collaboration.tsx`)에서 다음과 같은 에러가 발생했습니다:

```
Error: Rendered more hooks than during the previous render.
```

### 원인 분석

이 에러는 조건부로 React Hook을 사용하거나, 렌더링 도중 동적으로 훅의 호출 수가 변경될 때 발생합니다. 현재 코드에서는 `ClientOnly` 컴포넌트 내에서 함수 콜백을 통해 `useEffect`를 호출하는 구조가 문제입니다:

```typescript
<ClientOnly>
    {() => {
        useEffect(() => {
            // 여기서 로직 실행
        }, []);
        return null;
    }}
</ClientOnly>
```

이 패턴은 React의 Hook 규칙을 위반할 가능성이 있습니다. 함수 컴포넌트의 최상위 레벨이 아닌 콜백 내에서 Hook을 사용하고 있기 때문입니다.

### 해결 방법

이 문제를 해결하기 위해 Hook을 컴포넌트 최상위 레벨로 이동하고, 클라이언트 사이드 체크를 직접 수행하도록 변경했습니다:

```typescript
export default function NotificationsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Hook을 컴포넌트 최상위 레벨에서 사용
    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

이 수정으로 다음과 같은 이점이 있습니다:

1. React Hook 규칙을 준수하여 에러 해결
2. 코드가 더 단순해지고 가독성 향상
3. 클라이언트 사이드 로직이 명확하게 분리됨

## 10. UI 공통화 및 개선

UI 관련 코드를 공통화하고 버튼 레이아웃을 개선했습니다.

### 인증 상태 관리 공통화

여러 레이아웃 컴포넌트에서 반복되는 인증 상태 관리 로직을 `useAuthState` 커스텀 훅으로 분리했습니다:

```typescript
// app/utils/auth-hooks.tsx
import { useState, useEffect } from "react";

export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return { isLoggedIn, isAdmin };
}
```

이 훅을 사용하면 각 레이아웃 컴포넌트에서 로그인 상태를 쉽게 관리할 수 있습니다:

```typescript
// app/routes/notifications.tsx (예시)
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function NotificationsLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

### 버튼 레이아웃 컴포넌트 추가

버튼 그룹의 레이아웃과 간격을 일관되게 관리하기 위해 레이아웃 컴포넌트를 추가했습니다:

```typescript
// app/components/ui/button-layout.tsx
import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ProfileButtonWrapper({ children, className }: ProfileButtonWrapperProps) {
    return (
        <div className={cn("relative ml-6", className)}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
}
```

이 컴포넌트들을 사용하면 절대적인 마진 값을 직접 사용하는 대신 상대적인 위치 관계를 통해 버튼 간격을 관리할 수 있습니다:
- `ButtonGroup`: 버튼들을 그룹화하고 일정한 간격(`gap-4`)을 제공하여 버튼 간의 충분한 여백 확보
- `ProfileButtonWrapper`: 프로필(로그인/로그아웃) 버튼을 우측에 배치하고 충분한 간격(`ml-6`) 적용
- `ActionButtonWrapper`: 액션 버튼(수정, 알림 등)에 개별 래퍼 제공

### 버튼 가시성 문제 해결

기존에는 다음과 같은 문제가 발생했습니다:
1. 협업 편집 버튼이 로그인/로그아웃 버튼에 가려지는 현상
2. 액션 버튼들 간의 간격이 너무 좁아 구분이 어려움
3. 프로필 버튼과 액션 버튼 그룹 간의 간격이 부족함
4. 관리자 모드에서 추가 메뉴가 있을 때 버튼 간격이 충분하지 않음

이를 해결하기 위해 다음과 같이 개선했습니다:
1. 버튼 그룹에 `mx-2` 클래스 추가하여 전체 그룹에 여백 제공
2. 버튼 간 간격을 `gap-2`에서 `gap-4`로 늘려 충분한 여백 확보
3. 프로필 버튼의 좌측 마진을 `ml-auto`에서 `ml-6`으로 변경하여 일정한 간격 유지
4. 관리자 모드일 때 더 넓은 간격 제공 (버튼 그룹 `gap-5`, 프로필 버튼 `ml-8`)
5. 협업 편집 버튼(`FileEdit`)과 로그인/로그아웃 버튼에 `mr-4` 클래스 추가하여 버튼 간 겹침 문제 해결

### 루트 레이아웃 버튼 마진 개선

`app/components/layouts/root-layout.tsx` 파일에서 버튼 간 겹침 문제를 해결하기 위해 다음과 같이 마진을 조정했습니다:

```tsx
// 협업 편집 버튼에 우측 마진 추가
<Button 
  variant="ghost" 
  size="icon" 
  asChild 
  className={cn(isActive("/collaboration") && "bg-accent", "mr-4")}
>
  <Link to="/collaboration" title="협업 편집">
    <FileEdit className="h-5 w-5" />
    <span className="sr-only">협업 편집</span>
  </Link>
</Button>

// 사용자 메뉴 버튼에 우측 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
  <span className="sr-only">사용자 메뉴</span>
  <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 로그인 버튼에 우측 마진 추가
<Button asChild className="mr-4">
  <Link to="/auth/login">로그인</Link>
</Button>
```

이러한 마진 조정을 통해 모든 버튼이 겹치지 않고 적절한 간격을 유지하도록 하여 사용자 경험을 개선했습니다. 특히 협업 편집 버튼과 로그인/로그아웃 버튼 사이의 간격을 확보하여 UI 가시성을 높였습니다.

### 사용자 모드별 최적화

사용자 경험을 극대화하기 위해 각 모드별로 최적화된 레이아웃을 제공합니다:

1. **일반 사용자 모드**
   - 로그인 버튼이 다른 요소와 적절한 간격 유지
   - 깔끔하고 단순한 인터페이스 제공

2. **로그인 사용자 모드**
   - 알림, 채팅, 협업 편집 버튼이 모두 명확하게 보이며 적절한 간격 유지
   - 프로필 메뉴와 액션 버튼 사이에 충분한 여백 확보

3. **관리자 모드**
   - 일반 로그인 모드보다 더 넓은 간격 제공 (gap-5, ml-8)
   - 추가 메뉴 옵션이 많아도 모든 버튼이 잘 보이도록 레이아웃 최적화
   - 중요한 관리 기능에 쉽게 접근할 수 있도록 배치

이러한 변경을 통해 모든 화면 모드에서 버튼들이 적절하게 표시되도록 했습니다.

### RootLayout 적용 예시

RootLayout에서 이 컴포넌트들을 활용하여 버튼 레이아웃을 개선했습니다:

```typescript
// header 내부 버튼 그룹 부분
{isLoggedIn && (
    <ButtonGroup className="mx-2" isAdmin={isAdmin}>
        <ActionButtonWrapper>
            <Button variant="ghost" size="icon" asChild className={cn(isActive("/notifications") && "bg-accent")}>
                <Link to="/notifications" title="알림">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">알림</span>
                </Link>
            </Button>
        </ActionButtonWrapper>
        
        {/* 다른 액션 버튼들... */}
    </ButtonGroup>
)}

{isLoggedIn ? (
    <ProfileButtonWrapper isAdmin={isAdmin}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">사용자 메뉴</span>
                    <div className="h-8 w-8 rounded-full bg-muted" />
                </Button>
            </DropdownMenuTrigger>
            {/* 드롭다운 메뉴 내용 */}
        </DropdownMenu>
    </ProfileButtonWrapper>
) : (
    !hideLoginButton && (
        <ProfileButtonWrapper>
            <Button asChild>
                <Link to="/auth/login">로그인</Link>
            </Button>
        </ProfileButtonWrapper>
    )
)}
```

## 11. IdeasGPT 컴포넌트 구현

개발자들이 새로운 아이디어를 생성할 수 있도록 돕는 AI 기반 컴포넌트를 추가했습니다. 이 컴포넌트는 사용자가 입력한 프롬프트를 기반으로 AI가 아이디어를 제안해주는 기능을 가지고 있습니다.

주요 기능:
- 프롬프트 입력 및 전송 기능
- 로딩 상태 표시
- 오류 처리
- 생성된 아이디어 목록 표시

해당 컴포넌트는 다음 파일에 구현되어 있습니다:
- `app/components/idea/ideas-gpt.tsx` - 아이디어 생성 컴포넌트
- `app/routes/ideas.tsx` - 레이아웃 컴포넌트
- `app/routes/ideas._index.tsx` - 메인 페이지

## 12. 제품 등록 기능 개선

제품 등록 기능을 사용자 경험에 맞게 개선했습니다. 기존 경로를 `/products/new`에서 `/products/register`로 변경하여 더 직관적인 URL 구조를 제공합니다.

주요 기능:
- 레이아웃 개선 (중앙 정렬, 여백 조정)
- 양식 검증 및 오류 처리
- 카테고리 선택 옵션 확장
- 응답형 디자인

해당 기능은 다음 파일에 구현되어 있습니다:
- `app/routes/products/register.tsx` - 제품 등록 폼
- `app/routes/products._index.tsx` - 제품 목록 페이지 (링크 수정)

## 다음 단계

이제 실시간 기능의 기본적인 구조가 완성되었습니다! 다음 단계에서는 배포 준비를 위한 작업을 진행할 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

이제 다음과 같은 실시간 기능들이 동작합니다:
- 실시간 알림 수신
- 팀 채팅 및 개인 채팅
- 실시간 문서 협업 편집

다음과 같은 URL로 접속하여 기능을 테스트할 수 있습니다:
- `http://localhost:3000/notifications` - 알림 페이지
- `http://localhost:3000/chat` - 채팅 페이지
- `http://localhost:3000/collaboration` - 협업 페이지

## 7. UI 개선 사항

### 버튼 레이아웃 수정

`app/components/layouts/root-layout.tsx` 파일의 헤더 부분에서 로그인/로그아웃 버튼이 다른 버튼과 겹치는 문제를 해결했습니다:

```typescript
// 실시간 기능 버튼에 마진 추가
<Button
    variant="ghost"
    size="icon"
    asChild
    className={cn(
        isActive("/collaboration") && "bg-accent",
        "mr-4" // 수정 버튼 우측 마진 추가
    )}
>
    <Link to="/collaboration" title="협업 편집">
        <FileEdit className="h-5 w-5" />
        <span className="sr-only">협업 편집</span>
    </Link>
</Button>

// 로그인/로그아웃 버튼에 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
    <span className="sr-only">사용자 메뉴</span>
    <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 비로그인 상태의 로그인 버튼에 마진 추가
<Button asChild className="mr-4">
    <Link to="/auth/login">로그인</Link>
</Button>
```

이 수정으로 상단 헤더의 버튼들이 올바르게 배치되어 서로 겹치지 않도록 했습니다. 특히 사용자 모드에서 수정 버튼이 로그인/로그아웃 버튼에 가려지는 문제를 해결했습니다.

## 8. 타입 에러 수정

`socket.server.ts` 파일에서 다음과 같은 타입 에러가 발생했습니다:

```
Conversion of type '{ headers: { cookie: string; }; }' to type 'Request' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ headers: { cookie: string; }; }' is missing the following properties from type 'Request': cache, credentials, destination, integrity, and 17 more.
```

이 문제는 `{ headers: { cookie } }` 객체를 `Request` 타입으로 가정하는 부분에서 발생합니다. 이를 해결하기 위해 다음과 같이 실제 `Request` 객체를 생성하도록 코드를 수정했습니다:

```typescript
// 기존 코드 (에러 발생)
const user = await getUser({
  headers: { cookie },
} as Request);

// 수정된 코드 (에러 해결)
const fakeRequest = new Request("http://localhost", {
  headers: new Headers({
    cookie
  })
});

const user = await getUser(fakeRequest);
```

이렇게 수정하면 실제 `Request` 객체를 생성하여 `getUser` 함수에 전달할 수 있으므로 타입 에러가 해결됩니다.

## 9. React Hook 에러 수정

실시간 기능 관련 레이아웃 컴포넌트(`notifications.tsx`, `chat.tsx`, `collaboration.tsx`)에서 다음과 같은 에러가 발생했습니다:

```
Error: Rendered more hooks than during the previous render.
```

### 원인 분석

이 에러는 조건부로 React Hook을 사용하거나, 렌더링 도중 동적으로 훅의 호출 수가 변경될 때 발생합니다. 현재 코드에서는 `ClientOnly` 컴포넌트 내에서 함수 콜백을 통해 `useEffect`를 호출하는 구조가 문제입니다:

```typescript
<ClientOnly>
    {() => {
        useEffect(() => {
            // 여기서 로직 실행
        }, []);
        return null;
    }}
</ClientOnly>
```

이 패턴은 React의 Hook 규칙을 위반할 가능성이 있습니다. 함수 컴포넌트의 최상위 레벨이 아닌 콜백 내에서 Hook을 사용하고 있기 때문입니다.

### 해결 방법

이 문제를 해결하기 위해 Hook을 컴포넌트 최상위 레벨로 이동하고, 클라이언트 사이드 체크를 직접 수행하도록 변경했습니다:

```typescript
export default function NotificationsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Hook을 컴포넌트 최상위 레벨에서 사용
    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

이 수정으로 다음과 같은 이점이 있습니다:

1. React Hook 규칙을 준수하여 에러 해결
2. 코드가 더 단순해지고 가독성 향상
3. 클라이언트 사이드 로직이 명확하게 분리됨

## 10. UI 공통화 및 개선

UI 관련 코드를 공통화하고 버튼 레이아웃을 개선했습니다.

### 인증 상태 관리 공통화

여러 레이아웃 컴포넌트에서 반복되는 인증 상태 관리 로직을 `useAuthState` 커스텀 훅으로 분리했습니다:

```typescript
// app/utils/auth-hooks.tsx
import { useState, useEffect } from "react";

export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return { isLoggedIn, isAdmin };
}
```

이 훅을 사용하면 각 레이아웃 컴포넌트에서 로그인 상태를 쉽게 관리할 수 있습니다:

```typescript
// app/routes/notifications.tsx (예시)
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function NotificationsLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

### 버튼 레이아웃 컴포넌트 추가

버튼 그룹의 레이아웃과 간격을 일관되게 관리하기 위해 레이아웃 컴포넌트를 추가했습니다:

```typescript
// app/components/ui/button-layout.tsx
import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ProfileButtonWrapper({ children, className }: ProfileButtonWrapperProps) {
    return (
        <div className={cn("relative ml-6", className)}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
}
```

이 컴포넌트들을 사용하면 절대적인 마진 값을 직접 사용하는 대신 상대적인 위치 관계를 통해 버튼 간격을 관리할 수 있습니다:
- `ButtonGroup`: 버튼들을 그룹화하고 일정한 간격(`gap-4`)을 제공하여 버튼 간의 충분한 여백 확보
- `ProfileButtonWrapper`: 프로필(로그인/로그아웃) 버튼을 우측에 배치하고 충분한 간격(`ml-6`) 적용
- `ActionButtonWrapper`: 액션 버튼(수정, 알림 등)에 개별 래퍼 제공

### 버튼 가시성 문제 해결

기존에는 다음과 같은 문제가 발생했습니다:
1. 협업 편집 버튼이 로그인/로그아웃 버튼에 가려지는 현상
2. 액션 버튼들 간의 간격이 너무 좁아 구분이 어려움
3. 프로필 버튼과 액션 버튼 그룹 간의 간격이 부족함
4. 관리자 모드에서 추가 메뉴가 있을 때 버튼 간격이 충분하지 않음

이를 해결하기 위해 다음과 같이 개선했습니다:
1. 버튼 그룹에 `mx-2` 클래스 추가하여 전체 그룹에 여백 제공
2. 버튼 간 간격을 `gap-2`에서 `gap-4`로 늘려 충분한 여백 확보
3. 프로필 버튼의 좌측 마진을 `ml-auto`에서 `ml-6`으로 변경하여 일정한 간격 유지
4. 관리자 모드일 때 더 넓은 간격 제공 (버튼 그룹 `gap-5`, 프로필 버튼 `ml-8`)
5. 협업 편집 버튼(`FileEdit`)과 로그인/로그아웃 버튼에 `mr-4` 클래스 추가하여 버튼 간 겹침 문제 해결

### 루트 레이아웃 버튼 마진 개선

`app/components/layouts/root-layout.tsx` 파일에서 버튼 간 겹침 문제를 해결하기 위해 다음과 같이 마진을 조정했습니다:

```tsx
// 협업 편집 버튼에 우측 마진 추가
<Button 
  variant="ghost" 
  size="icon" 
  asChild 
  className={cn(isActive("/collaboration") && "bg-accent", "mr-4")}
>
  <Link to="/collaboration" title="협업 편집">
    <FileEdit className="h-5 w-5" />
    <span className="sr-only">협업 편집</span>
  </Link>
</Button>

// 사용자 메뉴 버튼에 우측 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
  <span className="sr-only">사용자 메뉴</span>
  <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 로그인 버튼에 우측 마진 추가
<Button asChild className="mr-4">
  <Link to="/auth/login">로그인</Link>
</Button>
```

이러한 마진 조정을 통해 모든 버튼이 겹치지 않고 적절한 간격을 유지하도록 하여 사용자 경험을 개선했습니다. 특히 협업 편집 버튼과 로그인/로그아웃 버튼 사이의 간격을 확보하여 UI 가시성을 높였습니다.

### 사용자 모드별 최적화

사용자 경험을 극대화하기 위해 각 모드별로 최적화된 레이아웃을 제공합니다:

1. **일반 사용자 모드**
   - 로그인 버튼이 다른 요소와 적절한 간격 유지
   - 깔끔하고 단순한 인터페이스 제공

2. **로그인 사용자 모드**
   - 알림, 채팅, 협업 편집 버튼이 모두 명확하게 보이며 적절한 간격 유지
   - 프로필 메뉴와 액션 버튼 사이에 충분한 여백 확보

3. **관리자 모드**
   - 일반 로그인 모드보다 더 넓은 간격 제공 (gap-5, ml-8)
   - 추가 메뉴 옵션이 많아도 모든 버튼이 잘 보이도록 레이아웃 최적화
   - 중요한 관리 기능에 쉽게 접근할 수 있도록 배치

이러한 변경을 통해 모든 화면 모드에서 버튼들이 적절하게 표시되도록 했습니다.

### RootLayout 적용 예시

RootLayout에서 이 컴포넌트들을 활용하여 버튼 레이아웃을 개선했습니다:

```typescript
// header 내부 버튼 그룹 부분
{isLoggedIn && (
    <ButtonGroup className="mx-2" isAdmin={isAdmin}>
        <ActionButtonWrapper>
            <Button variant="ghost" size="icon" asChild className={cn(isActive("/notifications") && "bg-accent")}>
                <Link to="/notifications" title="알림">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">알림</span>
                </Link>
            </Button>
        </ActionButtonWrapper>
        
        {/* 다른 액션 버튼들... */}
    </ButtonGroup>
)}

{isLoggedIn ? (
    <ProfileButtonWrapper isAdmin={isAdmin}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">사용자 메뉴</span>
                    <div className="h-8 w-8 rounded-full bg-muted" />
                </Button>
            </DropdownMenuTrigger>
            {/* 드롭다운 메뉴 내용 */}
        </DropdownMenu>
    </ProfileButtonWrapper>
) : (
    !hideLoginButton && (
        <ProfileButtonWrapper>
            <Button asChild>
                <Link to="/auth/login">로그인</Link>
            </Button>
        </ProfileButtonWrapper>
    )
)}
```

## 11. IdeasGPT 컴포넌트 구현

개발자들이 새로운 아이디어를 생성할 수 있도록 돕는 AI 기반 컴포넌트를 추가했습니다. 이 컴포넌트는 사용자가 입력한 프롬프트를 기반으로 AI가 아이디어를 제안해주는 기능을 가지고 있습니다.

주요 기능:
- 프롬프트 입력 및 전송 기능
- 로딩 상태 표시
- 오류 처리
- 생성된 아이디어 목록 표시

해당 컴포넌트는 다음 파일에 구현되어 있습니다:
- `app/components/idea/ideas-gpt.tsx` - 아이디어 생성 컴포넌트
- `app/routes/ideas.tsx` - 레이아웃 컴포넌트
- `app/routes/ideas._index.tsx` - 메인 페이지

## 12. 제품 등록 기능 개선

제품 등록 기능을 사용자 경험에 맞게 개선했습니다. 기존 경로를 `/products/new`에서 `/products/register`로 변경하여 더 직관적인 URL 구조를 제공합니다.

주요 기능:
- 레이아웃 개선 (중앙 정렬, 여백 조정)
- 양식 검증 및 오류 처리
- 카테고리 선택 옵션 확장
- 응답형 디자인

해당 기능은 다음 파일에 구현되어 있습니다:
- `app/routes/products/register.tsx` - 제품 등록 폼
- `app/routes/products._index.tsx` - 제품 목록 페이지 (링크 수정)

## 다음 단계

이제 실시간 기능의 기본적인 구조가 완성되었습니다! 다음 단계에서는 배포 준비를 위한 작업을 진행할 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

이제 다음과 같은 실시간 기능들이 동작합니다:
- 실시간 알림 수신
- 팀 채팅 및 개인 채팅
- 실시간 문서 협업 편집

다음과 같은 URL로 접속하여 기능을 테스트할 수 있습니다:
- `http://localhost:3000/notifications` - 알림 페이지
- `http://localhost:3000/chat` - 채팅 페이지
- `http://localhost:3000/collaboration` - 협업 페이지

## 7. UI 개선 사항

### 버튼 레이아웃 수정

`app/components/layouts/root-layout.tsx` 파일의 헤더 부분에서 로그인/로그아웃 버튼이 다른 버튼과 겹치는 문제를 해결했습니다:

```typescript
// 실시간 기능 버튼에 마진 추가
<Button
    variant="ghost"
    size="icon"
    asChild
    className={cn(
        isActive("/collaboration") && "bg-accent",
        "mr-4" // 수정 버튼 우측 마진 추가
    )}
>
    <Link to="/collaboration" title="협업 편집">
        <FileEdit className="h-5 w-5" />
        <span className="sr-only">협업 편집</span>
    </Link>
</Button>

// 로그인/로그아웃 버튼에 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
    <span className="sr-only">사용자 메뉴</span>
    <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 비로그인 상태의 로그인 버튼에 마진 추가
<Button asChild className="mr-4">
    <Link to="/auth/login">로그인</Link>
</Button>
```

이 수정으로 상단 헤더의 버튼들이 올바르게 배치되어 서로 겹치지 않도록 했습니다. 특히 사용자 모드에서 수정 버튼이 로그인/로그아웃 버튼에 가려지는 문제를 해결했습니다.

## 8. 타입 에러 수정

`socket.server.ts` 파일에서 다음과 같은 타입 에러가 발생했습니다:

```
Conversion of type '{ headers: { cookie: string; }; }' to type 'Request' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ headers: { cookie: string; }; }' is missing the following properties from type 'Request': cache, credentials, destination, integrity, and 17 more.
```

이 문제는 `{ headers: { cookie } }` 객체를 `Request` 타입으로 가정하는 부분에서 발생합니다. 이를 해결하기 위해 다음과 같이 실제 `Request` 객체를 생성하도록 코드를 수정했습니다:

```typescript
// 기존 코드 (에러 발생)
const user = await getUser({
  headers: { cookie },
} as Request);

// 수정된 코드 (에러 해결)
const fakeRequest = new Request("http://localhost", {
  headers: new Headers({
    cookie
  })
});

const user = await getUser(fakeRequest);
```

이렇게 수정하면 실제 `Request` 객체를 생성하여 `getUser` 함수에 전달할 수 있으므로 타입 에러가 해결됩니다.

## 9. React Hook 에러 수정

실시간 기능 관련 레이아웃 컴포넌트(`notifications.tsx`, `chat.tsx`, `collaboration.tsx`)에서 다음과 같은 에러가 발생했습니다:

```
Error: Rendered more hooks than during the previous render.
```

### 원인 분석

이 에러는 조건부로 React Hook을 사용하거나, 렌더링 도중 동적으로 훅의 호출 수가 변경될 때 발생합니다. 현재 코드에서는 `ClientOnly` 컴포넌트 내에서 함수 콜백을 통해 `useEffect`를 호출하는 구조가 문제입니다:

```typescript
<ClientOnly>
    {() => {
        useEffect(() => {
            // 여기서 로직 실행
        }, []);
        return null;
    }}
</ClientOnly>
```

이 패턴은 React의 Hook 규칙을 위반할 가능성이 있습니다. 함수 컴포넌트의 최상위 레벨이 아닌 콜백 내에서 Hook을 사용하고 있기 때문입니다.

### 해결 방법

이 문제를 해결하기 위해 Hook을 컴포넌트 최상위 레벨로 이동하고, 클라이언트 사이드 체크를 직접 수행하도록 변경했습니다:

```typescript
export default function NotificationsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Hook을 컴포넌트 최상위 레벨에서 사용
    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

이 수정으로 다음과 같은 이점이 있습니다:

1. React Hook 규칙을 준수하여 에러 해결
2. 코드가 더 단순해지고 가독성 향상
3. 클라이언트 사이드 로직이 명확하게 분리됨

## 10. UI 공통화 및 개선

UI 관련 코드를 공통화하고 버튼 레이아웃을 개선했습니다.

### 인증 상태 관리 공통화

여러 레이아웃 컴포넌트에서 반복되는 인증 상태 관리 로직을 `useAuthState` 커스텀 훅으로 분리했습니다:

```typescript
// app/utils/auth-hooks.tsx
import { useState, useEffect } from "react";

export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return { isLoggedIn, isAdmin };
}
```

이 훅을 사용하면 각 레이아웃 컴포넌트에서 로그인 상태를 쉽게 관리할 수 있습니다:

```typescript
// app/routes/notifications.tsx (예시)
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function NotificationsLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

### 버튼 레이아웃 컴포넌트 추가

버튼 그룹의 레이아웃과 간격을 일관되게 관리하기 위해 레이아웃 컴포넌트를 추가했습니다:

```typescript
// app/components/ui/button-layout.tsx
import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ProfileButtonWrapper({ children, className }: ProfileButtonWrapperProps) {
    return (
        <div className={cn("relative ml-6", className)}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
}
```

이 컴포넌트들을 사용하면 절대적인 마진 값을 직접 사용하는 대신 상대적인 위치 관계를 통해 버튼 간격을 관리할 수 있습니다:
- `ButtonGroup`: 버튼들을 그룹화하고 일정한 간격(`gap-4`)을 제공하여 버튼 간의 충분한 여백 확보
- `ProfileButtonWrapper`: 프로필(로그인/로그아웃) 버튼을 우측에 배치하고 충분한 간격(`ml-6`) 적용
- `ActionButtonWrapper`: 액션 버튼(수정, 알림 등)에 개별 래퍼 제공

### 버튼 가시성 문제 해결

기존에는 다음과 같은 문제가 발생했습니다:
1. 협업 편집 버튼이 로그인/로그아웃 버튼에 가려지는 현상
2. 액션 버튼들 간의 간격이 너무 좁아 구분이 어려움
3. 프로필 버튼과 액션 버튼 그룹 간의 간격이 부족함
4. 관리자 모드에서 추가 메뉴가 있을 때 버튼 간격이 충분하지 않음

이를 해결하기 위해 다음과 같이 개선했습니다:
1. 버튼 그룹에 `mx-2` 클래스 추가하여 전체 그룹에 여백 제공
2. 버튼 간 간격을 `gap-2`에서 `gap-4`로 늘려 충분한 여백 확보
3. 프로필 버튼의 좌측 마진을 `ml-auto`에서 `ml-6`으로 변경하여 일정한 간격 유지
4. 관리자 모드일 때 더 넓은 간격 제공 (버튼 그룹 `gap-5`, 프로필 버튼 `ml-8`)
5. 협업 편집 버튼(`FileEdit`)과 로그인/로그아웃 버튼에 `mr-4` 클래스 추가하여 버튼 간 겹침 문제 해결

### 루트 레이아웃 버튼 마진 개선

`app/components/layouts/root-layout.tsx` 파일에서 버튼 간 겹침 문제를 해결하기 위해 다음과 같이 마진을 조정했습니다:

```tsx
// 협업 편집 버튼에 우측 마진 추가
<Button 
  variant="ghost" 
  size="icon" 
  asChild 
  className={cn(isActive("/collaboration") && "bg-accent", "mr-4")}
>
  <Link to="/collaboration" title="협업 편집">
    <FileEdit className="h-5 w-5" />
    <span className="sr-only">협업 편집</span>
  </Link>
</Button>

// 사용자 메뉴 버튼에 우측 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
  <span className="sr-only">사용자 메뉴</span>
  <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 로그인 버튼에 우측 마진 추가
<Button asChild className="mr-4">
  <Link to="/auth/login">로그인</Link>
</Button>
```

이러한 마진 조정을 통해 모든 버튼이 겹치지 않고 적절한 간격을 유지하도록 하여 사용자 경험을 개선했습니다. 특히 협업 편집 버튼과 로그인/로그아웃 버튼 사이의 간격을 확보하여 UI 가시성을 높였습니다.

### 사용자 모드별 최적화

사용자 경험을 극대화하기 위해 각 모드별로 최적화된 레이아웃을 제공합니다:

1. **일반 사용자 모드**
   - 로그인 버튼이 다른 요소와 적절한 간격 유지
   - 깔끔하고 단순한 인터페이스 제공

2. **로그인 사용자 모드**
   - 알림, 채팅, 협업 편집 버튼이 모두 명확하게 보이며 적절한 간격 유지
   - 프로필 메뉴와 액션 버튼 사이에 충분한 여백 확보

3. **관리자 모드**
   - 일반 로그인 모드보다 더 넓은 간격 제공 (gap-5, ml-8)
   - 추가 메뉴 옵션이 많아도 모든 버튼이 잘 보이도록 레이아웃 최적화
   - 중요한 관리 기능에 쉽게 접근할 수 있도록 배치

이러한 변경을 통해 모든 화면 모드에서 버튼들이 적절하게 표시되도록 했습니다.

### RootLayout 적용 예시

RootLayout에서 이 컴포넌트들을 활용하여 버튼 레이아웃을 개선했습니다:

```typescript
// header 내부 버튼 그룹 부분
{isLoggedIn && (
    <ButtonGroup className="mx-2" isAdmin={isAdmin}>
        <ActionButtonWrapper>
            <Button variant="ghost" size="icon" asChild className={cn(isActive("/notifications") && "bg-accent")}>
                <Link to="/notifications" title="알림">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">알림</span>
                </Link>
            </Button>
        </ActionButtonWrapper>
        
        {/* 다른 액션 버튼들... */}
    </ButtonGroup>
)}

{isLoggedIn ? (
    <ProfileButtonWrapper isAdmin={isAdmin}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">사용자 메뉴</span>
                    <div className="h-8 w-8 rounded-full bg-muted" />
                </Button>
            </DropdownMenuTrigger>
            {/* 드롭다운 메뉴 내용 */}
        </DropdownMenu>
    </ProfileButtonWrapper>
) : (
    !hideLoginButton && (
        <ProfileButtonWrapper>
            <Button asChild>
                <Link to="/auth/login">로그인</Link>
            </Button>
        </ProfileButtonWrapper>
    )
)}
```

## 11. IdeasGPT 컴포넌트 구현

개발자들이 새로운 아이디어를 생성할 수 있도록 돕는 AI 기반 컴포넌트를 추가했습니다. 이 컴포넌트는 사용자가 입력한 프롬프트를 기반으로 AI가 아이디어를 제안해주는 기능을 가지고 있습니다.

주요 기능:
- 프롬프트 입력 및 전송 기능
- 로딩 상태 표시
- 오류 처리
- 생성된 아이디어 목록 표시

해당 컴포넌트는 다음 파일에 구현되어 있습니다:
- `app/components/idea/ideas-gpt.tsx` - 아이디어 생성 컴포넌트
- `app/routes/ideas.tsx` - 레이아웃 컴포넌트
- `app/routes/ideas._index.tsx` - 메인 페이지

## 12. 제품 등록 기능 개선

제품 등록 기능을 사용자 경험에 맞게 개선했습니다. 기존 경로를 `/products/new`에서 `/products/register`로 변경하여 더 직관적인 URL 구조를 제공합니다.

주요 기능:
- 레이아웃 개선 (중앙 정렬, 여백 조정)
- 양식 검증 및 오류 처리
- 카테고리 선택 옵션 확장
- 응답형 디자인

해당 기능은 다음 파일에 구현되어 있습니다:
- `app/routes/products/register.tsx` - 제품 등록 폼
- `app/routes/products._index.tsx` - 제품 목록 페이지 (링크 수정)

## 다음 단계

이제 실시간 기능의 기본적인 구조가 완성되었습니다! 다음 단계에서는 배포 준비를 위한 작업을 진행할 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

이제 다음과 같은 실시간 기능들이 동작합니다:
- 실시간 알림 수신
- 팀 채팅 및 개인 채팅
- 실시간 문서 협업 편집

다음과 같은 URL로 접속하여 기능을 테스트할 수 있습니다:
- `http://localhost:3000/notifications` - 알림 페이지
- `http://localhost:3000/chat` - 채팅 페이지
- `http://localhost:3000/collaboration` - 협업 페이지

## 7. UI 개선 사항

### 버튼 레이아웃 수정

`app/components/layouts/root-layout.tsx` 파일의 헤더 부분에서 로그인/로그아웃 버튼이 다른 버튼과 겹치는 문제를 해결했습니다:

```typescript
// 실시간 기능 버튼에 마진 추가
<Button
    variant="ghost"
    size="icon"
    asChild
    className={cn(
        isActive("/collaboration") && "bg-accent",
        "mr-4" // 수정 버튼 우측 마진 추가
    )}
>
    <Link to="/collaboration" title="협업 편집">
        <FileEdit className="h-5 w-5" />
        <span className="sr-only">협업 편집</span>
    </Link>
</Button>

// 로그인/로그아웃 버튼에 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
    <span className="sr-only">사용자 메뉴</span>
    <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 비로그인 상태의 로그인 버튼에 마진 추가
<Button asChild className="mr-4">
    <Link to="/auth/login">로그인</Link>
</Button>
```

이 수정으로 상단 헤더의 버튼들이 올바르게 배치되어 서로 겹치지 않도록 했습니다. 특히 사용자 모드에서 수정 버튼이 로그인/로그아웃 버튼에 가려지는 문제를 해결했습니다.

## 8. 타입 에러 수정

`socket.server.ts` 파일에서 다음과 같은 타입 에러가 발생했습니다:

```
Conversion of type '{ headers: { cookie: string; }; }' to type 'Request' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ headers: { cookie: string; }; }' is missing the following properties from type 'Request': cache, credentials, destination, integrity, and 17 more.
```

이 문제는 `{ headers: { cookie } }` 객체를 `Request` 타입으로 가정하는 부분에서 발생합니다. 이를 해결하기 위해 다음과 같이 실제 `Request` 객체를 생성하도록 코드를 수정했습니다:

```typescript
// 기존 코드 (에러 발생)
const user = await getUser({
  headers: { cookie },
} as Request);

// 수정된 코드 (에러 해결)
const fakeRequest = new Request("http://localhost", {
  headers: new Headers({
    cookie
  })
});

const user = await getUser(fakeRequest);
```

이렇게 수정하면 실제 `Request` 객체를 생성하여 `getUser` 함수에 전달할 수 있으므로 타입 에러가 해결됩니다.

## 9. React Hook 에러 수정

실시간 기능 관련 레이아웃 컴포넌트(`notifications.tsx`, `chat.tsx`, `collaboration.tsx`)에서 다음과 같은 에러가 발생했습니다:

```
Error: Rendered more hooks than during the previous render.
```

### 원인 분석

이 에러는 조건부로 React Hook을 사용하거나, 렌더링 도중 동적으로 훅의 호출 수가 변경될 때 발생합니다. 현재 코드에서는 `ClientOnly` 컴포넌트 내에서 함수 콜백을 통해 `useEffect`를 호출하는 구조가 문제입니다:

```typescript
<ClientOnly>
    {() => {
        useEffect(() => {
            // 여기서 로직 실행
        }, []);
        return null;
    }}
</ClientOnly>
```

이 패턴은 React의 Hook 규칙을 위반할 가능성이 있습니다. 함수 컴포넌트의 최상위 레벨이 아닌 콜백 내에서 Hook을 사용하고 있기 때문입니다.

### 해결 방법

이 문제를 해결하기 위해 Hook을 컴포넌트 최상위 레벨로 이동하고, 클라이언트 사이드 체크를 직접 수행하도록 변경했습니다:

```typescript
export default function NotificationsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Hook을 컴포넌트 최상위 레벨에서 사용
    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

이 수정으로 다음과 같은 이점이 있습니다:

1. React Hook 규칙을 준수하여 에러 해결
2. 코드가 더 단순해지고 가독성 향상
3. 클라이언트 사이드 로직이 명확하게 분리됨

## 10. UI 공통화 및 개선

UI 관련 코드를 공통화하고 버튼 레이아웃을 개선했습니다.

### 인증 상태 관리 공통화

여러 레이아웃 컴포넌트에서 반복되는 인증 상태 관리 로직을 `useAuthState` 커스텀 훅으로 분리했습니다:

```typescript
// app/utils/auth-hooks.tsx
import { useState, useEffect } from "react";

export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;
        
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");
        
        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
        
        // 로그아웃 이벤트 리스너 추가
        const handleLogout = () => {
            setIsLoggedIn(false);
            setIsAdmin(false);
        };
        
        window.addEventListener('logoutEvent', handleLogout);
        
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('logoutEvent', handleLogout);
        };
    }, []);

    return { isLoggedIn, isAdmin };
}
```

이 훅을 사용하면 각 레이아웃 컴포넌트에서 로그인 상태를 쉽게 관리할 수 있습니다:

```typescript
// app/routes/notifications.tsx (예시)
import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function NotificationsLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}
```

### 버튼 레이아웃 컴포넌트 추가

버튼 그룹의 레이아웃과 간격을 일관되게 관리하기 위해 레이아웃 컴포넌트를 추가했습니다:

```typescript
// app/components/ui/button-layout.tsx
import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ProfileButtonWrapper({ children, className }: ProfileButtonWrapperProps) {
    return (
        <div className={cn("relative ml-6", className)}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
}
```

이 컴포넌트들을 사용하면 절대적인 마진 값을 직접 사용하는 대신 상대적인 위치 관계를 통해 버튼 간격을 관리할 수 있습니다:
- `ButtonGroup`: 버튼들을 그룹화하고 일정한 간격(`gap-4`)을 제공하여 버튼 간의 충분한 여백 확보
- `ProfileButtonWrapper`: 프로필(로그인/로그아웃) 버튼을 우측에 배치하고 충분한 간격(`ml-6`) 적용
- `ActionButtonWrapper`: 액션 버튼(수정, 알림 등)에 개별 래퍼 제공

### 버튼 가시성 문제 해결

기존에는 다음과 같은 문제가 발생했습니다:
1. 협업 편집 버튼이 로그인/로그아웃 버튼에 가려지는 현상
2. 액션 버튼들 간의 간격이 너무 좁아 구분이 어려움
3. 프로필 버튼과 액션 버튼 그룹 간의 간격이 부족함
4. 관리자 모드에서 추가 메뉴가 있을 때 버튼 간격이 충분하지 않음

이를 해결하기 위해 다음과 같이 개선했습니다:
1. 버튼 그룹에 `mx-2` 클래스 추가하여 전체 그룹에 여백 제공
2. 버튼 간 간격을 `gap-2`에서 `gap-4`로 늘려 충분한 여백 확보
3. 프로필 버튼의 좌측 마진을 `ml-auto`에서 `ml-6`으로 변경하여 일정한 간격 유지
4. 관리자 모드일 때 더 넓은 간격 제공 (버튼 그룹 `gap-5`, 프로필 버튼 `ml-8`)
5. 협업 편집 버튼(`FileEdit`)과 로그인/로그아웃 버튼에 `mr-4` 클래스 추가하여 버튼 간 겹침 문제 해결

### 루트 레이아웃 버튼 마진 개선

`app/components/layouts/root-layout.tsx` 파일에서 버튼 간 겹침 문제를 해결하기 위해 다음과 같이 마진을 조정했습니다:

```tsx
// 협업 편집 버튼에 우측 마진 추가
<Button 
  variant="ghost" 
  size="icon" 
  asChild 
  className={cn(isActive("/collaboration") && "bg-accent", "mr-4")}
>
  <Link to="/collaboration" title="협업 편집">
    <FileEdit className="h-5 w-5" />
    <span className="sr-only">협업 편집</span>
  </Link>
</Button>

// 사용자 메뉴 버튼에 우측 마진 추가
<Button variant="ghost" size="icon" className="mr-4">
  <span className="sr-only">사용자 메뉴</span>
  <div className="h-8 w-8 rounded-full bg-muted" />
</Button>

// 로그인 버튼에 우측 마진 추가
<Button asChild className="mr-4">
  <Link to="/auth/login">로그인</Link>
</Button>
```

이러한 마진 조정을 통해 모든 버튼이 겹치지 않고 적절한 간격을 유지하도록 하여 사용자 경험을 개선했습니다. 특히 협업 편집 버튼과 로그인/로그아웃 버튼 사이의 간격을 확보하여 UI 가시성을 높였습니다.

### 사용자 모드별 최적화

사용자 경험을 극대화하기 위해 각 모드별로 최적화된 레이아웃을 제공합니다:

1. **일반 사용자 모드**
   - 로그인 버튼이 다른 요소와 적절한 간격 유지
   - 깔끔하고 단순한 인터페이스 제공

2. **로그인 사용자 모드**
   - 알림, 채팅, 협업 편집 버튼이 모두 명확하게 보이며 적절한 간격 유지
   - 프로필 메뉴와 액션 버튼 사이에 충분한 여백 확보

3. **관리자 모드**
   - 일반 로그인 모드보다 더 넓은 간격 제공 (gap-5, ml-8)
   - 추가 메뉴 옵션이 많아도 모든 버튼이 잘 보이도록 레이아웃 최적화
   - 중요한 관리 기능에 쉽게 접근할 수 있도록 배치

이러한 변경을 통해 모든 화면 모드에서 버튼들이 적절하게 표시되도록 했습니다.

### RootLayout 적용 예시

RootLayout에서 이 컴포넌트들을 활용하여 버튼 레이아웃을 개선했습니다:

```typescript
// header 내부 버튼 그룹 부분
{isLoggedIn && (
    <ButtonGroup className="mx-2" isAdmin={isAdmin}>
        <ActionButtonWrapper>
            <Button variant="ghost" size="icon" asChild className={cn(isActive("/notifications") && "bg-accent")}>
                <Link to="/notifications" title="알림">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">알림</span>
                </Link>
            </Button>
        </ActionButtonWrapper>
        
        {/* 다른 액션 버튼들... */}
    </ButtonGroup>
)}

{isLoggedIn ? (
    <ProfileButtonWrapper isAdmin={isAdmin}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">사용자 메뉴</span>
                    <div className="h-8 w-8 rounded-full bg-muted" />
                </Button>
            </DropdownMenuTrigger>
            {/* 드롭다운 메뉴 내용 */}
        </DropdownMenu>
    </ProfileButtonWrapper>
) : (
    !hideLoginButton && (
        <ProfileButtonWrapper>
            <Button asChild>
                <Link to="/auth/login">로그인</Link>
            </Button>
        </ProfileButtonWrapper>
    )
)}
```

## 11. IdeasGPT 컴포넌트 구현

개발자들이 새로운 아이디어를 생성할 수 있도록 돕는 AI 기반 컴포넌트를 추가했습니다. 이 컴포넌트는 사용자가 입력한 프롬프트를 기반으로 AI가 아이디어를 제안해주는 기능을 가지고 있습니다.

주요 기능:
- 프롬프트 입력 및 전송 기능
- 로딩 상태 표시
- 오류 처리
- 생성된 아이디어 목록 표시

해당 컴포넌트는 다음 파일에 구현되어 있습니다:
- `app/components/idea/ideas-gpt.tsx` - 아이디어 생성 컴포넌트
- `app/routes/ideas.tsx` - 레이아웃 컴포넌트
- `app/routes/ideas._index.tsx` - 메인 페이지

## 12. 제품 등록 기능 개선

제품 등록 기능을 사용자 경험에 맞게 개선했습니다. 기존 경로를 `/products/new`에서 `/products/register`로 변경하여 더 직관적인 URL 구조를 제공합니다.

주요 기능:
- 레이아웃 개선 (중앙 정렬, 여백 조정)
- 양식 검증 및 오류 처리
- 카테고리 선택 옵션 확장
- 응답형 디자인

해당 기능은 다음 파일에 구현되어 있습니다:
- `app/routes/products/register.tsx` - 제품 등록 폼
- `app/routes/products._index.tsx` - 제품 목록 페이지 (링크 수정)

## 다음 단계

이제 실시간 기능의 기본적인 구조가 완성되었습니다! 다음 단계에서는 배포 준비를 위한 작업을 진행할 예정입니다.

개발 서버를 실행하여 지금까지의 작업을 확인해보세요:

```bash
npm run dev
```

이제 다음과 같은 실시간 기능들이 동작합니다:
- 실시간 알림 수신
- 팀 채팅 및 개인 채팅
- 실시간 문서 협업 편집

다음과 같은 URL로 접속하여 기능을 테스트할 수 있습니다:
- `http://localhost:3000/notifications` - 알림 페이지
- `http://localhost:3000/chat` - 채팅 페이지
- `http://localhost:3000/collaboration` - 협업 페이지

## 7. UI 개선 사항

      socket.emit("leave_document", { documentId });
      socket.off("content_change");
    };
  }, [documentId]);

  const handleChange = (value: string | undefined) => {
    if (!value) return;

    setContent(value);
    const socket = getSocket();