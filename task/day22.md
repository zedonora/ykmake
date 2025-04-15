# Day 22: 비공개 페이지 구현 (1)

## 목표

인증된 사용자만 접근할 수 있는 비공개 페이지를 구현합니다. 이번 단계에서는 게시글 작성, 구인/구직 등록, 팀 생성, 댓글 작성 기능을 구현합니다.

## 작업 목록

1. 게시글 작성 페이지 구현
2. 구인/구직 등록 페이지 구현
3. 팀 생성 페이지 구현
4. 댓글 작성 기능 구현

## 파일 생성 명령어 (추가)

!!!bash
mkdir -p app/components/comments app/routes
touch app/components/comments/CommentForm.tsx
touch app/components/comments/CommentItem.tsx
touch app/components/comments/CommentsList.tsx
touch app/routes/comments.tsx # Flat Routes: /comments 레이아웃
touch app/routes/comments._index.tsx # Flat Routes: /comments 인덱스
touch app/routes/comments.create.tsx # Flat Routes: /comments/create 경로
touch app/routes/comments.\$id.delete.tsx # Flat Routes: /comments/:id/delete 경로
# 기존 posts, jobs, teams 관련 파일 생성 명령어는 생략
!!!

## 1. 게시글 작성 페이지 구현

### 게시글 작성 폼 컴포넌트

`app/components/posts/PostForm.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { useRef, useState } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

interface PostFormProps {
  defaultValues?: {
    title?: string;
    content?: string;
    category?: string;
  };
  error?: string;
}

export function PostForm({ defaultValues = {}, error }: PostFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedCategory, setSelectedCategory] = useState(defaultValues.category || "");
  
  const categories = [
    { value: "question", label: "질문" },
    { value: "discussion", label: "토론" },
    { value: "showcase", label: "소개" },
    { value: "resource", label: "자료" },
    { value: "news", label: "뉴스" },
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">게시글 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          ref={formRef}
          method="post"
          className="space-y-6"
        >
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              name="title"
              type="text"
              defaultValue={defaultValues.title}
              required
              className="w-full"
              placeholder="제목을 입력하세요"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select 
              name="category" 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              name="content"
              rows={12}
              defaultValue={defaultValues.content}
              required
              className="w-full"
              placeholder="내용을 입력하세요"
            />
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          취소
        </Button>
        <Button
          type="submit"
          form={formRef.current?.id}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "게시글 등록"}
        </Button>
      </CardFooter>
    </Card>
  );
}
!!!

### 새 게시글 작성 페이지

`app/routes/posts.new.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { PostForm } from "~/components/posts/PostForm";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

export const meta: MetaFunction = () => {
  return [{ title: "새 게시글 작성 - YkMake" }];
};

// 인증 확인 및 페이지 보호
export async function loader({ request }: LoaderFunctionArgs) {
  // 인증된 사용자만 접근 가능
  await requireUserId(request);
  return json({});
}

// 게시글 저장 처리
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  
  // 폼 데이터 파싱
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  
  // 데이터 검증
  if (!title || !content || !category) {
    return json({ error: "제목, 내용, 카테고리를 모두 입력해주세요." }, { status: 400 });
  }
  
  try {
    // Supabase 클라이언트 설정
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 게시글 저장
    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          title,
          content,
          category,
          author_id: userId,
        },
      ])
      .select("id")
      .single();
    
    if (error) {
      console.error("게시글 저장 중 오류 발생:", error);
      return json({ error: "게시글을 저장하는 중 오류가 발생했습니다." }, { status: 500 });
    }
    
    // 성공 시 게시글 상세 페이지로 리디렉션
    return redirect(`/posts/${data.id}`);
  } catch (error) {
    console.error("게시글 저장 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export default function NewPostPage() {
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="container py-8">
      <PostForm error={actionData?.error} />
    </div>
  );
}
!!!

### 게시글 편집 페이지

