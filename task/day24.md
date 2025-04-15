# Day 24: 사용자 프로필, 팀 관리, 관리자 페이지 구현

## 목표

사용자 개인화 및 관리 기능을 강화합니다. 오늘은 사용자 프로필 페이지, 팀 관리 페이지, 그리고 기본적인 관리자 페이지 기능을 구현합니다.

## 작업 목록

1. 사용자 프로필 페이지 구현
2. 팀 관리 페이지 구현
3. 관리자 페이지 기능 구현 (사용자 관리, 콘텐츠 관리 등)

## 파일 생성 명령어

!!!bash
mkdir -p app/components/profile app/components/teams/management app/routes/admin app/components/admin
touch app/routes/users.$id.tsx # Flat Routes: /users/:id (사용자 프로필)
touch app/components/profile/UserProfileCard.tsx
touch app/components/profile/UserActivityTabs.tsx
touch app/routes/teams.$id.manage.tsx # Flat Routes: /teams/:id/manage (팀 관리)
touch app/components/teams/management/TeamSettingsForm.tsx
touch app/components/teams/management/TeamMembersTable.tsx
touch app/components/teams/management/InviteMemberForm.tsx
touch app/routes/admin.tsx # Flat Routes: /admin (관리자 레이아웃)
touch app/routes/admin._index.tsx # Flat Routes: /admin 인덱스 (관리자 대시보드)
touch app/routes/admin.users.tsx # Flat Routes: /admin/users (사용자 관리)
touch app/routes/admin.content.tsx # Flat Routes: /admin/content (콘텐츠 관리)
touch app/components/admin/AdminSidebar.tsx
touch app/components/admin/UsersDataTable.tsx # 사용자 관리 테이블
touch app/components/admin/ContentDataTable.tsx # 콘텐츠 관리 테이블
# 기존 팀 상세 페이지(app/routes/teams.$id.tsx) 등 관련 파일 수정 필요
!!!

## 1. 사용자 프로필 페이지 구현

### 사용자 프로필 카드 컴포넌트

`app/components/profile/UserProfileCard.tsx` 파일을 생성하여 사용자 기본 정보를 표시하는 카드를 만듭니다.

!!!typescript
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Mail, Link as LinkIcon, UserPlus, MessageSquare } from "lucide-react";
import { Link } from "@remix-run/react";

interface UserProfileCardProps {
  profile: {
    id: string;
    name: string;
    avatar_url?: string | null;
    bio?: string | null;
    website?: string | null;
    email?: string; // Assuming email is available
  };
  currentUserId?: string | null;
}

