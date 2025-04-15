# Day 26: 알림 시스템 구현 및 이메일 알림 설정

## 목표

사용자에게 중요한 이벤트(새 댓글, 메시지, 팀 초대 등)를 알리는 시스템을 구현하고, 사용자가 이메일 알림 설정을 변경할 수 있는 기능을 제공합니다.

## 작업 목록

1. 실시간 알림 시스템 구현 (Supabase Realtime 활용)
2. 알림 목록 페이지 및 컴포넌트 구현
3. 알림 생성 로직 구현 (댓글, 멘션, 팀 초대 등)
4. 이메일 알림 설정 페이지 구현
5. 이메일 발송 로직 구현 (선택 사항: Supabase Functions 또는 외부 서비스 활용)

## 파일 생성 명령어

!!!bash
mkdir -p app/components/notifications app/routes/settings app/utils/notifications app/services
touch app/components/notifications/NotificationIcon.tsx # 헤더에 표시될 아이콘 및 드롭다운
touch app/components/notifications/NotificationList.tsx
touch app/components/notifications/NotificationItem.tsx
touch app/routes/notifications.tsx # Flat Routes: /notifications (알림 목록 페이지)
touch app/routes/settings.notifications.tsx # Flat Routes: /settings/notifications (알림 설정)
touch app/utils/notifications/notifications.server.ts # 알림 생성/조회 로직
touch app/services/realtime.client.ts # Supabase Realtime 클라이언트 설정
touch app/services/email.server.ts # 이메일 발송 서비스 (선택 사항)
# 기존 app/root.tsx, app/routes/settings.tsx 등 관련 파일 수정 필요
!!!

## 필수 라이브러리 설치 (및 도구)

Supabase 클라이언트 외에 이메일 발송을 위한 라이브러리가 필요할 수 있습니다.

!!!bash
# Supabase는 기본 포함
# npm install @supabase/supabase-js

# 이메일 발송 라이브러리 (예: Resend)
# npm install resend

# 또는 SendGrid
# npm install @sendgrid/mail
!!!

## 1. 실시간 알림 시스템 구현 (Supabase Realtime)

Supabase Realtime을 사용하여 데이터베이스 변경 사항(예: `notifications` 테이블 삽입)을 구독하고, 클라이언트에게 실시간으로 알림을 푸시합니다.

### 실시간 클라이언트 설정 (`app/services/realtime.client.ts`)

!!!typescript
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// 클라이언트 측 Supabase 클라이언트 (환경 변수 필요)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Remix에서는 환경 변수 로드 방식 확인 필요
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 클라이언트 측에서만 실행되도록 주의
let supabaseClient: any = null;
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

interface NotificationPayload {
  [key: string]: any; // 실제 알림 데이터 구조에 맞게 타입 정의
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  link_to?: string;
}

// 실시간 알림 구독 훅
export function useRealtimeNotifications(userId: string | null | undefined, callback: (payload: NotificationPayload) => void) {
  useEffect(() => {
    if (!userId || !supabaseClient) return;

    const channel = supabaseClient
      .channel(`realtime:notifications:${userId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}` 
        },
        (payload: any) => {
          console.log('New notification received:', payload);
          callback(payload.new as NotificationPayload); 
        }
      )
      .subscribe((status: string, err?: Error) => {
         if (status === 'SUBSCRIBED') {
           console.log('Connected to notifications channel!');
         } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
           console.error('Realtime channel error:', err);
           // TODO: 재연결 로직 또는 에러 처리
         }
      });

    // 컴포넌트 언마운트 시 채널 구독 해제
    return () => {
      if (channel) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [userId, callback]);
}
!!!