`app/routes/posts.$id.edit.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { PostForm } from "~/components/posts/PostForm";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";

export const meta: MetaFunction = () => {
  return [{ title: "게시글 편집 - YkMake" }];
};

// 게시글 데이터 로드 및 권한 확인
export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const postId = params.id;
  
  if (!postId) {
    return redirect("/posts");
  }
  
  // Supabase 클라이언트 설정
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 게시글 데이터 조회
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();
  
  if (error || !post) {
    return redirect("/posts");
  }
  
  // 게시글 작성자 또는 관리자인지 확인
  if (post.author_id !== userId) {
    // 관리자 여부 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    if (!profile || profile.role !== "admin") {
      return redirect("/posts");
    }
  }
  
  return json({ post });
}

// 게시글 업데이트 처리
export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const postId = params.id;
  
  // 폼 데이터 파싱
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  
  // 데이터 검증
  if (!title || !content || !category) {
    return json({ error: "제목, 내용, 카테고리를 모두 입력해주세요." }, { status: 400 });
  }
  
  try {
    // Supabase 클라이언트 설정
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 게시글 권한 확인
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single();
    
    if (fetchError || !post) {
      return json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }
    
    // 권한 확인 (작성자 또는 관리자만 편집 가능)
    if (post.author_id !== userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (!profile || profile.role !== "admin") {
        return json({ error: "이 게시글을 편집할 권한이 없습니다." }, { status: 403 });
      }
    }
    
    // 게시글 업데이트
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title,
        content,
        category,
        updated_at: new Date().toISOString()
      })
      .eq("id", postId);
    
    if (updateError) {
      console.error("게시글 업데이트 중 오류 발생:", updateError);
      return json({ error: "게시글을 업데이트하는 중 오류가 발생했습니다." }, { status: 500 });
    }
    
    // 성공 시 게시글 상세 페이지로 리디렉션
    return redirect(`/posts/${postId}`);
  } catch (error) {
    console.error("게시글 업데이트 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export default function EditPostPage() {
  const { post } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="container py-8">
      <PostForm
        defaultValues={{
          title: post.title,
          content: post.content,
          category: post.category,
        }}
        error={actionData?.error}
      />
    </div>
  );
}
!!!

## 2. 구인/구직 등록 페이지 구현

### 구인/구직 등록 폼 컴포넌트

`app/components/jobs/JobPostForm.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
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
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "~/components/ui/tabs";
import { Switch } from "~/components/ui/switch";
import { Checkbox } from "~/components/ui/checkbox";

interface JobPostFormProps {
  defaultValues?: {
    title?: string;
    description?: string;
    type?: "job" | "application";
    position?: string;
    location?: string;
    salary_range?: string;
    remote?: boolean;
    skills?: string[];
    company_name?: string;
    company_url?: string;
    contact_email?: string;
  };
  error?: string;
}

