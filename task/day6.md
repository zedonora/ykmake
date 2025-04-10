# Day 6: 사용자 프로필 및 설정 페이지 구현

## 목표

오늘은 YkMake 플랫폼의 사용자 프로필 및 설정 페이지를 구현합니다. 사용자가 자신의 **프로필을** 관리하고, 계정 설정을 변경할 수 있는 기능을 개발하여 사용자 경험을 향상시킵니다.

## 작업 목록

1. 사용자 프로필 페이지 구현
2. 계정 설정 페이지 구현
3. 프로필 편집 기능 구현
4. 알림 설정 기능 구현
5. 결제 정보 관리 페이지 구현
6. 프로필 레이아웃 구현
7. 설정 페이지 기본 인덱스 구현
8. shadcn/ui 컴포넌트 추가

## 라우팅 구조

```
/profile (profile.tsx - RootLayout)
├── _index.tsx
├── settings (settings.tsx)
│   ├── _index.tsx
│   ├── account.tsx
│   ├── billing.tsx
│   └── notifications.tsx
```

## 1. 임시 사용자 데이터 생성

먼저 임시 사용자 데이터를 생성하여 프로필 및 설정 페이지를 구현합니다.

### 임시 사용자 데이터 생성

`app/lib/data/mock-user.ts` 파일을 생성하여 임시 사용자 데이터를 추가합니다:

```typescript
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  joinedAt: string;
  role: "user" | "maker" | "admin";
  skills: string[];
  interests: string[];
  followers: number;
  following: number;
  projects: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  newFollowerAlert: boolean;
  projectCommentAlert: boolean;
  mentionAlert: boolean;
  weeklyDigest: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "bank";
  name: string;
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  plan: "free" | "basic" | "pro" | "enterprise";
  status: "active" | "canceled" | "expired" | "trial";
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  price: number;
  interval: "monthly" | "yearly";
}

export const mockUser: User = {
  id: "1",
  username: "dev_user",
  name: "김개발",
  email: "dev@example.com",
  bio: "열정적인 개발자 | 프론트엔드 전문가 | React, TypeScript, Node.js | 개발 커뮤니티에 기여하고 배우는 것을 좋아합니다.",
  avatarUrl: "https://i.pravatar.cc/300?img=11",
  coverUrl: "https://picsum.photos/id/1033/1500/500",
  location: "서울, 대한민국",
  website: "https://example.com",
  github: "github_user",
  twitter: "twitter_user",
  linkedin: "linkedin_user",
  joinedAt: "2023-01-15",
  role: "maker",
  skills: ["React", "TypeScript", "Node.js", "JavaScript", "HTML/CSS", "RESTful API", "Git"],
  interests: ["웹 개발", "모바일 앱", "UI/UX", "오픈 소스", "AI", "데브옵스"],
  followers: 128,
  following: 93,
  projects: 12,
};

export const mockNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  newFollowerAlert: true,
  projectCommentAlert: true,
  mentionAlert: true,
  weeklyDigest: true,
};

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm_1",
    type: "card",
    name: "신한카드",
    last4: "4242",
    expiryDate: "04/25",
    isDefault: true,
  },
  {
    id: "pm_2",
    type: "paypal",
    name: "페이팔 계정",
    isDefault: false,
  },
];

export const mockSubscription: Subscription = {
  id: "sub_1",
  plan: "pro",
  status: "active",
  startDate: "2023-06-01",
  renewalDate: "2024-06-01",
  price: 99000,
  interval: "yearly",
};

// 현재 로그인한 사용자 정보 가져오기 (실제로는 인증 시스템과 연결)
export function getCurrentUser(): User {
  return mockUser;
}

// 사용자의 알림 설정 가져오기
export function getUserNotificationSettings(): NotificationSettings {
  return mockNotificationSettings;
}

// 사용자의 결제 방법 가져오기
export function getUserPaymentMethods(): PaymentMethod[] {
  return mockPaymentMethods;
}

// 사용자의 구독 정보 가져오기
export function getUserSubscription(): Subscription {
  return mockSubscription;
}
```

## 2. 프로필 레이아웃 구현

프로필 관련 페이지들의 공통 레이아웃을 구현합니다.

### 프로필 라우트 생성

사용자 프로필 관련 라우트 파일들을 생성합니다:

```bash
touch app/routes/profile._index.tsx
touch app/routes/profile.settings.tsx
touch app/routes/profile.settings.account.tsx
touch app/routes/profile.settings.notifications.tsx
touch app/routes/profile.settings.billing.tsx
touch app/routes/profile.tsx
touch app/routes/profile.settings._index.tsx
```

### 프로필 메인 페이지 (profile._index.tsx)

사용자 프로필 메인 페이지를 구현합니다:

```typescript
import { Outlet, Link, useLocation } from "@remix-run/react";
import { User, Settings } from "lucide-react";
import { RootLayout } from "~/components/layouts/root-layout";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";

export default function ProfileLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  return (
    <RootLayout>
      <PageHeader
        title="프로필"
        description="내 프로필과 계정 설정을 관리합니다."
      />
      
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 좌측 사이드바 - 프로필 메뉴 */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              <Link
                to="/profile"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive("/profile") 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <User size={16} className="mr-2" />
                프로필
              </Link>
              <Link
                to="/profile/settings"
                className={`flex items-center px-4 py-2 rounded-md ${
                  currentPath.startsWith("/profile/settings")
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Settings size={16} className="mr-2" />
                설정
              </Link>
            </nav>
          </div>
          
          {/* 우측 메인 - 컨텐츠 */}
          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </Section>
    </RootLayout>
  );
}
```

## 3. 설정 레이아웃 구현

설정 페이지의 기본 레이아웃을 구현합니다.

### 설정 레이아웃 (profile.settings.tsx)

설정 페이지의 기본 레이아웃을 구현합니다:

```typescript
import { Outlet, Link, useLocation } from "@remix-run/react";
import { Users, Bell, CreditCard } from "lucide-react";
import { Section } from "~/components/layouts/section";

