# Day 23: 비공개 페이지 구현 (2)

## 목표

인증된 사용자를 위한 비공개 기능을 추가로 구현합니다. 오늘은 아이디어 클레임 기능, 리뷰 작성 기능, 대시보드 차트 데이터 연동을 구현합니다.

## 작업 목록

1. 아이디어 클레임 기능 구현
2. 리뷰 작성 기능 구현
3. 대시보드 차트 데이터 연동

## 파일 생성 명령어

!!!bash
mkdir -p app/components/ideas app/components/reviews app/routes/api app/utils
touch app/components/ideas/IdeaClaimButton.tsx
touch app/routes/ideas.\$id.claim.tsx # Flat Routes: /ideas/:id/claim
touch app/components/reviews/ReviewForm.tsx
touch app/components/reviews/ReviewItem.tsx
touch app/components/reviews/ReviewsList.tsx
touch app/routes/reviews.create.tsx # Flat Routes: /reviews/create
touch app/routes/api.dashboard-data.ts # Flat Routes: /api/dashboard-data (데이터 API)
# 기존 아이디어 상세 페이지(app/routes/ideas.$id.tsx), 제품 상세 페이지(app/routes/products.$id.tsx), 대시보드 페이지(app/routes/dashboard.tsx) 등 관련 파일 수정 필요
!!!

## 필수 라이브러리 설치 (및 도구)

대시보드 차트 구현을 위해 차트 라이브러리가 필요할 수 있습니다. (예: Recharts)

!!!bash
# 필요시 차트 라이브러리 설치
# npm install recharts
!!!

## 1. 아이디어 클레임 기능 구현

### 아이디어 클레임 버튼 컴포넌트

`app/components/ideas/IdeaClaimButton.tsx` 파일을 생성하고 다음과 같이 구현합니다. 이 버튼은 아이디어 상세 페이지에서 사용됩니다.

!!!typescript
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Lightbulb, CheckCircle } from "lucide-react";

interface IdeaClaimButtonProps {
  ideaId: string;
  isClaimed: boolean;
  claimerUserId?: string | null;
  currentUserId?: string | null;
  isOwner: boolean; // 아이디어 소유자인지 여부
}

export function IdeaClaimButton({
  ideaId,
  isClaimed,
  claimerUserId,
  currentUserId,
  isOwner,
}: IdeaClaimButtonProps) {
  const canClaim = currentUserId && !isClaimed && !isOwner; // 로그인했고, 클레임되지 않았고, 소유자가 아닐 때 클레임 가능
  const isClaimer = currentUserId && isClaimed && currentUserId === claimerUserId; // 내가 클레임한 아이디어인지

  if (isOwner) {
    return <p className="text-sm text-muted-foreground">내 아이디어</p>;
  }

  if (isClaimed) {
    return (
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="font-medium">
          {isClaimer ? "내가 구현 중" : "다른 사용자가 구현 중"}
        </span>
        {/* Optionally, link to the claimer's profile */}
        {/* {claimerUserId && !isClaimer && <Link to={`/users/${claimerUserId}`}>구현자 보기</Link>} */}
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <Button variant="outline" disabled>
        <Lightbulb className="mr-2 h-4 w-4" />
        로그인 후 클레임 가능
      </Button>
    );
  }

  return (
    <Form method="post" action={`/ideas/${ideaId}/claim?returnTo=${encodeURIComponent(window.location.pathname)}`}>
      <Button type="submit" disabled={!canClaim}>
        <Lightbulb className="mr-2 h-4 w-4" />
        이 아이디어 구현하기 (클레임)
      </Button>
    </Form>
  );
}
!!!

### 아이디어 클레임 처리 라우트