export function JobPostForm({ defaultValues = {}, error }: JobPostFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  
  const [jobType, setJobType] = useState<"job" | "application">(
    defaultValues.type || "job"
  );
  
  const [remoteWork, setRemoteWork] = useState(defaultValues.remote || false);
  
  const skills = [
    { id: "react", label: "React" },
    { id: "vue", label: "Vue" },
    { id: "angular", label: "Angular" },
    { id: "node", label: "Node.js" },
    { id: "python", label: "Python" },
    { id: "java", label: "Java" },
    { id: "csharp", label: "C#" },
    { id: "typescript", label: "TypeScript" },
    { id: "flutter", label: "Flutter" },
    { id: "react-native", label: "React Native" },
    { id: "aws", label: "AWS" },
    { id: "gcp", label: "Google Cloud" },
    { id: "azure", label: "Azure" },
    { id: "devops", label: "DevOps" },
    { id: "database", label: "Database" },
  ];
  
  const defaultSkills = defaultValues.skills || [];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">구인/구직 등록</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={jobType} onValueChange={(v) => setJobType(v as "job" | "application")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="job">구인글 작성</TabsTrigger>
            <TabsTrigger value="application">구직글 작성</TabsTrigger>
          </TabsList>
          
          <Form
            ref={formRef}
            method="post"
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <input type="hidden" name="type" value={jobType} />
            
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                type="text"
                defaultValue={defaultValues.title}
                required
                className="w-full"
                placeholder={jobType === "job" ? "개발자 모집합니다" : "개발자 구직합니다"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">포지션</Label>
              <Select name="position" defaultValue={defaultValues.position || ""} required>
                <SelectTrigger>
                  <SelectValue placeholder="포지션 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">프론트엔드 개발자</SelectItem>
                  <SelectItem value="backend">백엔드 개발자</SelectItem>
                  <SelectItem value="fullstack">풀스택 개발자</SelectItem>
                  <SelectItem value="mobile">모바일 개발자</SelectItem>
                  <SelectItem value="devops">DevOps 엔지니어</SelectItem>
                  <SelectItem value="designer">UI/UX 디자이너</SelectItem>
                  <SelectItem value="pm">프로젝트 매니저</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {jobType === "job" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company_name">회사/팀명</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    type="text"
                    defaultValue={defaultValues.company_name}
                    required={jobType === "job"}
                    className="w-full"
                    placeholder="회사 또는 팀 이름"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_url">회사/팀 웹사이트</Label>
                  <Input
                    id="company_url"
                    name="company_url"
                    type="url"
                    defaultValue={defaultValues.company_url}
                    className="w-full"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary_range">급여 범위</Label>
                  <Select name="salary_range" defaultValue={defaultValues.salary_range || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="급여 범위 선택 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="negotiable">협의 가능</SelectItem>
                      <SelectItem value="under_3000">3,000만원 미만</SelectItem>
                      <SelectItem value="3000_4000">3,000만원 ~ 4,000만원</SelectItem>
                      <SelectItem value="4000_5000">4,000만원 ~ 5,000만원</SelectItem>
                      <SelectItem value="5000_6000">5,000만원 ~ 6,000만원</SelectItem>
                      <SelectItem value="over_6000">6,000만원 이상</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="location">위치</Label>
              <Input
                id="location"
                name="location"
                type="text"
                defaultValue={defaultValues.location}
                className="w-full"
                placeholder="서울 강남구"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="remote"
                name="remote"
                checked={remoteWork}
                onCheckedChange={setRemoteWork}
              />
              <Label htmlFor="remote" className="cursor-pointer">
                원격 근무 {remoteWork ? "가능" : "불가능"}
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label>기술 스택</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill.id}`}
                      name="skills"
                      value={skill.id}
                      defaultChecked={defaultSkills.includes(skill.id)}
                    />
                    <Label
                      htmlFor={`skill-${skill.id}`}
                      className="cursor-pointer text-sm"
                    >
                      {skill.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">상세 내용</Label>
              <Textarea
                id="description"
                name="description"
                rows={8}
                defaultValue={defaultValues.description}
                required
                className="w-full"
                placeholder={
                  jobType === "job"
                    ? "구인 정보, 자격 요건, 기타 상세 내용을 작성해주세요."
                    : "자기 소개, 경력, 기타 상세 내용을 작성해주세요."
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">연락처 이메일</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={defaultValues.contact_email}
                required
                className="w-full"
                placeholder="contact@example.com"
              />
            </div>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          취소
        </Button>
        <Button
          type="submit"
          form={formRef.current?.id}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : 
            jobType === "job" ? "구인글 등록" : "구직글 등록"}
        </Button>
      </CardFooter>
    </Card>
  );
}
!!!

### 구인/구직글 등록 페이지

`app/routes/jobs.new.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { JobPostForm } from "~/components/jobs/JobPostForm";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";

export const meta: MetaFunction = () => {
  return [{ title: "구인/구직 등록 - YkMake" }];
};

// 인증 확인 및 페이지 보호
export async function loader({ request }: LoaderFunctionArgs) {
  // 인증된 사용자만 접근 가능
  await requireUserId(request);
  return json({});
}

// 구인/구직글 저장 처리
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  
  // 폼 데이터 파싱
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as "job" | "application";
  const position = formData.get("position") as string;
  const location = formData.get("location") as string;
  const remote = formData.get("remote") === "on" || formData.get("remote") === "true";
  const salary_range = formData.get("salary_range") as string | null;
  const company_name = formData.get("company_name") as string | null;
  const company_url = formData.get("company_url") as string | null;
  const contact_email = formData.get("contact_email") as string;
  const skills = formData.getAll("skills") as string[];
  
  // 데이터 검증
  if (!title || !description || !position || !contact_email) {
    return json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
  }
  
  // job 타입일 때 회사/팀명 필수
  if (type === "job" && !company_name) {
    return json({ error: "회사/팀 이름은 필수입니다." }, { status: 400 });
  }
  
  try {
    // Supabase 클라이언트 설정
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 구인/구직글 저장
    const { data, error } = await supabase
      .from("job_posts")
      .insert([
        {
          title,
          description,
          type,
          position,
          location,
          remote,
          salary_range,
          company_name,
          company_url,
          contact_email,
          skills,
          user_id: userId,
        },
      ])
      .select("id")
      .single();
    
    if (error) {
      console.error("구인/구직글 저장 중 오류 발생:", error);
      return json({ error: "구인/구직글을 저장하는 중 오류가 발생했습니다." }, { status: 500 });
    }
    
    // 성공 시 구인/구직글 상세 페이지로 리디렉션
    return redirect(`/jobs/${data.id}`);
  } catch (error) {
    console.error("구인/구직글 저장 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export default function NewJobPostPage() {
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="container py-8">
      <JobPostForm error={actionData?.error} />
    </div>
  );
}
!!!

### 구인/구직글 편집 페이지

`app/routes/jobs.$id.edit.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { JobPostForm } from "~/components/jobs/JobPostForm";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";

export const meta: MetaFunction = () => {
  return [{ title: "구인/구직글 편집 - YkMake" }];
};

// 구인/구직글 데이터 로드 및 권한 확인
export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const jobId = params.id;
  
  if (!jobId) {
    return redirect("/jobs");
  }
  
  // Supabase 클라이언트 설정
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 구인/구직글 데이터 조회
  const { data: jobPost, error } = await supabase
    .from("job_posts")
    .select("*")
    .eq("id", jobId)
    .single();
  
  if (error || !jobPost) {
    return redirect("/jobs");
  }
  
  // 작성자 또는 관리자인지 확인
  if (jobPost.user_id !== userId) {
    // 관리자 여부 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    if (!profile || profile.role !== "admin") {
      return redirect("/jobs");
    }
  }
  
  return json({ jobPost });
}

// 구인/구직글 업데이트 처리
export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const jobId = params.id;
  
  // 폼 데이터 파싱
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as "job" | "application";
  const position = formData.get("position") as string;
  const location = formData.get("location") as string;
  const remote = formData.get("remote") === "on" || formData.get("remote") === "true";
  const salary_range = formData.get("salary_range") as string | null;
  const company_name = formData.get("company_name") as string | null;
  const company_url = formData.get("company_url") as string | null;
  const contact_email = formData.get("contact_email") as string;
  const skills = formData.getAll("skills") as string[];
  
  // 데이터 검증
  if (!title || !description || !position || !contact_email) {
    return json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
  }
  
  // job 타입일 때 회사/팀명 필수
  if (type === "job" && !company_name) {
    return json({ error: "회사/팀 이름은 필수입니다." }, { status: 400 });
  }
  
  try {
    // Supabase 클라이언트 설정
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 구인/구직글 권한 확인
    const { data: jobPost, error: fetchError } = await supabase
      .from("job_posts")
      .select("user_id")
      .eq("id", jobId)
      .single();
    
    if (fetchError || !jobPost) {
      return json({ error: "구인/구직글을 찾을 수 없습니다." }, { status: 404 });
    }
    
    // 권한 확인 (작성자 또는 관리자만 편집 가능)
    if (jobPost.user_id !== userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (!profile || profile.role !== "admin") {
        return json({ error: "이 구인/구직글을 편집할 권한이 없습니다." }, { status: 403 });
      }
    }
    
    // 구인/구직글 업데이트
    const { error: updateError } = await supabase
      .from("job_posts")
      .update({
        title,
        description,
        type,
        position,
        location,
        remote,
        salary_range,
        company_name,
        company_url,
        contact_email,
        skills,
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId);
    
    if (updateError) {
      console.error("구인/구직글 업데이트 중 오류 발생:", updateError);
      return json({ error: "구인/구직글을 업데이트하는 중 오류가 발생했습니다." }, { status: 500 });
    }
    
    // 성공 시 구인/구직글 상세 페이지로 리디렉션
    return redirect(`/jobs/${jobId}`);
  } catch (error) {
    console.error("구인/구직글 업데이트 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export default function EditJobPostPage() {
  const { jobPost } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="container py-8">
      <JobPostForm
        defaultValues={{
          title: jobPost.title,
          description: jobPost.description,
          type: jobPost.type,
          position: jobPost.position,
          location: jobPost.location,
          remote: jobPost.remote,
          salary_range: jobPost.salary_range,
          company_name: jobPost.company_name,
          company_url: jobPost.company_url,
          contact_email: jobPost.contact_email,
          skills: jobPost.skills,
        }}
        error={actionData?.error}
      />
    </div>
  );
}
!!!

## 3. 팀 생성 페이지 구현

### 팀 생성 폼 컴포넌트

`app/components/teams/TeamForm.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
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
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";

interface TeamFormProps {
  defaultValues?: {
    name?: string;
    description?: string;
    logo_url?: string;
    website?: string;
    size?: string;
    stage?: string;
    is_open_to_members?: boolean;
  };
  error?: string;
}

export function TeamForm({ defaultValues = {}, error }: TeamFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  
  const [isOpenToMembers, setIsOpenToMembers] = useState(
    defaultValues.is_open_to_members === undefined ? true : defaultValues.is_open_to_members
  );

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">팀 만들기</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          ref={formRef}
          method="post"
          className="space-y-6"
        >
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">팀 이름</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={defaultValues.name}
              required
              className="w-full"
              placeholder="팀 이름"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logo_url">로고 URL</Label>
            <Input
              id="logo_url"
              name="logo_url"
              type="url"
              defaultValue={defaultValues.logo_url}
              className="w-full"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-sm text-muted-foreground">로고 이미지의 URL을 입력하세요. (선택사항)</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">웹사이트</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={defaultValues.website}
              className="w-full"
              placeholder="https://example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="size">팀 규모</Label>
            <Select name="size" defaultValue={defaultValues.size || ""}>
              <SelectTrigger>
                <SelectValue placeholder="팀 규모 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">1인 (솔로)</SelectItem>
                <SelectItem value="small">소규모 (2-5명)</SelectItem>
                <SelectItem value="medium">중규모 (6-15명)</SelectItem>
                <SelectItem value="large">대규모 (16명 이상)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stage">개발 단계</Label>
            <Select name="stage" defaultValue={defaultValues.stage || ""}>
              <SelectTrigger>
                <SelectValue placeholder="개발 단계 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">아이디어 단계</SelectItem>
                <SelectItem value="prototype">프로토타입</SelectItem>
                <SelectItem value="mvp">MVP (최소 기능 제품)</SelectItem>
                <SelectItem value="growth">성장 단계</SelectItem>
                <SelectItem value="mature">성숙 단계</SelectItem>
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
            <Label htmlFor="is_open_to_members" className="cursor-pointer">
              신규 팀원 모집 {isOpenToMembers ? "열림" : "닫힘"}
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">팀 소개</Label>
            <Textarea
              id="description"
              name="description"
              rows={8}
              defaultValue={defaultValues.description}
              required
              className="w-full"
              placeholder="팀에 대한 설명, 비전, 현재 진행 중인 프로젝트 등을 작성해주세요."
            />
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          취소
        </Button>
        <Button
          type="submit"
          form={formRef.current?.id}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "팀 만들기"}
        </Button>
      </CardFooter>
    </Card>
  );
}
!!!

### 팀 생성 페이지

`app/routes/teams.new.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { TeamForm } from "~/components/teams/TeamForm";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";

export const meta: MetaFunction = () => {
  return [{ title: "새 팀 만들기 - YkMake" }];
};

// 인증 확인 및 페이지 보호
export async function loader({ request }: LoaderFunctionArgs) {
  // 인증된 사용자만 접근 가능
  await requireUserId(request);
  return json({});
}

// 팀 생성 처리
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  
  // 폼 데이터 파싱
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const logo_url = formData.get("logo_url") as string || null;
  const website = formData.get("website") as string || null;
  const size = formData.get("size") as string || null;
  const stage = formData.get("stage") as string || null;
  const is_open_to_members = formData.get("is_open_to_members") === "on" || formData.get("is_open_to_members") === "true";
  
  // 데이터 검증
  if (!name || !description) {
    return json({ error: "팀 이름과 소개는 필수입니다." }, { status: 400 });
  }
  
  try {
    // Supabase 클라이언트 설정
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 트랜잭션으로 팀 생성 및 팀원 추가
    const { data, error } = await supabase.rpc('create_team_with_admin', {
      team_name: name,
      team_description: description,
      team_logo_url: logo_url,
      team_website: website,
      team_size: size,
      team_stage: stage,
      team_is_open_to_members: is_open_to_members,
      admin_user_id: userId
    });
    
    if (error) {
      console.error("팀 생성 중 오류 발생:", error);
      return json({ error: "팀을 생성하는 중 오류가 발생했습니다." }, { status: 500 });
    }
    
    // 성공 시 팀 상세 페이지로 리디렉션
    return redirect(`/teams/${data.team_id}`);
  } catch (error) {
    console.error("팀 생성 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export default function NewTeamPage() {
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="container py-8">
      <TeamForm error={actionData?.error} />
    </div>
  );
}
!!!

### 팀 편집 페이지

`app/routes/teams.$id.edit.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { TeamForm } from "~/components/teams/TeamForm";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";

export const meta: MetaFunction = () => {
  return [{ title: "팀 정보 편집 - YkMake" }];
};

// 팀 데이터 로드 및 권한 확인
export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const teamId = params.id;
  
  if (!teamId) {
    return redirect("/teams");
  }
  
  // Supabase 클라이언트 설정
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 팀 데이터 조회
  const { data: team, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();
  
  if (error || !team) {
    return redirect("/teams");
  }
  
  // 팀의 관리자인지 확인
  const { data: teamMember, error: memberError } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single();
  
  if (memberError || !teamMember || teamMember.role !== "admin") {
    // 관리자가 아니라면 일반 사용자 권한 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    if (!profile || profile.role !== "admin") {
      return redirect(`/teams/${teamId}`);
    }
  }
  
  return json({ team });
}