**주의:**
- 위 코드는 클라이언트 측에서 실행되어야 합니다 (`typeof window !== 'undefined').
- `NEXT_PUBLIC_` 접두사는 Next.js 기준이며, Remix에서는 환경 변수를 클라이언트에 노출하는 방식(예: `root.tsx`의 `loader`에서 전달)을 사용해야 합니다.
- `notifications` 테이블에 대한 `INSERT` 이벤트만 구독하며, `user_id`로 필터링합니다.
- 실제 알림 데이터 구조(`NotificationPayload`)에 맞게 타입을 정의해야 합니다.

## 2. 알림 목록 페이지 및 컴포넌트 구현

### 알림 아이콘 및 드롭다운 (`NotificationIcon.tsx`)

헤더에 표시될 아이콘 컴포넌트입니다. 클릭 시 최근 알림 목록을 보여주는 드롭다운이 나타납니다.

!!!typescript
import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { Bell } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useRealtimeNotifications } from '~/services/realtime.client'; // 경로 확인
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  link_to?: string;
}

interface NotificationIconProps {
  userId: string | null | undefined;
  initialNotifications?: Notification[]; // 초기 로드된 알림
  initialUnreadCount?: number;
}

export function NotificationIcon({ userId, initialNotifications = [], initialUnreadCount = 0 }: NotificationIconProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);

  // 실시간 알림 처리 콜백
  const handleNewNotification = (newNotification: Notification) => {
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // 최근 10개 유지
    if (!newNotification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
    // TODO: 브라우저 알림 표시 (선택 사항)
  };

  // 실시간 알림 구독
  useRealtimeNotifications(userId, handleNewNotification);

  // TODO: 드롭다운 열 때 읽음 처리 (API 호출 또는 Optimistic UI)
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
       setUnreadCount(0); // Optimistic update
       // 서버에 읽음 처리 요청 (예: fetch POST /api/notifications/mark-read)
       try {
         await fetch('/api/notifications/mark-read', { method: 'POST' }); 
       } catch (error) {
         console.error("Failed to mark notifications as read", error);
         // TODO: Optimistic update 롤백
       }
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">알림</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>최근 알림</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>알림이 없습니다.</DropdownMenuItem>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem key={notification.id} asChild className={`cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}>
              <Link to={notification.link_to || '/notifications'} className="block p-2">
                <p className="text-sm mb-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ko })}
                </p>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="text-center block w-full">모든 알림 보기</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
!!!

### 알림 목록 페이지 (`app/routes/notifications.tsx`)

모든 알림을 보여주는 페이지입니다.

!!!typescript
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";
import { getNotifications } from "~/utils/notifications/notifications.server"; // 경로 확인
import { NotificationItem } from "~/components/notifications/NotificationItem"; // 경로 확인
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [{ title: "알림 - YkMake" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  
  // 페이지네이션 추가 고려
  const notifications = await getNotifications(userId, { limit: 20 }); 
  
  // 페이지 로드 시 모든 알림 읽음 처리 (선택 사항)
  // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  // await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)

  return json({ notifications });
}

export default function NotificationsPage() {
  const { notifications } = useLoaderData<typeof loader>();

  const handleMarkAllRead = async () => {
     // TODO: 모든 알림 읽음 처리 API 호출
     alert('모든 알림 읽음 처리 (구현 필요)');
  };
  
  const handleDeleteAll = async () => {
     // TODO: 모든 알림 삭제 API 호출
     if(confirm('정말 모든 알림을 삭제하시겠습니까?')) {
        alert('모든 알림 삭제 처리 (구현 필요)');
     }
  };

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold">알림</h1>
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleMarkAllRead}>모두 읽음</Button>
           <Button variant="destructive" size="sm" onClick={handleDeleteAll}>모두 삭제</Button>
         </div>
      </div>
      
      {notifications.length > 0 ? (
        <div className="space-y-2 border rounded-md">
          {notifications.map((notification: any) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          받은 알림이 없습니다.
        </p>
      )}
    </div>
  );
}
!!!

### 알림 아이템 컴포넌트 (`NotificationItem.tsx`)

!!!typescript
import { Link } from "@remix-run/react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  link_to?: string;
  // type?: 'comment' | 'mention' | 'team_invite' | 'new_follower' 등 알림 종류
  // actor?: { id: string, name: string, avatar_url?: string } // 알림 유발자 정보
}

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
   const handleDelete = async () => {
      // TODO: 개별 알림 삭제 API 호출
      if (confirm('이 알림을 삭제하시겠습니까?')) {
         alert(`알림 삭제 처리: ${notification.id} (구현 필요)`);
      }
   };

  return (
    <div className={cn(
      "flex items-start justify-between p-4 border-b last:border-b-0",
      !notification.is_read && "bg-muted/50"
    )} >
      <Link to={notification.link_to || '#'} className="flex-1 mr-4 group">
        {/* TODO: 알림 타입별 아이콘 표시 */} 
        <p className="text-sm mb-1 group-hover:text-primary transition-colors">
          {/* {notification.actor && <strong>{notification.actor.name}</strong>} */} 
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ko })}
        </p>
      </Link>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
         <Trash2 className="h-4 w-4 text-muted-foreground" />
         <span className="sr-only">알림 삭제</span>
      </Button>
    </div>
  );
}
!!!

## 3. 알림 생성 로직 구현 (`notifications.server.ts`)

서버 측에서 특정 이벤트 발생 시 (예: 새 댓글 작성) 알림 데이터를 생성하는 함수를 구현합니다.

!!!typescript
import { createClient } from '@supabase/supabase-js';

interface CreateNotificationData {
  userId: string; // 알림을 받을 사용자 ID
  message: string;
  linkTo?: string; // 알림 클릭 시 이동할 경로
  type?: string; // 알림 종류 (예: 'new_comment')
  actorId?: string; // 알림을 유발한 사용자 ID
}

