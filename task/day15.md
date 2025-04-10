# Day 15: 실시간 기능 개발

## 목표

오늘은 YkMake의 실시간 기능을 개발합니다. WebSocket을 사용하여 사용자들이 실시간으로 상호작용할 수 있는 기능을 구현합니다.

## 작업 목록

1. WebSocket 서버 설정
2. 실시간 알림 기능 구현
3. 실시간 채팅 기능 구현
4. 실시간 협업 기능 구현

## 1. WebSocket 서버 설정

Socket.IO를 사용하여 WebSocket 서버를 설정합니다.

### Socket.IO 설치

```bash
npm install socket.io socket.io-client @types/socket.io @types/socket.io-client
```

### WebSocket 서버 구현

`app/utils/socket.server.ts` 파일을 생성하고 다음과 같이 구현합니다:

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
      const user = await getUser({
        headers: { cookie },
      } as Request);

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

`app/utils/socket.client.ts` 파일을 생성하고 다음과 같이 구현합니다:

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

## 2. 실시간 알림 기능 구현

### 알림 컴포넌트 생성

`app/components/notifications/notification-list.tsx` 파일을 생성하고 다음과 같이 구현합니다:

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

`app/components/chat/chat-window.tsx` 파일을 생성하고 다음과 같이 구현합니다:

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

`app/components/collaboration/collaboration-editor.tsx` 파일을 생성하고 다음과 같이 구현합니다:

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