// 팀 정보 업데이트 처리
export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const teamId = params.id;
  
  // 폼 데이터 파싱
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const logo_url = formData.get("logo_url") as string || null;
  const website = formData.get("website") as string || null;
  const size = formData.get("size") as string || null;
  const stage = formData.get("stage") as string || null;
  const is_open_to_members = formData.get("is_open_to_members") === "on" || formData.get("is_open_to_members") === "true";
  
  // 데이터 검증
  if (!name || !description) {
    return json({ error: "팀 이름과 소개는 필수입니다." }, { status: 400 });
  }
  
  try {
    // Supabase 클라이언트 설정
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 팀 관리자 권한 확인
    const { data: teamMember, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single();
    
    if (memberError || !teamMember || teamMember.role !== "admin") {
      // 관리자가 아니라면 시스템 관리자 권한 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (!profile || profile.role !== "admin") {
        return json({ error: "이 팀을 편집할 권한이 없습니다." }, { status: 403 });
      }
    }
    
    // 팀 정보 업데이트
    const { error: updateError } = await supabase
      .from("teams")
      .update({
        name,
        description,
        logo_url,
        website,
        size,
        stage,
        is_open_to_members,
        updated_at: new Date().toISOString()
      })
      .eq("id", teamId);
    
    if (updateError) {
      console.error("팀 정보 업데이트 중 오류 발생:", updateError);
      return json({ error: "팀 정보를 업데이트하는 중 오류가 발생했습니다." }, { status: 500 });
    }
    
    // 성공 시 팀 상세 페이지로 리디렉션
    return redirect(`/teams/${teamId}`);
  } catch (error) {
    console.error("팀 정보 업데이트 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export default function EditTeamPage() {
  const { team } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="container py-8">
      <TeamForm
        defaultValues={{
          name: team.name,
          description: team.description,
          logo_url: team.logo_url,
          website: team.website,
          size: team.size,
          stage: team.stage,
          is_open_to_members: team.is_open_to_members,
        }}
        error={actionData?.error}
      />
    </div>
  );
}
!!!