export function UserProfileCard({ profile, currentUserId }: UserProfileCardProps) {
  const isOwnProfile = currentUserId === profile.id;

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center space-x-4 pb-4">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.name} />
          <AvatarFallback className="text-2xl">
            {profile.name?.substring(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          {profile.bio && (
            <p className="text-muted-foreground mt-1">{profile.bio}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary">
                <LinkIcon className="mr-1 h-4 w-4" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {profile.email && (
               <span className="flex items-center">
                 <Mail className="mr-1 h-4 w-4" />
                 {profile.email}
               </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isOwnProfile && currentUserId && (
          <div className="flex gap-2">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" /> 팔로우 {/* TODO: 팔로우 기능 구현 */}
            </Button>
            <Button asChild>
              <Link to={`/chat/new?userId=${profile.id}`}> {/* TODO: 채팅 기능 구현 */} 
                 <MessageSquare className="mr-2 h-4 w-4" /> 메시지 보내기
              </Link>
            </Button>
          </div>
        )}
        {isOwnProfile && (
          <Button asChild variant="outline">
            <Link to="/settings/profile">프로필 수정</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
!!!

### 사용자 활동 탭 컴포넌트

`app/components/profile/UserActivityTabs.tsx` 파일을 생성하여 사용자가 작성한 게시글, 댓글, 참여 중인 팀 등을 탭으로 보여줍니다.

!!!typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
// import { PostList } from "~/components/posts/PostList"; // 예시: 게시글 목록 컴포넌트
// import { ProductList } from "~/components/products/ProductList"; // 예시: 제품 목록 컴포넌트
// import { TeamList } from "~/components/teams/TeamList"; // 예시: 팀 목록 컴포넌트

interface UserActivityTabsProps {
  userId: string;
  // 실제 데이터 타입에 맞게 수정 필요
  posts: any[]; 
  products: any[];
  teams: any[];
}

export function UserActivityTabs({ userId, posts, products, teams }: UserActivityTabsProps) {
  return (
    <Tabs defaultValue="posts">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="posts">게시글 ({posts.length})</TabsTrigger>
        <TabsTrigger value="products">제품 ({products.length})</TabsTrigger>
        <TabsTrigger value="teams">참여 팀 ({teams.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="posts">
        {/* <PostList posts={posts} /> */} 
        {posts.length > 0 ? 
          <p>작성한 게시글 목록이 여기에 표시됩니다.</p> :
          <p className="text-muted-foreground text-center py-4">작성한 게시글이 없습니다.</p>
        }
      </TabsContent>
      <TabsContent value="products">
        {/* <ProductList products={products} /> */} 
        {products.length > 0 ? 
          <p>등록한 제품 목록이 여기에 표시됩니다.</p> :
          <p className="text-muted-foreground text-center py-4">등록한 제품이 없습니다.</p>
        }
      </TabsContent>
      <TabsContent value="teams">
        {/* <TeamList teams={teams} /> */} 
        {teams.length > 0 ? 
          <p>참여 중인 팀 목록이 여기에 표시됩니다.</p> :
          <p className="text-muted-foreground text-center py-4">참여 중인 팀이 없습니다.</p>
        }
      </TabsContent>
    </Tabs>
  );
}
!!!

### 사용자 프로필 페이지 라우트

`app/routes/users.$id.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import { UserProfileCard } from "~/components/profile/UserProfileCard";
import { UserActivityTabs } from "~/components/profile/UserActivityTabs";
import { requireUserIdOptional } from "~/utils/auth.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const userName = data?.profile?.name || "사용자";
  return [{ title: `${userName} 프로필 - YkMake` }];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const profileId = params.id;
  const currentUserId = await requireUserIdOptional(request);

  if (!profileId) {
    throw new Response("사용자 ID가 필요합니다.", { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 프로필 정보 조회
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*, email:users(email)") // users 테이블에서 email 가져오기
    .eq("id", profileId)
    .single();

  if (profileError || !profile) {
    throw new Response("사용자를 찾을 수 없습니다.", { status: 404 });
  }

  // TODO: 해당 사용자의 활동 내역 조회 (게시글, 제품, 팀 등)
  const posts: any[] = []; // 예시
  const products: any[] = []; // 예시
  const teams: any[] = []; // 예시
  /*
  const { data: userPosts } = await supabase.from('posts').select('*').eq('author_id', profileId);
  const { data: userProducts } = await supabase.from('products').select('*').eq('author_id', profileId);
  const { data: userTeams } = await supabase.from('team_members').select('teams(*).eq('user_id', profileId);
  */

  return json({
    profile: {
      ...profile,
      email: profile.email?.[0]?.email, // email 정보 추출 (users 테이블이 배열을 반환할 수 있음)
    },
    posts,
    products,
    teams,
    currentUserId,
  });
}

export default function UserProfilePage() {
  const { profile, posts, products, teams, currentUserId } = useLoaderData<typeof loader>();

  return (
    <div className="container py-8">
      <UserProfileCard profile={profile} currentUserId={currentUserId} />
      <UserActivityTabs userId={profile.id} posts={posts} products={products} teams={teams} />
    </div>
  );
}
!!!

## 2. 팀 관리 페이지 구현

팀 관리 페이지는 팀 소유자 또는 관리자만 접근할 수 있습니다.

### 팀 설정 폼 컴포넌트

`app/components/teams/management/TeamSettingsForm.tsx` 파일을 생성합니다. (Day 22의 `TeamForm`과 유사하게 구현)

!!!typescript
// app/components/teams/management/TeamSettingsForm.tsx
// Day 22의 TeamForm 컴포넌트를 기반으로 수정하여 팀 정보 수정 기능 구현
// (구현 생략 - 필요시 TeamForm 참고)
import { useRef, useState } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";

interface TeamSettingsFormProps {
  teamId: string;
  defaultValues: {
    name: string;
    description: string;
    logo_url?: string | null;
    website?: string | null;
    size?: string | null;
    stage?: string | null;
    is_open_to_members: boolean;
  };
  error?: string;
}

export function TeamSettingsForm({ teamId, defaultValues, error }: TeamSettingsFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  
  const [isOpenToMembers, setIsOpenToMembers] = useState(
    defaultValues.is_open_to_members
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>팀 정보 수정</CardTitle>
      </CardHeader>
      <Form
        ref={formRef}
        method="post" // 액션은 부모 라우트에서 처리
        action={`/teams/${teamId}/manage`} // 팀 관리 페이지의 action
        className="space-y-6"
      >
        <CardContent className="space-y-6">
          <input type="hidden" name="_action" value="updateSettings" />
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">팀 이름</Label>
            <Input id="name" name="name" defaultValue={defaultValues.name} required />
          </div>
          
          {/* 로고, 웹사이트, 규모, 단계 등 다른 필드 추가 (TeamForm 참고) */}
          <div className="space-y-2">
             <Label htmlFor="logo_url">로고 URL</Label>
             <Input id="logo_url" name="logo_url" type="url" defaultValue={defaultValues.logo_url ?? undefined} />
           </div>
           <div className="space-y-2">
             <Label htmlFor="website">웹사이트</Label>
             <Input id="website" name="website" type="url" defaultValue={defaultValues.website ?? undefined} />
           </div>
           <div className="space-y-2">
             <Label htmlFor="size">팀 규모</Label>
             <Select name="size" defaultValue={defaultValues.size ?? undefined}>
               <SelectTrigger><SelectValue placeholder="팀 규모 선택" /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="solo">1인</SelectItem>
                 <SelectItem value="small">2-5명</SelectItem>
                 <SelectItem value="medium">6-15명</SelectItem>
                 <SelectItem value="large">16명+</SelectItem>
               </SelectContent>
             </Select>
           </div>
            <div className="space-y-2">
              <Label htmlFor="stage">개발 단계</Label>
              <Select name="stage" defaultValue={defaultValues.stage ?? undefined}>
                <SelectTrigger><SelectValue placeholder="개발 단계 선택" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">아이디어</SelectItem>
                  <SelectItem value="prototype">프로토타입</SelectItem>
                  <SelectItem value="mvp">MVP</SelectItem>
                  <SelectItem value="growth">성장</SelectItem>
                  <SelectItem value="mature">성숙</SelectItem>
                </SelectContent>
              </Select>
            </div>
         
          <div className="flex items-center space-x-2">
            <Switch
              id="is_open_to_members"
              name="is_open_to_members"
              checked={isOpenToMembers}
              onCheckedChange={setIsOpenToMembers}
            />
            <Label htmlFor="is_open_to_members">팀원 모집 ({isOpenToMembers ? "열림" : "닫힘"})</Label>
          </div>
         
          <div className="space-y-2">
            <Label htmlFor="description">팀 소개</Label>
            <Textarea id="description" name="description" defaultValue={defaultValues.description} rows={5} required />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "팀 정보 저장"}
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}
!!!

### 팀원 관리 테이블 컴포넌트

`app/components/teams/management/TeamMembersTable.tsx` 파일을 생성하여 팀원 목록과 역할을 보여주고, 추방/역할 변경 기능을 제공합니다.

!!!typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Form } from "@remix-run/react";
import { Trash2 } from "lucide-react";

interface TeamMember {
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user: {
    name: string;
    avatar_url?: string | null;
  };
}

interface TeamMembersTableProps {
  teamId: string;
  members: TeamMember[];
  currentUserId: string; // 현재 로그인한 사용자의 ID
}

export function TeamMembersTable({ teamId, members, currentUserId }: TeamMembersTableProps) {
  const handleRoleChange = (userId: string, newRole: string, form: HTMLFormElement | null) => {
    if (form) {
      const formData = new FormData(form);
      formData.set("memberId", userId);
      formData.set("newRole", newRole);
      formData.set("_action", "changeRole");
      // Submit the form programmatically or use fetcher
      form.submit(); 
    }
  };

  const handleRemoveMember = (userId: string, form: HTMLFormElement | null) => {
     if (form && confirm('정말 이 팀원을 추방하시겠습니까?')) {
       const formData = new FormData(form);
       formData.set("memberId", userId);
       formData.set("_action", "removeMember");
       form.submit();
     }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>팀원</TableHead>
          <TableHead>역할</TableHead>
          <TableHead>가입일</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.user_id}>
            <TableCell className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.user.avatar_url ?? undefined} />
                <AvatarFallback>{member.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{member.user.name} {member.user_id === currentUserId && "(나)"}</span>
            </TableCell>
            <TableCell>
              {member.user_id === currentUserId ? (
                 member.role === 'admin' ? '관리자' : '멤버' // 자신의 역할은 변경 불가
              ) : (
                <Form method="post" action={`/teams/${teamId}/manage`} id={`role-form-${member.user_id}`}>
                   <Select
                     name={`role-${member.user_id}`} // 고유한 name 사용
                     defaultValue={member.role}
                     onValueChange={(newRole) => handleRoleChange(
                       member.user_id, 
                       newRole, 
                       document.getElementById(`role-form-${member.user_id}`) as HTMLFormElement
                     )}>
                     <SelectTrigger className="w-[100px]">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="admin">관리자</SelectItem>
                       <SelectItem value="member">멤버</SelectItem>
                     </SelectContent>
                   </Select>
                 </Form>
              )}
            </TableCell>
            <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              {member.user_id !== currentUserId && (
                <Form method="post" action={`/teams/${teamId}/manage`} id={`remove-form-${member.user_id}`} style={{ display: 'inline-block' }}>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="text-red-600 hover:text-red-700"
                     onClick={() => handleRemoveMember(
                       member.user_id, 
                       document.getElementById(`remove-form-${member.user_id}`) as HTMLFormElement
                     )}
                     type="button" // Prevent default form submission
                   >
                     <Trash2 className="h-4 w-4" />
                     <span className="sr-only">팀원 추방</span>
                   </Button>
                 </Form>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
!!!

### 팀원 초대 폼 컴포넌트

`app/components/teams/management/InviteMemberForm.tsx` 파일을 생성하여 이메일로 팀원을 초대하는 기능을 구현합니다.

!!!typescript
import { Form, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

interface InviteMemberFormProps {
  teamId: string;
  error?: string;
  success?: string;
}

export function InviteMemberForm({ teamId, error, success }: InviteMemberFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Card>
      <CardHeader>
        <CardTitle>팀원 초대</CardTitle>
      </CardHeader>
      <Form 
         method="post" 
         action={`/teams/${teamId}/manage`} // 팀 관리 페이지의 action
         className="space-y-4"
      >
         <CardContent className="space-y-4">
           <input type="hidden" name="_action" value="inviteMember" />
           {error && <p className="text-sm text-red-600">{error}</p>}\
           {success && <p className="text-sm text-green-600">{success}</p>}\
           <div className="space-y-2">
             <Label htmlFor="email">초대할 사용자 이메일</Label>
             <Input id="email" name="email" type="email" required placeholder="user@example.com" />
           </div>
         </CardContent>
         <CardFooter>
           <Button type="submit" disabled={isSubmitting}>
             {isSubmitting ? "초대 중..." : "초대 보내기"}
           </Button>
         </CardFooter>
      </Form>
    </Card>
  );
}
!!!

### 팀 관리 페이지 라우트

`app/routes/teams.$id.manage.tsx` 파일을 생성하고 팀 정보 수정, 팀원 관리, 초대 기능을 통합합니다.

!!!typescript
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";
import { TeamSettingsForm } from "~/components/teams/management/TeamSettingsForm";
import { TeamMembersTable } from "~/components/teams/management/TeamMembersTable";
import { InviteMemberForm } from "~/components/teams/management/InviteMemberForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const teamName = data?.team?.name || "팀";
  return [{ title: `${teamName} 관리 - YkMake` }];
};

// 팀 데이터 및 관리 권한 확인
export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const teamId = params.id;

  if (!teamId) return redirect("/teams");

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  // 팀 정보 및 멤버 정보 조회
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*, members:team_members(*, user:profiles(name, avatar_url))")
    .eq("id", teamId)
    .single();

  if (teamError || !team) {
    throw new Response("팀을 찾을 수 없습니다.", { status: 404 });
  }

  // 현재 사용자가 팀 관리자인지 확인
  const isAdmin = team.members.some(m => m.user_id === userId && m.role === 'admin');
  if (!isAdmin) {
    // 시스템 관리자도 접근 허용
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (!profile || profile.role !== 'admin') {
       return redirect(`/teams/${teamId}`); // 권한 없으면 팀 상세 페이지로
    }
  }

  return json({ team, currentUserId: userId });
}

// 팀 관리 액션 처리 (정보 수정, 팀원 역할 변경/추방, 초대)
export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const teamId = params.id!;
  const formData = await request.formData();
  const _action = formData.get("_action");

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  // --- 공통: 관리자 권한 확인 --- 
  const { data: teamMember, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single();
  
  let isSystemAdmin = false;
  if (memberError || !teamMember || teamMember.role !== 'admin') {
     const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
     if (!profile || profile.role !== 'admin') {
        return json({ error: "팀을 관리할 권한이 없습니다." }, { status: 403 });
     }
     isSystemAdmin = true; // 시스템 관리자는 모든 작업 가능
  }
  // --- 권한 확인 끝 ---

  try {
    if (_action === "updateSettings") {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      // ... 다른 필드 가져오기 (TeamSettingsForm 참고)
      const logo_url = formData.get("logo_url") as string || null;
      const website = formData.get("website") as string || null;
      const size = formData.get("size") as string || null;
      const stage = formData.get("stage") as string || null;
      const is_open_to_members = formData.get("is_open_to_members") === "on";

      if (!name || !description) {
         return json({ formError: "팀 이름과 소개는 필수입니다." }, { status: 400 });
      }

      const { error } = await supabase
        .from("teams")
        .update({
          name,
          description,
          logo_url,
          website,
          size,
          stage,
          is_open_to_members,
          updated_at: new Date().toISOString(),
        })
        .eq("id", teamId);
      if (error) throw error;
      return json({ success: "팀 정보가 업데이트되었습니다." });

    } else if (_action === "changeRole") {
      const memberId = formData.get("memberId") as string;
      const newRole = formData.get("newRole") as 'admin' | 'member';
      if (memberId === userId && !isSystemAdmin) {
          return json({ error: "자신의 역할은 변경할 수 없습니다." }, { status: 400 });
      }
      const { error } = await supabase
        .from("team_members")
        .update({ role: newRole })
        .eq("team_id", teamId)
        .eq("user_id", memberId);
      if (error) throw error;
      return json({ success: "팀원 역할이 변경되었습니다." });

    } else if (_action === "removeMember") {
      const memberId = formData.get("memberId") as string;
      if (memberId === userId && !isSystemAdmin) {
          return json({ error: "자기 자신을 추방할 수 없습니다." }, { status: 400 });
      }
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", memberId);
      if (error) throw error;
      return json({ success: "팀원을 추방했습니다." });
     
    } else if (_action === "inviteMember") {
      const email = formData.get("email") as string;
      // TODO: 이메일로 사용자 ID 찾기
      // const { data: invitedUser } = await supabase.from('users').select('id').eq('email', email).single();
      // if (!invitedUser) return json({ inviteError: "해당 이메일의 사용자를 찾을 수 없습니다." });
      // TODO: 이미 팀원인지 확인
      // TODO: 초대 로직 구현 (예: Supabase의 `inviteUserByEmail` 또는 별도 초대 테이블 사용)
      console.log(`초대 이메일 전송 시뮬레이션: ${email}`);
      return json({ inviteSuccess: `(${email})님에게 초대 메일을 보냈습니다. (시뮬레이션)` });
    }

    return json({ error: "알 수 없는 작업입니다." }, { status: 400 });

  } catch (error: any) {
    console.error("팀 관리 작업 중 오류:", error);
    return json({ error: error.message || "작업 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export default function TeamManagePage() {
  const { team, currentUserId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">{team.name} 팀 관리</h1>
      <p className="text-muted-foreground mb-8">팀 정보 수정, 팀원 관리 및 초대를 할 수 있습니다.</p>

      <Tabs defaultValue="settings">
        <TabsList className="mb-6">
          <TabsTrigger value="settings">팀 설정</TabsTrigger>
          <TabsTrigger value="members">팀원 관리 ({team.members.length})</TabsTrigger>
          <TabsTrigger value="invites">초대</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <TeamSettingsForm 
             teamId={team.id}
             defaultValues={team} 
             error={actionData?._action === 'updateSettings' ? actionData?.formError : undefined}
          />
        </TabsContent>
        <TabsContent value="members">
          <TeamMembersTable 
             teamId={team.id} 
             members={team.members} 
             currentUserId={currentUserId}
          />
        </TabsContent>
        <TabsContent value="invites">
          <InviteMemberForm 
             teamId={team.id} 
             error={actionData?._action === 'inviteMember' ? actionData?.inviteError : undefined}
             success={actionData?._action === 'inviteMember' ? actionData?.inviteSuccess : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
!!!

## 3. 관리자 페이지 기능 구현

관리자 페이지는 특정 역할(`admin`)을 가진 사용자만 접근할 수 있습니다.

### 관리자 사이드바 컴포넌트

`app/components/admin/AdminSidebar.tsx` 파일을 생성하여 관리자 메뉴를 제공합니다.

!!!typescript
import { NavLink } from "@remix-run/react";
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react";
import { cn } from "~/lib/utils";

export function AdminSidebar() {
  const baseClasses = "flex items-center px-4 py-2 rounded-md text-sm font-medium";
  const activeClasses = "bg-muted text-primary";
  const inactiveClasses = "text-muted-foreground hover:bg-muted/50 hover:text-foreground";

  return (
    <aside className="w-64 border-r bg-background p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4 px-2">관리자 메뉴</h2>
      <nav className="flex flex-col space-y-1">
        <NavLink
          to="/admin" // admin._index.tsx
          end // 정확히 /admin 경로일 때만 active
          className={({ isActive }) => cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          대시보드
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
        >
          <Users className="mr-2 h-4 w-4" />
          사용자 관리
        </NavLink>
        <NavLink
          to="/admin/content"
          className={({ isActive }) => cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
        >
          <FileText className="mr-2 h-4 w-4" />
          콘텐츠 관리
        </NavLink>
        {/* 다른 관리 메뉴 추가 */}
         <NavLink
          to="/admin/settings" // 예시 경로
          className={({ isActive }) => cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
        >
          <Settings className="mr-2 h-4 w-4" />
          사이트 설정
        </NavLink>
      </nav>
    </aside>
  );
}
!!!

### 관리자 레이아웃 라우트

`app/routes/admin.tsx` 파일을 생성하여 관리자 페이지의 공통 레이아웃 (사이드바 포함) 및 접근 제어를 구현합니다.

!!!typescript
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server"; // 관리자 권한 확인 유틸리티
import { AdminSidebar } from "~/components/admin/AdminSidebar";

// 관리자 권한 확인
export async function loader({ request }: LoaderFunctionArgs) {
  const adminUser = await requireAdmin(request); // 관리자가 아니면 에러 또는 리디렉션 발생
  return json({ adminUser });
}

export default function AdminLayout() {
  // const { adminUser } = useLoaderData<typeof loader>(); // 필요시 관리자 정보 사용

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/40">
        <Outlet /> {/* 중첩된 관리자 라우트가 여기에 렌더링됨 */} 
      </main>
    </div>
  );
}
!!!

### 관리자 대시보드 (인덱스 페이지)

`app/routes/admin._index.tsx` 파일을 생성하여 기본적인 사이트 통계 등을 보여줍니다.

!!!typescript
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAdmin } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, FileText, MessageSquare, Lightbulb } from "lucide-react";

export const meta: MetaFunction = () => {
  return [{ title: "관리자 대시보드 - YkMake" }];
};

// 대시보드 데이터 로드
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  // 예시: 전체 사용자 수, 게시글 수, 댓글 수 등 조회
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
  const { count: commentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
  const { count: ideaCount } = await supabase.from('ideas').select('*', { count: 'exact', head: true });

  return json({
    stats: {
      users: userCount ?? 0,
      posts: postCount ?? 0,
      comments: commentCount ?? 0,
      ideas: ideaCount ?? 0,
    },
  });
}

export default function AdminDashboardPage() {
  const { stats } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="총 사용자" value={stats.users} />
        <StatCard icon={FileText} title="총 게시글" value={stats.posts} />
        <StatCard icon={MessageSquare} title="총 댓글" value={stats.comments} />
        <StatCard icon={Lightbulb} title="총 아이디어" value={stats.ideas} />
      </div>
      {/* 추가적인 통계 또는 관리 기능 링크 */}
    </div>
  );
}

// 간단한 통계 카드 컴포넌트
function StatCard({ icon: Icon, title, value }: {
  icon: React.ElementType;
  title: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
      </CardContent>
    </Card>
  );
}
!!!

### 사용자 관리 페이지

`app/routes/admin.users.tsx` 파일을 생성하고 사용자 목록 조회, 역할 변경, 비활성화 등의 기능을 구현합니다.

!!!typescript
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";
import { UsersDataTable } from "~/components/admin/UsersDataTable"; // 데이터 테이블 컴포넌트 사용

export const meta: MetaFunction = () => {
  return [{ title: "사용자 관리 - YkMake" }];
};

// 사용자 목록 로드
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  // 페이지네이션 또는 전체 목록 조회
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*, email:users(email), created_at:users(created_at)") // 필요한 정보 조인
    .order("created_at", { referencedTable: 'users', ascending: false });

  if (error) {
    console.error("사용자 목록 로드 오류:", error);
    throw new Response("사용자 목록을 불러올 수 없습니다.", { status: 500 });
  }

  // 데이터 가공 (email, created_at 등 중첩된 정보 처리)
  const processedUsers = users.map(u => ({
     ...u,
     email: u.email?.[0]?.email || 'N/A',
     created_at: u.created_at?.[0]?.created_at || 'N/A'
  }));

  return json({ users: processedUsers });
}

// TODO: 사용자 역할 변경, 비활성화 등을 처리하는 action 함수 구현
// export async function action({ request }: ActionFunctionArgs) { ... }

export default function AdminUsersPage() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">사용자 관리</h1>
      {/* Shadcn UI DataTable 등을 사용하여 사용자 목록 표시 및 관리 기능 제공 */}
      <UsersDataTable data={users} />
    </div>
  );
}
!!!

### 콘텐츠 관리 페이지

`app/routes/admin.content.tsx` 파일을 생성하고 게시글, 댓글, 제품 등 주요 콘텐츠를 관리(삭제, 숨김 등)하는 기능을 구현합니다.

!!!typescript
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";
import { ContentDataTable } from "~/components/admin/ContentDataTable"; // 데이터 테이블 컴포넌트 사용
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const meta: MetaFunction = () => {
  return [{ title: "콘텐츠 관리 - YkMake" }];
};

// 콘텐츠 목록 로드 (게시글, 댓글 등)
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  // 예시: 최근 게시글 및 댓글 로드
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("*, author:profiles(name)")
    .order("created_at", { ascending: false })
    .limit(50);
   
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*, user:profiles(name), post:posts(title)") // 관련 정보 조인
    .order("created_at", { ascending: false })
    .limit(50);

  if (postsError || commentsError) {
    console.error("콘텐츠 로드 오류:", postsError, commentsError);
    // 오류 처리를 더 견고하게 할 수 있음
  }

  return json({
    posts: posts || [],
    comments: comments || [],
    // 다른 콘텐츠 타입 추가 (products, ideas 등)
  });
}

// TODO: 콘텐츠 삭제, 숨김 등을 처리하는 action 함수 구현
// export async function action({ request }: ActionFunctionArgs) { ... }

export default function AdminContentPage() {
  const { posts, comments } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">콘텐츠 관리</h1>
      <Tabs defaultValue="posts">
        <TabsList className="mb-6">
          <TabsTrigger value="posts">게시글</TabsTrigger>
          <TabsTrigger value="comments">댓글</TabsTrigger>
          {/* 다른 콘텐츠 탭 추가 */}
        </TabsList>
        <TabsContent value="posts">
          <ContentDataTable contentType="posts" data={posts} />
        </TabsContent>
        <TabsContent value="comments">
          <ContentDataTable contentType="comments" data={comments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
!!!

### 데이터 테이블 컴포넌트 (예시)

관리 페이지에서 사용할 재사용 가능한 데이터 테이블 컴포넌트 예시입니다. 실제 구현 시에는 Shadcn UI의 DataTable 컴포넌트나 react-table 등을 활용하는 것이 좋습니다.

**`app/components/admin/UsersDataTable.tsx` (사용자 관리 테이블 예시):**

!!!typescript
// Shadcn UI DataTable 또는 유사 라이브러리 사용 권장
// https://ui.shadcn.com/docs/components/data-table
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";

export function UsersDataTable({ data }: { data: any[] }) {
  // TODO: 실제 데이터 구조에 맞게 타입 정의 및 컬럼 설정
  // TODO: 역할 변경, 비활성화 등 액션 구현

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                 <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role === 'admin' ? '관리자' : '일반'}
                 </Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-8 w-8">
                       <MoreHorizontal className="h-4 w-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => alert(`역할 변경: ${user.name}`)}>역할 변경</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => alert(`사용자 비활성화: ${user.name}`)}>비활성화</DropdownMenuItem>
                     <DropdownMenuItem className="text-red-600" onClick={() => alert(`사용자 삭제: ${user.name}`)}>삭제</DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
!!!

**`app/components/admin/ContentDataTable.tsx` (콘텐츠 관리 테이블 예시):**

!!!typescript
// Shadcn UI DataTable 또는 유사 라이브러리 사용 권장
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Link } from "@remix-run/react";

interface ContentDataTableProps {
  contentType: 'posts' | 'comments' | 'products' | 'ideas'; // 콘텐츠 타입
  data: any[];
}

export function ContentDataTable({ contentType, data }: ContentDataTableProps) {
  // TODO: 각 콘텐츠 타입에 맞는 컬럼 및 액션 정의

  const getColumns = () => {
     switch (contentType) {
       case 'posts':
         return [
           { key: 'title', header: '제목' },
           { key: 'author.name', header: '작성자' },
           { key: 'created_at', header: '작성일' },
         ];
       case 'comments':
         return [
           { key: 'content', header: '내용' },
           { key: 'user.name', header: '작성자' },
           { key: 'post.title', header: '관련 게시글' }, // 예시
           { key: 'created_at', header: '작성일' },
         ];
       // 다른 타입 추가
       default:
         return [{ key: 'id', header: 'ID' }];
     }
  };

  const columns = getColumns();

  // 중첩된 객체 값 가져오기 (예: user.name)
  const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, k) => (o || {})[k], obj);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={col.key}>{col.header}</TableHead>)}
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {columns.map(col => (
                 <TableCell key={col.key}>
                   {col.key === 'created_at' ? new Date(getNestedValue(item, col.key)).toLocaleDateString() :
                     col.key === 'content' ? (getNestedValue(item, col.key) as string)?.substring(0, 50) + '...' : // 내용 미리보기
                     getNestedValue(item, col.key)}
                 </TableCell>
              ))}
              <TableCell className="text-right">
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-8 w-8">
                       <MoreHorizontal className="h-4 w-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuItem asChild>
                        <Link to={`/${contentType}/${item.id}`} target="_blank">내용 보기</Link> {/* 콘텐츠 타입별 경로 수정 필요 */} 
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => alert(`콘텐츠 숨김: ${item.id}`)}>숨김</DropdownMenuItem>
                     <DropdownMenuItem className="text-red-600" onClick={() => alert(`콘텐츠 삭제: ${item.id}`)}>삭제</DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
!!!

## 실행 및 테스트

사용자 프로필, 팀 관리, 관리자 페이지 기능을 실행하고 테스트합니다:

!!!bash
# 개발 서버 실행
npm run dev

# 브라우저에서 다음 URL로 접속하여 각 기능 테스트
# - 사용자 프로필: /users/<사용자_ID> (예: /users/uuid-...) 
# - 팀 관리: /teams/<팀_ID>/manage (팀 관리자 권한 필요)
# - 관리자 페이지: /admin (관리자 권한 필요)
#   - 사용자 관리: /admin/users
#   - 콘텐츠 관리: /admin/content
!!!

## 다음 단계

주요 비공개 페이지 구현이 완료되었습니다! Day 25에서는 검색 기능 강화 및 필터링/정렬 옵션 추가를 진행합니다.

``` 