export default function SettingsLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  return (
    <Section>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* 좌측 사이드바 - 설정 메뉴 */}
        <div className="md:col-span-1">
          <nav className="space-y-1">
            <Link
              to="/profile/settings/account"
              className={`flex items-center px-4 py-2 rounded-md ${
                isActive("/profile/settings/account") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              <Users size={16} className="mr-2" />
              계정 정보
            </Link>
            <Link
              to="/profile/settings/notifications"
              className={`flex items-center px-4 py-2 rounded-md ${
                isActive("/profile/settings/notifications") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              <Bell size={16} className="mr-2" />
              알림 설정
            </Link>
            <Link
              to="/profile/settings/billing"
              className={`flex items-center px-4 py-2 rounded-md ${
                isActive("/profile/settings/billing") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              <CreditCard size={16} className="mr-2" />
              결제 정보
            </Link>
          </nav>
        </div>
        
        {/* 우측 메인 - 설정 컨텐츠 */}
        <div className="md:col-span-3">
          <Outlet />
        </div>
      </div>
    </Section>
  );
}
```

## 4. 프로필 메인 페이지 구현

사용자 프로필 메인 페이지를 구현합니다.

### 프로필 메인 페이지 (profile._index.tsx)

```typescript
import { Link, useLoaderData } from "@remix-run/react";
import { Edit, MapPin, Globe, Github, Twitter, Linkedin, Users, Bookmark, FileCode, Calendar } from "lucide-react";
import { getCurrentUser } from "~/lib/data/mock-user";
import { getLatestPosts } from "~/lib/data/mock-posts";
import type { Post } from "~/lib/types/post";
import { Section } from "~/components/layouts/section";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { PostCard } from "~/components/cards/post-card";

export async function loader() {
  const user = getCurrentUser();
  const userPosts = getLatestPosts(3);

  return Response.json({
    user,
    userPosts,
  });
}

export default function ProfilePage() {
  const { user, userPosts } = useLoaderData<typeof loader>();

  // 이니셜 생성
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
          <CardDescription>
            다른 사용자에게 표시되는 프로필 정보를 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="avatar">프로필 이미지</Label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1 text-primary-foreground shadow-sm">
                    <Camera size={14} />
                  </div>
                </div>
                <div className="flex-1">
                  <Input id="avatar" name="avatar" type="file" className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    document.getElementById("avatar")?.click();
                  }}>
                    이미지 변경
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, GIF 형식의 5MB 이하 이미지를 업로드하세요.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cover">커버 이미지</Label>
              <div className="mt-1 relative">
                <div className="w-full h-24 rounded-md overflow-hidden bg-muted">
                  {user.coverUrl ? (
                    <img 
                      src={user.coverUrl} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40" />
                  )}
                </div>
                <div className="mt-2">
                  <Input id="cover" name="cover" type="file" className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    document.getElementById("cover")?.click();
                  }}>
                    커버 이미지 변경
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  placeholder="이름을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">사용자명</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={user.username}
                  placeholder="사용자명을 입력하세요"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">자기소개</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={user.bio}
                placeholder="자기소개를 작성하세요"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                placeholder="이메일을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">위치</Label>
              <Input
                id="location"
                name="location"
                defaultValue={user.location}
                placeholder="위치를 입력하세요"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skills">기술 스택</Label>
                <Input
                  id="skills"
                  name="skills"
                  defaultValue={user.skills.join(", ")}
                  placeholder="기술 스택을 입력하세요 (쉼표로 구분)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interests">관심사</Label>
                <Input
                  id="interests"
                  name="interests"
                  defaultValue={user.interests.join(", ")}
                  placeholder="관심사를 입력하세요 (쉼표로 구분)"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-base font-medium">소셜 미디어 링크</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">웹사이트</Label>
                  <Input
                    id="website"
                    name="website"
                    defaultValue={user.website}
                    placeholder="https://your-website.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    name="github"
                    defaultValue={user.github}
                    placeholder="사용자명"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    defaultValue={user.twitter}
                    placeholder="사용자명"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    defaultValue={user.linkedin}
                    placeholder="사용자명"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "저장 중..." : "변경사항 저장"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
          <CardDescription>
            계정 보안을 위해 주기적으로 비밀번호를 변경하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                name="current-password"
                type="password"
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">새 비밀번호</Label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">비밀번호 확인</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" variant="outline">
                비밀번호 변경
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">계정 삭제</CardTitle>
          <CardDescription>
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="destructive">계정 삭제</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

## 4. 알림 설정 페이지 구현

알림 설정 페이지를 구현합니다.

### 알림 설정 페이지 (profile.settings.notifications.tsx)

알림 설정 페이지를 구현합니다:

```typescript
import { json, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Bell, Mail, BellRing, UserPlus, MessageSquare, AtSign, Newspaper } from "lucide-react";
import { getUserNotificationSettings } from "~/lib/data/mock-user";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";

export async function loader() {
  const settings = getUserNotificationSettings();
  return json({ settings });
}

export async function action({ request }: ActionFunctionArgs) {
  // 실제 구현에서는 여기서 알림 설정 업데이트
  return json({ success: true });
}

export default function NotificationSettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>알림 설정</CardTitle>
          <CardDescription>
            이메일과 푸시 알림 설정을 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>이메일 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    이메일로 알림을 받습니다.
                  </p>
                </div>
                <Switch
                  name="emailNotifications"
                  defaultChecked={settings.emailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>푸시 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    브라우저 푸시 알림을 받습니다.
                  </p>
                </div>
                <Switch
                  name="pushNotifications"
                  defaultChecked={settings.pushNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>마케팅 이메일</Label>
                  <p className="text-sm text-muted-foreground">
                    프로모션 및 마케팅 관련 이메일을 받습니다.
                  </p>
                </div>
                <Switch
                  name="marketingEmails"
                  defaultChecked={settings.marketingEmails}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-base font-medium">알림 종류</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <UserPlus size={16} className="mr-2" />
                      새 팔로워 알림
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      새로운 팔로워가 생길 때 알림을 받습니다.
                    </p>
                  </div>
                  <Switch
                    name="newFollowerAlert"
                    defaultChecked={settings.newFollowerAlert}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <MessageSquare size={16} className="mr-2" />
                      프로젝트 댓글 알림
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      내 프로젝트에 새로운 댓글이 달릴 때 알림을 받습니다.
                    </p>
                  </div>
                  <Switch
                    name="projectCommentAlert"
                    defaultChecked={settings.projectCommentAlert}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <AtSign size={16} className="mr-2" />
                      멘션 알림
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      다른 사용자가 나를 멘션할 때 알림을 받습니다.
                    </p>
                  </div>
                  <Switch
                    name="mentionAlert"
                    defaultChecked={settings.mentionAlert}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center">
                      <Newspaper size={16} className="mr-2" />
                      주간 요약
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      주간 활동 요약을 이메일로 받습니다.
                    </p>
                  </div>
                  <Switch
                    name="weeklyDigest"
                    defaultChecked={settings.weeklyDigest}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">
                설정 저장
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 5. 결제 정보 관리 페이지 구현

결제 정보 관리 페이지를 구현합니다.

### 결제 정보 관리 페이지 (profile.settings.billing.tsx)

결제 정보 관리 페이지를 구현합니다:

```typescript
import { json, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { CreditCard, Plus, Trash2, CreditCard as CardIcon, Wallet, Building2 } from "lucide-react";
import { getUserPaymentMethods, getUserSubscription } from "~/lib/data/mock-user";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

export async function loader() {
  const paymentMethods = getUserPaymentMethods();
  const subscription = getUserSubscription();
  return json({ paymentMethods, subscription });
}

export async function action({ request }: ActionFunctionArgs) {
  // 실제 구현에서는 여기서 결제 정보 업데이트
  return json({ success: true });
}

export default function BillingSettingsPage() {
  const { paymentMethods, subscription } = useLoaderData<typeof loader>();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>구독 정보</CardTitle>
          <CardDescription>
            현재 구독 상태와 결제 정보를 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">현재 플랜</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan === "free" ? "무료" : 
                   subscription.plan === "basic" ? "기본" :
                   subscription.plan === "pro" ? "프로" : "엔터프라이즈"} 플랜
                </p>
              </div>
              <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                {subscription.status === "active" ? "활성" : 
                 subscription.status === "canceled" ? "취소됨" :
                 subscription.status === "expired" ? "만료됨" : "체험"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">다음 결제일</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.renewalDate}
                </p>
              </div>
              <div>
                <h3 className="font-medium">결제 금액</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.price.toLocaleString()}원 / {subscription.interval === "monthly" ? "월" : "년"}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm">
                플랜 변경
              </Button>
              {subscription.status === "active" && (
                <Button variant="destructive" size="sm">
                  구독 취소
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>결제 방법</CardTitle>
          <CardDescription>
            결제에 사용할 수 있는 카드와 계정을 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {method.type === "card" ? (
                    <CardIcon size={24} className="text-muted-foreground" />
                  ) : method.type === "paypal" ? (
                    <Wallet size={24} className="text-muted-foreground" />
                  ) : (
                    <Building2 size={24} className="text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">{method.name}</div>
                    {method.type === "card" && (
                      <div className="text-sm text-muted-foreground">
                        •••• {method.last4} | 만료일 {method.expiryDate}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <Badge variant="secondary">기본</Badge>
                  )}
                  <Button variant="ghost" size="icon">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              <Plus size={16} className="mr-2" />
              결제 방법 추가
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
          <CardDescription>
            지난 12개월간의 결제 내역을 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">2024년 3월</div>
                <div className="text-sm text-muted-foreground">
                  {subscription.plan === "free" ? "무료" : 
                   subscription.plan === "basic" ? "기본" :
                   subscription.plan === "pro" ? "프로" : "엔터프라이즈"} 플랜
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {subscription.price.toLocaleString()}원
                </div>
                <div className="text-sm text-muted-foreground">
                  {subscription.interval === "monthly" ? "월간" : "연간"} 결제
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              전체 결제 내역 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 6. 프로필 레이아웃 구현

프로필 관련 페이지들의 공통 레이아웃을 구현합니다.

### 프로필 레이아웃 (profile.tsx)

```typescript
import { Outlet, Link, useLocation } from "@remix-run/react";
import { User, Settings } from "lucide-react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";

export default function ProfileLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  return (
    <>
      <PageHeader
        title="프로필"
        description="내 프로필과 계정 설정을 관리합니다."
      />
      
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 좌측 사이드바 - 프로필 메뉴 */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              <Link
                to="/profile"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive("/profile") 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <User size={16} className="mr-2" />
                프로필
              </Link>
              <Link
                to="/profile/settings"
                className={`flex items-center px-4 py-2 rounded-md ${
                  currentPath.startsWith("/profile/settings")
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Settings size={16} className="mr-2" />
                설정
              </Link>
            </nav>
          </div>
          
          {/* 우측 메인 - 컨텐츠 */}
          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </Section>
    </>
  );
}
```

## 7. 설정 페이지 기본 인덱스 구현

설정 페이지의 기본 인덱스 페이지를 구현합니다.

### 설정 페이지 기본 인덱스 (profile.settings._index.tsx)

```typescript
import { Link } from "@remix-run/react";
import { Users, Bell, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function SettingsIndexPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>
      <p className="text-muted-foreground">
        계정 및 프로필 설정을 관리합니다.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/profile/settings/account">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users size={20} className="mr-2" />
                계정 정보
              </CardTitle>
              <CardDescription>
                프로필 정보, 비밀번호, 계정 삭제 등을 관리합니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link to="/profile/settings/notifications">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell size={20} className="mr-2" />
                알림 설정
              </CardTitle>
              <CardDescription>
                이메일, 푸시 알림, 마케팅 수신 등을 설정합니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link to="/profile/settings/billing">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard size={20} className="mr-2" />
                결제 정보
              </CardTitle>
              <CardDescription>
                구독, 결제 방법, 결제 내역을 관리합니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
```

## 8. shadcn/ui 컴포넌트 추가

알림 설정 페이지에서 사용하는 Switch 컴포넌트를 추가합니다.

```bash
npx shadcn@latest add switch
```

## 다음 단계

이제 사용자 프로필 및 설정 페이지의 기본 구조가 완성되었습니다. 다음 단계에서는 페이지네이션과 필터링 기능을 추가하여 프로필 페이지를 더욱 개선할 예정입니다.

개발 서버를 실행하여 구현한 페이지를 확인해보세요:

```bash
npm run dev
```

브라우저에서 다음 URL로 접속하여 각 페이지를 확인할 수 있습니다:

- http://localhost:3000/profile - 프로필 메인 페이지
- http://localhost:3000/profile/settings - 설정 페이지
- http://localhost:3000/profile/settings/account - 계정 설정
- http://localhost:3000/profile/settings/notifications - 알림 설정
- http://localhost:3000/profile/settings/billing - 결제 정보