## 4. 댓글 작성 기능 구현

### 댓글 폼 컴포넌트

`app/components/comments/CommentForm.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { useRef } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

interface CommentFormProps {
  parentId?: string;
  error?: string;
  placeholder?: string;
  entityType: "post" | "product" | "idea" | "job";
  entityId: string;
  onCancel?: () => void;
  defaultContent?: string;
}

export function CommentForm({
  parentId,
  error,
  placeholder = "댓글을 작성해주세요",
  entityType,
  entityId,
  onCancel,
  defaultContent = "",
}: CommentFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="w-full mb-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <Form
        ref={formRef}
        method="post"
        action={`/comments/create?returnTo=${encodeURIComponent(window.location.pathname)}`}
        className="space-y-4"
      >
        <input type="hidden" name="entityType" value={entityType} />
        <input type="hidden" name="entityId" value={entityId} />
        {parentId && <input type="hidden" name="parentId" value={parentId} />}
        
        <Textarea
          id="content"
          name="content"
          rows={3}
          required
          defaultValue={defaultContent}
          placeholder={placeholder}
          className="w-full resize-none"
        />
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "댓글 작성"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
!!!

### 댓글 컴포넌트

`app/components/comments/CommentItem.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { useState } from "react";
import { Link } from "@remix-run/react";
import { CommentForm } from "./CommentForm";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { 
  MoreHorizontal, 
  MessageSquare, 
  ThumbsUp, 
  Flag, 
  Pencil, 
  Trash2 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      avatar_url?: string;
    };
    parent_id: string | null;
    likes_count: number;
    replies?: CommentItemProps["comment"][];
  };
  currentUserId?: string;
  entityType: "post" | "product" | "idea" | "job";
  entityId: string;
  onDelete?: (id: string) => void;
}