export async function createNotification(data: CreateNotificationData) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
     console.error("Supabase environment variables are not set for server-side operations.");
     return { error: 'Server configuration error' };
  }
  // 서버용 클라이언트 (Service Key 사용)
  const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: data.userId,
      message: data.message,
      link_to: data.linkTo,
      type: data.type,
      actor_id: data.actorId,
      // is_read 는 기본 false
    });

  if (error) {
    console.error('Failed to create notification:', error);
    return { error: 'Failed to create notification' };
  }

  return { success: true };
}

// 알림 조회 함수 (페이지네이션 등 추가 가능)
export async function getNotifications(userId: string, { limit = 10, offset = 0 }: { limit?: number, offset?: number } = {}) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
     console.error("Supabase environment variables are not set.");
     return [];
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*') // 필요한 필드만 선택하도록 수정 권장
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
   
   if (error) {
      console.error('Failed to get notifications:', error);
      return [];
   }
   return data;
}

// 예시: 댓글 생성 시 알림 추가 (app/routes/comments.create.tsx 등에서 호출)
/*
import { createNotification } from '~/utils/notifications/notifications.server';

export async function action({ request }: ActionFunctionArgs) {
  // ... 댓글 생성 로직 ...
  const { data: comment, error: createError } = await supabase.from('comments')...;

  if (!createError && comment) {
     // 게시글/제품 작성자에게 알림 보내기
     const { data: entityAuthor } = await supabase.from('posts') // 또는 products 등
                                          .select('author_id')
                                          .eq('id', entityId)
                                          .single();
     if (entityAuthor && entityAuthor.author_id !== userId) { // 자기 자신에게는 보내지 않음
       await createNotification({
         userId: entityAuthor.author_id,
         message: `회원님의 게시글에 새로운 댓글이 달렸습니다.`, 
         linkTo: `/posts/${entityId}`, // 댓글이 달린 페이지 링크
         type: 'new_comment',
         actorId: userId // 댓글 작성자 ID
       });
     }
    
     // TODO: 멘션된 사용자에게 알림 보내기 (@username 처리)
  }
 
  // ... 리디렉션 ...
}
*/
!!!

## 4. 이메일 알림 설정 페이지 구현

사용자가 어떤 종류의 알림을 이메일로 받을지 설정하는 페이지를 만듭니다.

### 알림 설정 페이지 (`app/routes/settings.notifications.tsx`)

!!!typescript
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [{ title: "알림 설정 - YkMake" }];
};

interface NotificationSettings {
  email_new_comment: boolean;
  email_new_follower: boolean;
  email_team_invite: boolean;
  email_product_update: boolean;
  // 필요한 설정 추가
}

// 현재 알림 설정 로드
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  const { data, error } = await supabase
    .from('notification_settings') // 별도 테이블 필요
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
    console.error("알림 설정 로드 오류:", error);
    throw new Response("설정을 불러올 수 없습니다.", { status: 500 });
  }

  // 기본값 설정
  const defaultSettings: NotificationSettings = {
    email_new_comment: true,
    email_new_follower: true,
    email_team_invite: true,
    email_product_update: false,
  };

  return json({ settings: { ...defaultSettings, ...(data || {}) } });
}

// 알림 설정 저장
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!); // Service key 필요

  const settings: Partial<NotificationSettings> = {
    email_new_comment: formData.get('email_new_comment') === 'on',
    email_new_follower: formData.get('email_new_follower') === 'on',
    email_team_invite: formData.get('email_team_invite') === 'on',
    email_product_update: formData.get('email_product_update') === 'on',
  };

  const { error } = await supabase
    .from('notification_settings')
    .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' });

  if (error) {
    console.error("알림 설정 저장 오류:", error);
    return json({ error: "설정 저장에 실패했습니다." }, { status: 500 });
  }

  return json({ success: "알림 설정이 저장되었습니다." });
}