`app/routes/ideas.$id.claim.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";

// GET 요청은 허용하지 않음
export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/"); // 또는 아이디어 목록 페이지로 리디렉션
}

// 아이디어 클레임 처리
export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const ideaId = params.id;

  if (!ideaId) {
    return json({ error: "아이디어 ID가 필요합니다." }, { status: 400 });
  }

  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") || `/ideas/${ideaId}`;

  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 아이디어 정보 조회 (클레임 가능 여부 및 소유자 확인)
    const { data: idea, error: fetchError } = await supabase
      .from("ideas")
      .select("claimed_by, author_id")
      .eq("id", ideaId)
      .single();

    if (fetchError || !idea) {
      return json({ error: "아이디어를 찾을 수 없습니다." }, { status: 404 });
    }

    // 이미 클레임된 경우 또는 자신이 생성한 아이디어인 경우
    if (idea.claimed_by || idea.author_id === userId) {
      return json({ error: "이 아이디어를 클레임할 수 없습니다." }, { status: 403 });
    }

    // 아이디어 클레임 업데이트
    const { error: updateError } = await supabase
      .from("ideas")
      .update({ claimed_by: userId, claimed_at: new Date().toISOString() })
      .eq("id", ideaId);

    if (updateError) {
      console.error("아이디어 클레임 중 오류 발생:", updateError);
      return json({ error: "아이디어를 클레임하는 중 오류가 발생했습니다." }, { status: 500 });
    }

    // 성공 시 원래 페이지로 리디렉션
    return redirect(returnTo);

  } catch (error) {
    console.error("아이디어 클레임 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
!!!

### 아이디어 상세 페이지 수정 (예시)

`app/routes/ideas.$id.tsx` 파일의 `loader` 함수와 컴포넌트를 수정하여 클레임 버튼을 추가하고 관련 데이터를 로드합니다.

!!!typescript
// app/routes/ideas.$id.tsx

// ... 기존 import 구문 ...
import { IdeaClaimButton } from "~/components/ideas/IdeaClaimButton";
import { requireUserIdOptional } from "~/utils/auth.server"; // Optional user ID

// ... loader 함수 수정 ...
export async function loader({ request, params }: LoaderFunctionArgs) {
  const ideaId = params.id;
  const currentUserId = await requireUserIdOptional(request); // 로그인하지 않은 사용자도 볼 수 있도록 optional 사용

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: idea, error } = await supabase
    .from("ideas")
    .select(`
      *,
      author:profiles (id, name, avatar_url),
      claimed_user:profiles!claimed_by (id, name) 
    `)
    .eq("id", ideaId)
    .single();

  if (error || !idea) {
    throw new Response("아이디어를 찾을 수 없습니다.", { status: 404 });
  }

  return json({ idea, currentUserId });
}

// ... 컴포넌트 수정 ...
export default function IdeaDetailPage() {
  const { idea, currentUserId } = useLoaderData<typeof loader>();

  return (
    <div className="container py-8">
      {/* ... 기존 아이디어 상세 내용 ... */}
      
      <div className="mt-6">
        <IdeaClaimButton
          ideaId={idea.id}
          isClaimed={!!idea.claimed_by}
          claimerUserId={idea.claimed_by}
          currentUserId={currentUserId}
          isOwner={currentUserId === idea.author_id}
        />
      </div>

      {/* 아이디어를 기반으로 생성된 제품 목록 등 추가 콘텐츠 */}
    </div>
  );
}
!!!

## 2. 리뷰 작성 기능 구현

리뷰 기능은 주로 제품 상세 페이지(`app/routes/products.$id.tsx`) 등에 통합됩니다. 댓글 기능과 유사하게 구현합니다.

### 리뷰 폼 컴포넌트

`app/components/reviews/ReviewForm.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import { useRef, useState } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Star } from "lucide-react";

interface ReviewFormProps {
  entityType: "product" | "service"; // 리뷰 대상 타입
  entityId: string;
  error?: string;
  onCancel?: () => void;
  defaultRating?: number;
  defaultContent?: string;
}