export function CommentItem({
  comment,
  currentUserId,
  entityType,
  entityId,
  onDelete,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  
  const isAuthor = currentUserId === comment.user.id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="flex space-x-4 py-4">
      <div>
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user.avatar_url} alt={comment.user.name} />
          <AvatarFallback>
            {comment.user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <Link
                to={`/users/${comment.user.id}`}
                className="font-semibold hover:underline"
              >
                {comment.user.name}
              </Link>
              <span className="text-muted-foreground text-sm ml-2">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsReplying(!isReplying)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>답글 달기</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {isAuthor ? (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>수정하기</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete && onDelete(comment.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>삭제하기</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => alert("신고가 접수되었습니다.")}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    <span>신고하기</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {isEditing ? (
            <CommentForm
              entityType={entityType}
              entityId={entityId}
              defaultContent={comment.content}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="mt-2">{comment.content}</div>
          )}
          
          <div className="mt-4 flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
            >
              <ThumbsUp className="mr-1 h-4 w-4" />
              <span>{comment.likes_count > 0 ? comment.likes_count : "좋아요"}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className="h-8 px-2 text-muted-foreground"
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>답글</span>
            </Button>
          </div>
        </div>
        
        {isReplying && (
          <div className="mt-4 pl-6">
            <CommentForm
              entityType={entityType}
              entityId={entityId}
              parentId={comment.id}
              placeholder="답글을 작성해주세요"
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}
        
        {hasReplies && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-muted-foreground"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies
                ? `답글 숨기기 (${comment.replies?.length})`
                : `답글 보기 (${comment.replies?.length})`}
            </Button>
            
            {showReplies && (
              <div className="pl-6 border-l-2 border-muted mt-2">
                {comment.replies?.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    entityType={entityType}
                    entityId={entityId}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
!!!

### 댓글 목록 컴포넌트

`app/components/comments/CommentsList.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";

interface CommentsListProps {
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      avatar_url?: string;
    };
    parent_id: string | null;
    likes_count: number;
    replies?: any[];
  }>;
  currentUserId?: string;
  entityType: "post" | "product" | "idea" | "job";
  entityId: string;
  onDelete?: (id: string) => void;
}

export function CommentsList({
  comments,
  currentUserId,
  entityType,
  entityId,
  onDelete,
}: CommentsListProps) {
  // 댓글을 계층 구조로 변환
  const rootComments = comments.filter((comment) => !comment.parent_id);
  
  // 부모 댓글 ID로 자식 댓글 그룹화
  const commentMap = comments.reduce((acc, comment) => {
    if (comment.parent_id) {
      if (!acc[comment.parent_id]) {
        acc[comment.parent_id] = [];
      }
      acc[comment.parent_id].push(comment);
    }
    return acc;
  }, {} as Record<string, typeof comments>);
  
  // 각 루트 댓글에 자식 댓글 추가
  const commentsWithReplies = rootComments.map((comment) => ({
    ...comment,
    replies: commentMap[comment.id] || [],
  }));

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">댓글 작성</h3>
        <CommentForm
          entityType={entityType}
          entityId={entityId}
          placeholder="의견을 남겨주세요"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">
          댓글 {comments.length > 0 ? `(${comments.length})` : ""}
        </h3>
        
        {commentsWithReplies.length > 0 ? (
          <div className="space-y-2 divide-y">
            {commentsWithReplies.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                entityType={entityType}
                entityId={entityId}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        )}
      </div>
    </div>
  );
}
!!!

### 댓글 생성 라우트

`app/routes/comments.create.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";

// 댓글 생성 처리
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  
  // URL 쿼리 파라미터 파싱 (리디렉션용)
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") || "/";
  
  // 폼 데이터 파싱
  const formData = await request.formData();
  const content = formData.get("content") as string;
  const entityType = formData.get("entityType") as "post" | "product" | "idea" | "job";
  const entityId = formData.get("entityId") as string;
  const parentId = formData.get("parentId") as string || null;
  
  // 데이터 검증
  if (!content || !entityType || !entityId) {
    return json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
  }
  
  try {
    // Supabase 클라이언트 설정
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 댓글 저장
    const { error } = await supabase
      .from("comments")
      .insert([
        {
          content,
          entity_type: entityType,
          entity_id: entityId,
          parent_id: parentId,
          user_id: userId,
        },
      ]);
    
    if (error) {
      console.error("댓글 저장 중 오류 발생:", error);
      return json({ error: "댓글을 저장하는 중 오류가 발생했습니다." }, { status: 500 });
    }
    
    // 성공 시 원래 페이지로 리디렉션
    return redirect(returnTo);
  } catch (error) {
    console.error("댓글 저장 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
!!!

### 댓글 삭제 라우트

`app/routes/comments.$id.delete.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";

// 로더에서 직접 접근 방지
export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/");
}

// 댓글 삭제 처리
export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const commentId = params.id;
  
  if (!commentId) {
    return json({ error: "댓글 ID가 필요합니다." }, { status: 400 });
  }
  
  // URL 쿼리 파라미터 파싱 (리디렉션용)
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") || "/";
  
  try {
    // Supabase 클라이언트 설정
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 댓글 권한 확인
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();
    
    if (fetchError || !comment) {
      return json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    
    // 권한 확인 (작성자 또는 관리자만 삭제 가능)
    if (comment.user_id !== userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (!profile || profile.role !== "admin") {
        return json({ error: "이 댓글을 삭제할 권한이 없습니다." }, { status: 403 });
      }
    }
    
    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    
    if (deleteError) {
      console.error("댓글 삭제 중 오류 발생:", deleteError);
      return json({ error: "댓글을 삭제하는 중 오류가 발생했습니다." }, { status: 500 });
    }
    
    // 성공 시 원래 페이지로 리디렉션
    return redirect(returnTo);
  } catch (error) {
    console.error("댓글 삭제 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
!!!

### 댓글 레이아웃 및 인덱스 (선택 사항 예시)

만약 `/comments` 경로 아래에 여러 라우트가 존재하고 공통 레이아웃이나 `/comments` 경로 자체의 페이지가 필요하다면, 다음과 같이 파일을 생성할 수 있습니다.

**`app/routes/comments.tsx` (레이아웃 예시):**

!!!typescript
import { Outlet } from "@remix-run/react";
// import { Breadcrumbs } from "~/components/layout/breadcrumbs"; // 예시 Breadcrumbs 컴포넌트

export default function CommentsLayout() {
  return (
    <div>
      {/* <Breadcrumbs path="/comments" /> */}
      <main className="container mx-auto py-4">
        {/* 하위 라우트(comments.create, comments.$id.delete 등)가 여기에 렌더링됨 */}
        <Outlet />
      </main>
    </div>
  );
}
!!!

**`app/routes/comments._index.tsx` (인덱스 페이지 예시):**

!!!typescript
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button"; // Button 컴포넌트 경로 확인

export default function CommentsIndex() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-semibold">댓글 관리</h1>
      <p className="text-muted-foreground">
        이 경로는 댓글 생성 및 삭제와 관련된 액션 엔드포인트를 포함합니다.
      </p>
      {/* 필요시 추가 정보 표시 */}
      <Button asChild variant="link">
        <Link to="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
!!!

### 게시글 상세 페이지에 댓글 목록 추가 (예시)

댓글 기능은 `RootLayout` 컴포넌트 내부에 렌더링되는 다양한 상세 페이지 (예: 게시글, 제품, 아이디어, 구인 정보)에서 사용됩니다. `CommentsList` 컴포넌트를 해당 페이지의 적절한 위치에 추가하여 댓글 기능을 통합합니다. 아래는 게시글 상세 페이지(`app/routes/posts.$id.tsx`)에 댓글 목록을 추가하는 예시입니다.

`app/routes/posts.$id.tsx` 파일에 댓글 목록 컴포넌트를 추가합니다:

!!!typescript
// ... 기존 import 구문

import { CommentsList } from "~/components/comments/CommentsList";
import { Form } from "@remix-run/react";

// ... loader 함수 내용 수정
export async function loader({ request, params }: LoaderFunctionArgs) {
  const postId = params.id;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 인증 여부 확인 (댓글 권한용)
  let userId;
  try {
    userId = await requireUserId(request);
  } catch (error) {
    // 비인증 사용자도 게시글 및 댓글을 볼 수 있음
    userId = null;
  }
  
  // 게시글 데이터 조회
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles (
        id,
        name,
        avatar_url
      )
    `)
    .eq("id", postId)
    .single();
  
  if (error || !post) {
    throw new Response("게시글을 찾을 수 없습니다.", {
      status: 404,
    });
  }
  
  // 댓글 데이터 조회
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select(`
      *,
      user:profiles (
        id,
        name,
        avatar_url
      ),
      likes_count:comment_likes(count)
    `)
    .eq("entity_type", "post")
    .eq("entity_id", postId)
    .order("created_at", { ascending: true });
  
  if (commentsError) {
    console.error("댓글 조회 중 오류 발생:", commentsError);
  }
  
  return json({
    post,
    comments: comments || [],
    currentUserId: userId,
  });
}

// ... render 함수 내용 수정
export default function PostDetailPage() {
  const { post, comments, currentUserId } = useLoaderData<typeof loader>();
  
  // 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: string) => {
    if (confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      const form = document.createElement("form");
      form.method = "post";
      form.action = `/comments/${commentId}/delete?returnTo=${encodeURIComponent(
        window.location.pathname
      )}`;
      document.body.appendChild(form);
      form.submit();
    }
  };
  
  return (
    <div className="container py-8">
      {/* ... 기존 게시글 상세 내용 ... */}
      
      <div className="mt-10">
        <CommentsList
          comments={comments}
          currentUserId={currentUserId}
          entityType="post"
          entityId={post.id}
          onDelete={handleDeleteComment}
        />
      </div>
    </div>
  );
}

// ... 기타 export 구문
!!!

위 예시처럼 `CommentsList` 컴포넌트는 `PostDetailPage` 컴포넌트 내부에 포함되어, 결과적으로 `RootLayout`이 제공하는 전체 페이지 레이아웃 안에서 댓글 섹션이 보이게 됩니다. 사용자가 댓글을 작성하거나 삭제할 때 사용되는 `CommentForm` 내부의 `<Form>` 태그는 백그라운드에서 `app/routes/comments.create.tsx` 또는 `app/routes/comments.$id.delete.tsx` 액션 라우트로 요청을 보내 처리합니다. 이 액션 라우트 자체는 `RootLayout`에 직접적으로 표시되지 않지만, 댓글 기능을 완성하는 중요한 부분입니다.

## 실행 및 테스트

게시글 작성, 구인/구직 등록, 팀 생성, 댓글 기능을 실행하고 테스트합니다:

!!!bash
# 환경 변수 확인
echo "SUPABASE_URL과 SUPABASE_ANON_KEY가 .env 파일에 설정되어 있는지 확인"

# 개발 서버 실행
npm run dev

# 브라우저에서 다음 URL로 접속하여 각 기능 테스트
# - 게시글 작성: http://localhost:3000/posts/new
# - 구인/구직 등록: http://localhost:3000/jobs/new
# - 팀 생성: http://localhost:3000/teams/new
# - 댓글 기능: 게시글 상세 페이지에서 테스트
!!!

## 다음 단계

비공개 페이지 구현 첫 번째 부분이 완료되었습니다! 다음 Day 23에서는 비공개 페이지 구현의 두 번째 부분으로 아이디어 클레임 기능, 리뷰 작성 기능, 대시보드 차트 데이터 연동을 진행합니다.