export default function NotificationSettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>이메일 알림 설정</CardTitle>
        <CardDescription>어떤 활동에 대해 이메일 알림을 받을지 선택하세요.</CardDescription>
      </CardHeader>
      <Form method="post">
        <CardContent className="space-y-6">
          {actionData?.error && <p className="text-sm text-red-600">{actionData.error}</p>}
          {actionData?.success && <p className="text-sm text-green-600">{actionData.success}</p>}
          
          <SettingItem 
            id="email_new_comment"
            label="새 댓글 알림"
            description="내 게시글이나 제품에 댓글이 달리면 이메일을 받습니다."
            defaultChecked={settings.email_new_comment}
          />
          <SettingItem 
            id="email_new_follower"
            label="새 팔로워 알림"
            description="다른 사용자가 나를 팔로우하면 이메일을 받습니다."
            defaultChecked={settings.email_new_follower}
          />
           <SettingItem 
            id="email_team_invite"
            label="팀 초대 알림"
            description="팀 초대를 받으면 이메일을 받습니다."
            defaultChecked={settings.email_team_invite}
          />
          <SettingItem 
            id="email_product_update"
            label="제품 업데이트 알림"
            description="내가 관심있는 제품에 업데이트가 있으면 이메일을 받습니다."
            defaultChecked={settings.email_product_update}
          />
          {/* 다른 설정 항목 추가 */}
        </CardContent>
        <CardFooter>
          <Button type="submit">설정 저장</Button>
        </CardFooter>
      </Form>
    </Card>
  );
}

// 설정 항목 컴포넌트
function SettingItem({ id, label, description, defaultChecked }: {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-base cursor-pointer">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        name={id}
        defaultChecked={defaultChecked}
      />
    </div>
  );
}
!!!

**참고:** `notification_settings` 테이블이 필요하며, `user_id`를 기본 키 또는 고유 키로 설정해야 합니다.

## 5. 이메일 발송 로직 구현 (선택 사항)

실제 이메일 발송 로직은 Supabase Functions (Edge Function 또는 Serverless Function) 또는 외부 서비스(예: Resend, SendGrid)를 통해 구현할 수 있습니다.

### 이메일 서비스 예시 (`app/services/email.server.ts` - Resend 사용)

!!!typescript
import { Resend } from 'resend';

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
   resend = new Resend(process.env.RESEND_API_KEY);
} else {
   console.warn("RESEND_API_KEY is not set. Email sending will be disabled.");
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string; // HTML 형식의 이메일 본문
  from?: string; // 기본 발신자 설정 가능
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  if (!resend) {
    console.log(`Email sending skipped (Resend not configured). To: ${to}, Subject: ${subject}`);
    return { error: 'Email service not configured.' };
  }

  const defaultFrom = process.env.DEFAULT_EMAIL_FROM || 'YkMake <noreply@yourdomain.com>';

  try {
    const { data, error } = await resend.emails.send({
      from: from || defaultFrom,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { error: 'Failed to send email.' };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };

  } catch (error) {
    console.error('Error sending email:', error);
    return { error: 'An unexpected error occurred while sending email.' };
  }
}

// 예시: 알림 생성 시 이메일 발송 로직 (createNotification 함수 내부에 추가)
/*
import { sendEmail } from '~/services/email.server';

async function shouldSendEmail(userId: string, notificationType: string): Promise<boolean> {
   // 사용자의 알림 설정 조회 (notification_settings 테이블)
   // const { data: settings } = await supabaseAdmin.from('notification_settings')...;
   // switch (notificationType) { case 'new_comment': return settings?.email_new_comment; ... }
   return true; // 임시로 항상 발송
}

export async function createNotification(data: CreateNotificationData) {
   // ... 알림 DB 저장 로직 ...

   if (success && data.type) {
      const userShouldReceiveEmail = await shouldSendEmail(data.userId, data.type);
      if (userShouldReceiveEmail) {
         const { data: user } = await supabaseAdmin.from('users').select('email').eq('id', data.userId).single();
         if (user?.email) {
            await sendEmail({
               to: user.email,
               subject: `YkMake 새 알림: ${data.message.substring(0, 30)}...`,
               html: `<p>${data.message}</p>${data.linkTo ? `<p><a href="${process.env.BASE_URL}${data.linkTo}">확인하기</a></p>` : ''}`,
            });
         }
      }
   }
  
   return { success };
}
*/
!!!

## 실행 및 테스트

1.  댓글 작성, 팀 초대 등 알림을 유발하는 액션을 수행합니다.
2.  헤더의 알림 아이콘에 실시간으로 배지가 표시되는지, 드롭다운에 새 알림이 나타나는지 확인합니다.
3.  `/notifications` 페이지에서 모든 알림이 정상적으로 보이는지 확인합니다.
4.  `/settings/notifications` 페이지에서 이메일 알림 설정을 변경하고 저장합니다.
5.  설정에 따라 이메일이 정상적으로 발송되는지 확인합니다 (이메일 서비스 설정 필요).

!!!bash
# 개발 서버 실행
npm run dev

# Supabase Studio 또는 DB 클라이언트에서 notifications 및 notification_settings 테이블 확인
# Resend/SendGrid 등 이메일 서비스 대시보드에서 발송 로그 확인
!!!

## 다음 단계

알림 시스템 구현이 완료되었습니다! Day 27에서는 실시간 협업 기능 (예: 공동 문서 편집) 구현을 진행합니다.

``` 