export function ReviewForm({
  entityType,
  entityId,
  error,
  onCancel,
  defaultRating = 0,
  defaultContent = "",
}: ReviewFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  const [rating, setRating] = useState(defaultRating);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="w-full mb-6 border p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">리뷰 작성</h3>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <Form
        ref={formRef}
        method="post"
        action={`/reviews/create?returnTo=${encodeURIComponent(window.location.pathname)}`}
        className="space-y-4"
      >
        <input type="hidden" name="entityType" value={entityType} />
        <input type="hidden" name="entityId" value={entityId} />
        
        <div className="space-y-2">
           <Label>평점</Label>
           <div className="flex items-center space-x-1">
             {[1, 2, 3, 4, 5].map((star) => (
               <button
                 key={star}
                 type="button"
                 onMouseEnter={() => setHoverRating(star)}
                 onMouseLeave={() => setHoverRating(0)}
                 onClick={() => setRating(star)}
                 className="p-1 text-muted-foreground focus:outline-none"
                 aria-label={`평점 ${star}점`}
               >
                 <Star 
                   className={`h-6 w-6 transition-colors ${
                     (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : ''
                   }`} 
                 />
               </button>
             ))}
           </div>
           <input type="hidden" name="rating" value={rating} />
           {rating === 0 && <p className="text-xs text-red-500">평점을 선택해주세요.</p>}
         </div>

        <div className="space-y-2">
          <Label htmlFor="content">리뷰 내용</Label>
          <Textarea
            id="content"
            name="content"
            rows={4}
            required
            defaultValue={defaultContent}
            placeholder="제품/서비스에 대한 리뷰를 작성해주세요."
            className="w-full resize-none"
          />
        </div>
        
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
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "저장 중..." : "리뷰 등록"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
!!!

### 리뷰 아이템 컴포넌트

`app/components/reviews/ReviewItem.tsx` 파일을 생성합니다 (댓글의 `CommentItem`과 유사하게 구현).

!!!typescript
// app/components/reviews/ReviewItem.tsx
// CommentItem과 유사하게 작성: 사용자 정보, 평점(별), 내용, 작성일, 수정/삭제 버튼 등 포함
// (구현 생략 - 필요시 CommentItem 참고하여 작성)
import { Link } from "@remix-run/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Star, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface ReviewItemProps {
  review: {
    id: string;
    rating: number;
    content: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  };
  currentUserId?: string;
  onDelete?: (id: string) => void;
}

export function ReviewItem({ review, currentUserId, onDelete }: ReviewItemProps) {
  const isAuthor = currentUserId === review.user.id;

  return (
    <div className="flex space-x-4 py-4 border-b last:border-b-0">
      <Avatar className="h-10 w-10">
        <AvatarImage src={review.user.avatar_url} alt={review.user.name} />
        <AvatarFallback>{review.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <Link to={`/users/${review.user.id}`} className="font-semibold hover:underline">
              {review.user.name}
            </Link>
            <span className="text-muted-foreground text-sm ml-2">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ko })}
            </span>
          </div>
          {isAuthor && (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                   <MoreHorizontal className="h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem disabled> {/* 수정 기능은 추후 구현 */}
                   <Pencil className="mr-2 h-4 w-4" />
                   <span>수정하기</span>
                 </DropdownMenuItem>
                 <DropdownMenuItem
                   className="text-red-600"
                   onClick={() => onDelete && onDelete(review.id)}
                 >
                   <Trash2 className="mr-2 h-4 w-4" />
                   <span>삭제하기</span>
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          )}
        </div>
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
            />
          ))}
        </div>
        <p className="text-muted-foreground">{review.content}</p>
      </div>
    </div>
  );
}

!!!

### 리뷰 목록 컴포넌트

`app/components/reviews/ReviewsList.tsx` 파일을 생성합니다 (댓글의 `CommentsList`와 유사하게 구현).

!!!typescript
// app/components/reviews/ReviewsList.tsx
// CommentsList와 유사하게 작성: 리뷰 목록 및 리뷰 작성 폼 포함
// (구현 생략 - 필요시 CommentsList 참고하여 작성)
import { ReviewItem } from "./ReviewItem";
import { ReviewForm } from "./ReviewForm";

interface ReviewsListProps {
  reviews: Array<{
    id: string;
    rating: number;
    content: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  }>;
  entityType: "product" | "service";
  entityId: string;
  currentUserId?: string;
  canReview: boolean; // 현재 사용자가 리뷰를 작성할 수 있는지 여부
  onDelete?: (id: string) => void;
}

export function ReviewsList({
  reviews,
  entityType,
  entityId,
  currentUserId,
  canReview,
  onDelete,
}: ReviewsListProps) {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">리뷰 ({reviews.length})</h2>
      
      {canReview && (
        <ReviewForm entityType={entityType} entityId={entityId} />
      )}
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem 
              key={review.id} 
              review={review} 
              currentUserId={currentUserId}
              onDelete={onDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
        </div>
      )}
    </div>
  );
}
!!!

### 리뷰 생성 라우트

`app/routes/reviews.create.tsx` 파일을 생성하고 다음과 같이 구현합니다:

!!!typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const ReviewSchema = z.object({
  entityType: z.enum(["product", "service"]),
  entityId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().min(5, "리뷰는 5자 이상 입력해주세요.").max(1000),
});

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") || "/";
  const formData = await request.formData();

  const result = ReviewSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    console.error("리뷰 데이터 유효성 검사 실패:", result.error.flatten());
    // TODO: 사용자에게 에러 메시지 전달 (예: session flash)
    return json({ error: "입력 값을 확인해주세요.", fieldErrors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { entityType, entityId, rating, content } = result.data;

  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // TODO: 이미 리뷰를 작성했는지 확인하는 로직 추가 (선택 사항)
    // const { count, error: existingError } = await supabase
    //   .from('reviews')
    //   .select('*', { count: 'exact', head: true })
    //   .eq('entity_type', entityType)
    //   .eq('entity_id', entityId)
    //   .eq('user_id', userId);
    // if (existingError) throw existingError;
    // if (count && count > 0) return json({ error: '이미 리뷰를 작성했습니다.' }, { status: 409 });

    const { error: insertError } = await supabase
      .from("reviews")
      .insert([
        {
          entity_type: entityType,
          entity_id: entityId,
          user_id: userId,
          rating,
          content,
        },
      ]);

    if (insertError) {
      console.error("리뷰 저장 중 오류 발생:", insertError);
      return json({ error: "리뷰를 저장하는 중 오류가 발생했습니다." }, { status: 500 });
    }

    return redirect(returnTo);

  } catch (error) {
    console.error("리뷰 저장 중 예외 발생:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
!!!

### 제품 상세 페이지에 리뷰 목록 추가 (예시)

`app/routes/products.$id.tsx` 파일을 수정하여 리뷰 컴포넌트를 통합합니다.

!!!typescript
// app/routes/products.$id.tsx

// ... 기존 import 구문 ...
import { ReviewsList } from "~/components/reviews/ReviewsList";

// ... loader 함수 수정 (리뷰 데이터 로드 및 리뷰 작성 가능 여부 확인) ...
export async function loader({ request, params }: LoaderFunctionArgs) {
  const productId = params.id;
  const currentUserId = await requireUserIdOptional(request); // 비로그인 사용자도 조회 가능

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 제품 정보 조회
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*, author:profiles(id, name)") // 필요한 필드 선택
    .eq("id", productId)
    .single();
  
  if (productError || !product) {
    throw new Response("제품을 찾을 수 없습니다.", { status: 404 });
  }

  // 리뷰 정보 조회
  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("*, user:profiles(id, name, avatar_url)")
    .eq("entity_type", "product")
    .eq("entity_id", productId)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    console.error("리뷰 조회 오류:", reviewsError);
  }

  // 현재 사용자가 리뷰를 작성할 수 있는지 확인 (예: 제품 구매자 또는 작성자 제외)
  let canReview = false;
  if (currentUserId && currentUserId !== product.author_id) {
    // 이미 리뷰를 작성했는지 확인
    const existingReview = reviews?.find(r => r.user_id === currentUserId);
    if (!existingReview) {
       // TODO: 실제 구매 여부 확인 로직 추가 (예: 'product_purchases' 테이블 확인)
       canReview = true; // 임시로 작성 가능하게 설정
    }
  }

  return json({
    product,
    reviews: reviews || [],
    currentUserId,
    canReview,
  });
}


// ... 컴포넌트 수정 ...
export default function ProductDetailPage() {
  const { product, reviews, currentUserId, canReview } = useLoaderData<typeof loader>();

  const handleDeleteReview = async (reviewId: string) => {
     if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) return;
     // TODO: 리뷰 삭제 액션 호출 (예: fetch 사용 또는 Remix Form 사용)
     console.log(`리뷰 삭제 요청: ${reviewId}`);
     // 예시:
     // const response = await fetch(`/reviews/${reviewId}/delete`, { method: 'POST' });
     // if (response.ok) { window.location.reload(); } else { alert('삭제 실패'); }
  };

  return (
    <div className="container py-8">
      {/* ... 기존 제품 상세 내용 ... */}
      
      <ReviewsList
        reviews={reviews}
        entityType="product"
        entityId={product.id}
        currentUserId={currentUserId}
        canReview={canReview}
        onDelete={handleDeleteReview} // 삭제 핸들러 전달
      />
    </div>
  );
}
!!!

## 3. 대시보드 차트 데이터 연동

대시보드 페이지에서 사용될 차트 데이터를 제공하는 API 라우트를 만들고, 대시보드 페이지에서 이를 호출하여 차트를 렌더링합니다.

### 대시보드 데이터 API 라우트

`app/routes/api.dashboard-data.ts` 파일을 생성하고 다음과 같이 구현합니다. ( `.ts` 확장자 사용 가능)

!!!typescript
// app/routes/api.dashboard-data.ts
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request); // 인증된 사용자만 접근 가능

  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 예시: 사용자가 작성한 게시글 수 (최근 7일)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentPostsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId)
        .gte('created_at', sevenDaysAgo);

    // 예시: 사용자가 받은 댓글 수 (월별)
    // TODO: 더 복잡한 집계 쿼리 필요 (예: PostgreSQL 함수 사용)
    // const { data: monthlyComments, error: commentsError } = await supabase.rpc(...)

    // 예시: 사용자가 등록한 제품의 총 조회수
    // TODO: 'product_views' 테이블 또는 유사한 집계 테이블 필요
    // const { data: totalViews, error: viewsError } = await supabase.rpc(...)

    if (postsError) throw postsError;
    // if (commentsError) throw commentsError;
    // if (viewsError) throw viewsError;

    // 실제 데이터 구조는 차트 라이브러리 요구사항에 맞게 조정
    const chartData = {
      recentActivity: [
        { name: '최근 7일 게시글', value: recentPostsCount ?? 0 },
        // { name: '이번 달 댓글', value: 15 }, // 예시 데이터
        // { name: '총 제품 조회수', value: 1234 }, // 예시 데이터
      ],
      // 다른 차트 데이터 추가
    };

    return json(chartData);

  } catch (error) {
    console.error("대시보드 데이터 로드 중 오류 발생:", error);
    return json({ error: "데이터를 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
!!!

### 대시보드 페이지 수정 (차트 연동 예시)

`app/routes/dashboard.tsx` 파일을 수정하여 위 API에서 데이터를 가져와 차트를 렌더링합니다. 여기서는 `Recharts` 라이브러리를 사용한다고 가정합니다.

!!!typescript
// app/routes/dashboard.tsx

import { useEffect, useState } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Recharts 임포트
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export const meta: MetaFunction = () => {
  return [{ title: "대시보드 - YkMake" }];
};

// 페이지 로드 시 기본 데이터 (선택 사항)
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  // 필요시 초기 데이터 로드 (예: 사용자 프로필 정보)
  return json({ initialData: null });
}


export default function DashboardPage() {
  const fetcher = useFetcher<any>(); // 타입은 API 응답에 맞게 지정
  const [chartData, setChartData] = useState<any>(null); // 타입 지정

  useEffect(() => {
    // 클라이언트 측에서 데이터 로드 시작
    if (fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load('/api/dashboard-data');
    }
  }, [fetcher]);

  useEffect(() => {
    // fetcher가 데이터를 로드하면 상태 업데이트
    if (fetcher.data) {
      setChartData(fetcher.data);
    }
  }, [fetcher.data]);

  // 로딩 상태 표시
  if (fetcher.state === 'loading' || !chartData) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">대시보드</h1>
        <p>데이터 로딩 중...</p>
      </div>
    );
  }

  // 오류 상태 표시
  if (chartData.error) {
     return (
       <div className="container py-8">
         <h1 className="text-3xl font-bold mb-6">대시보드</h1>
         <p className="text-red-500">데이터 로드 오류: {chartData.error}</p>
       </div>
     );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {/* Recharts 등 차트 라이브러리를 사용하여 chartData.recentActivity 렌더링 */}
            {/* 
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer> 
            */}
             <pre>{JSON.stringify(chartData.recentActivity, null, 2)}</pre> {/* 임시 데이터 표시 */}
          </CardContent>
        </Card>
        
        {/* 다른 차트 카드 추가 */}
        <Card>
          <CardHeader>
            <CardTitle>월별 댓글</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             {/* 월별 댓글 데이터 차트 */}
             <p className="text-muted-foreground">월별 댓글 차트가 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

!!!

## 실행 및 테스트

아이디어 클레임, 리뷰 작성, 대시보드 기능을 실행하고 테스트합니다:

!!!bash
# 개발 서버 실행
npm run dev

# 브라우저에서 다음 URL로 접속하여 각 기능 테스트
# - 아이디어 클레임: 아이디어 상세 페이지 (예: /ideas/some-idea-id) 에서 '구현하기' 버튼 클릭
# - 리뷰 작성: 제품 상세 페이지 (예: /products/some-product-id) 에서 리뷰 작성 폼 사용
# - 대시보드: /dashboard 페이지 접속하여 차트 데이터 확인
!!!

## 다음 단계

비공개 페이지 구현 두 번째 부분이 완료되었습니다! Day 24에서는 사용자 프로필 페이지, 팀 관리 페이지, 관리자 페이지 기능을 구현합니다.
