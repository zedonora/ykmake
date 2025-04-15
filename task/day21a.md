# Day 21a: 보안 및 접근 제어

## 목표

Supabase의 Row Level Security(RLS)와 보안 정책을 설정하고, 사용자 권한 관리 시스템을 구현합니다. 또한 보안 테스트를 수행하여 시스템의 안전성을 검증합니다.

## 작업 목록

1. Row Level Security 설정
2. 테이블별 보안 정책 구현
3. 사용자 권한 관리 시스템 구현
4. 보안 테스트 및 검증

## 1. Row Level Security 설정

### Supabase의 RLS 이해하기

Supabase는 PostgreSQL의 Row Level Security 기능을 활용하여 데이터에 대한 접근을 제어합니다. RLS를 활성화하면 기본적으로 모든 작업이 차단되며, 명시적인 정책(Policy)을 통해 허용된 작업만 수행할 수 있습니다.

!!!bash
# Supabase 프로젝트의 Studio에 접속하여 RLS 활성화
# 아래 명령어는 Supabase CLI를 사용할 경우 (로컬 개발 환경)
npx supabase start # 로컬 Supabase 서버 시작
npx supabase studio # 로컬 Supabase Studio 열기
!!!

각 테이블에 대해 RLS를 활성화하려면 Supabase Studio의 Table Editor 또는 SQL Editor에서 설정할 수 있습니다:

!!!sql
-- RLS 활성화
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ideas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "idea_purchases" ENABLE ROW LEVEL SECURITY;
!!!

## 2. 테이블별 보안 정책 구현

### Profiles 테이블 정책

프로필 테이블은 사용자 본인만 수정할 수 있고, 모든 사용자가 조회할 수 있도록 설정합니다:

!!!sql
-- 프로필 조회 정책 (모든 사용자)
CREATE POLICY "profiles_select_policy" ON "profiles"
FOR SELECT USING (true);

-- 프로필 수정 정책 (본인만)
CREATE POLICY "profiles_update_policy" ON "profiles"
FOR UPDATE USING (auth.uid() = id);

-- 프로필 삭제 정책 (본인만)
CREATE POLICY "profiles_delete_policy" ON "profiles"
FOR DELETE USING (auth.uid() = id);

-- 프로필 생성 정책 (인증된 사용자만)
CREATE POLICY "profiles_insert_policy" ON "profiles"
FOR INSERT WITH CHECK (auth.uid() = id);
!!!

### Products 테이블 정책

제품은 모든 사용자가 조회할 수 있고, 작성자만 수정/삭제할 수 있습니다:

!!!sql
-- 제품 조회 정책 (모든 사용자)
CREATE POLICY "products_select_policy" ON "products"
FOR SELECT USING (true);

-- 제품 수정 정책 (작성자만)
CREATE POLICY "products_update_policy" ON "products"
FOR UPDATE USING (auth.uid() = author_id);

-- 제품 삭제 정책 (작성자와 관리자만)
CREATE POLICY "products_delete_policy" ON "products"
FOR DELETE USING (
  auth.uid() = author_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 제품 생성 정책 (인증된 사용자만)
CREATE POLICY "products_insert_policy" ON "products"
FOR INSERT WITH CHECK (auth.uid() = author_id);
!!!

### Posts 테이블 정책

게시글은 모든 사용자가 조회할 수 있고, 작성자만 수정/삭제할 수 있습니다:

!!!sql
-- 게시글 조회 정책 (모든 사용자)
CREATE POLICY "posts_select_policy" ON "posts"
FOR SELECT USING (true);

-- 게시글 수정 정책 (작성자만)
CREATE POLICY "posts_update_policy" ON "posts"
FOR UPDATE USING (auth.uid() = author_id);

-- 게시글 삭제 정책 (작성자와 관리자만)
CREATE POLICY "posts_delete_policy" ON "posts"
FOR DELETE USING (
  auth.uid() = author_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 게시글 생성 정책 (인증된 사용자만)
CREATE POLICY "posts_insert_policy" ON "posts"
FOR INSERT WITH CHECK (auth.uid() = author_id);
!!!

### Teams 및 Team Members 테이블 정책

팀 정보는 모든 사용자가 조회할 수 있고, 팀 관리자만 수정할 수 있습니다:

!!!sql
-- 팀 조회 정책 (모든 사용자)
CREATE POLICY "teams_select_policy" ON "teams"
FOR SELECT USING (true);

-- 팀 수정 정책 (팀 관리자만)
CREATE POLICY "teams_update_policy" ON "teams"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- 팀 삭제 정책 (팀 관리자만)
CREATE POLICY "teams_delete_policy" ON "teams"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- 팀 생성 정책 (인증된 사용자만)
CREATE POLICY "teams_insert_policy" ON "teams"
FOR INSERT WITH CHECK (true);

-- 팀원 정보 조회 정책 (모든 사용자)
CREATE POLICY "team_members_select_policy" ON "team_members"
FOR SELECT USING (true);

-- 팀원 추가 정책 (팀 관리자만)
CREATE POLICY "team_members_insert_policy" ON "team_members"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = NEW.team_id AND user_id = auth.uid() AND role = 'admin'
  ) OR NEW.role != 'admin' -- 최초 생성자는 admin으로 추가 허용
);

-- 팀원 제거 정책 (팀 관리자와 본인만)
CREATE POLICY "team_members_delete_policy" ON "team_members"
FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = team_id AND user_id = auth.uid() AND role = 'admin'
  )
);
!!!

### 메시지 및 대화 테이블 정책

메시지는 대화 참여자만 조회/작성할 수 있습니다:

!!!sql
-- 대화방 조회 정책 (참여자만)
CREATE POLICY "conversations_select_policy" ON "conversations"
FOR SELECT USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- 대화방 생성 정책 (인증된 사용자만)
CREATE POLICY "conversations_insert_policy" ON "conversations"
FOR INSERT WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- 메시지 조회 정책 (대화 참여자만)
CREATE POLICY "messages_select_policy" ON "messages"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- 메시지 생성 정책 (대화 참여자만)
CREATE POLICY "messages_insert_policy" ON "messages"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  ) AND sender_id = auth.uid()
);
!!!

### IdeasGPT 관련 테이블 정책

아이디어는 모든 사용자가 조회할 수 있고, 구매자만 상세 내용을 볼 수 있습니다:

!!!sql
-- 아이디어 조회 정책 (모든 사용자, 하지만 구매자만 전체 내용 조회)
CREATE POLICY "ideas_select_policy" ON "ideas"
FOR SELECT USING (true);

-- 아이디어 구매 정보 조회 정책 (관련 사용자만)
CREATE POLICY "idea_purchases_select_policy" ON "idea_purchases"
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM ideas WHERE id = idea_id AND creator_id = auth.uid()
  )
);

-- 아이디어 구매 정책 (인증된 사용자만)
CREATE POLICY "idea_purchases_insert_policy" ON "idea_purchases"
FOR INSERT WITH CHECK (auth.uid() = user_id);
!!!

## 3. 사용자 권한 관리 시스템 구현

### 권한 정의 및 관리 함수

사용자 권한을 정의하고 관리하는 함수를 `app/utils/auth.server.ts` 파일에 구현합니다:

!!!typescript
// app/utils/auth.server.ts
import { createClient } from '@supabase/supabase-js';
import { json, redirect } from '@remix-run/node';
import { getSession } from '~/utils/session.server';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 사용자 권한 열거형
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

// 인증된 사용자 확인 (기본 인증)
export async function requireUserId(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  
  if (!userId) {
    throw json({ message: "인증이 필요합니다" }, { status: 401 });
  }
  
  return userId;
}

// 사용자 객체 얻기
export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    throw json({ message: "사용자를 찾을 수 없습니다" }, { status: 404 });
  }
  
  return user;
}

// 관리자 권한 확인
export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  
  if (user.role !== UserRole.ADMIN) {
    throw json({ message: "관리자 권한이 필요합니다" }, { status: 403 });
  }
  
  return user;
}

// 모더레이터 권한 확인
export async function requireModerator(request: Request) {
  const user = await requireUser(request);
  
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
    throw json({ message: "모더레이터 권한이 필요합니다" }, { status: 403 });
  }
  
  return user;
}

// 리소스 소유자 확인 (작성자 인증)
export async function requireResourceOwner(request: Request, resourceTable: string, resourceId: string) {
  const userId = await requireUserId(request);
  
  const { data, error } = await supabase
    .from(resourceTable)
    .select('author_id, creator_id, user_id')
    .eq('id', resourceId)
    .single();
  
  if (error || !data) {
    throw json({ message: "리소스를 찾을 수 없습니다" }, { status: 404 });
  }
  
  // 여러 테이블에서 사용되는 다양한 소유자 컬럼명 처리
  const ownerId = data.author_id || data.creator_id || data.user_id;
  
  if (ownerId !== userId) {
    // 관리자인지 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (!profile || profile.role !== UserRole.ADMIN) {
      throw json({ message: "해당 리소스에 대한 권한이 없습니다" }, { status: 403 });
    }
  }
  
  return true;
}
!!!

### 권한 기반 UI 컴포넌트

권한에 따라 UI 요소를 조건부로 렌더링하는 컴포넌트를 `app/components/auth/RoleBasedUI.tsx` 파일에 구현합니다:

!!!typescript
// app/components/auth/RoleBasedUI.tsx
import { useOutletContext } from '@remix-run/react';
import type { ReactNode } from 'react';
import { UserRole } from '~/utils/auth.server';

type AuthContextType = {
  user: {
    id: string;
    role: UserRole;
  } | null;
};

interface RoleBasedProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  ownerId?: string;
  fallback?: ReactNode;
}

export function RoleGuard({ 
  children, 
  allowedRoles = [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN], 
  ownerId,
  fallback = null 
}: RoleBasedProps) {
  const { user } = useOutletContext<AuthContextType>();
  
  if (!user) {
    return fallback;
  }
  
  // 리소스 소유자인 경우 접근 허용
  if (ownerId && user.id === ownerId) {
    return <>{children}</>;
  }
  
  // 허용된 역할이 있는지 확인
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }
  
  return fallback;
}

// 관리자만 볼 수 있는 컴포넌트
export function AdminOnly({ children, fallback = null }: Omit<RoleBasedProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// 모더레이터 이상만 볼 수 있는 컴포넌트
export function ModeratorOnly({ children, fallback = null }: Omit<RoleBasedProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={[UserRole.MODERATOR, UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// 인증된 사용자만 볼 수 있는 컴포넌트
export function AuthenticatedOnly({ children, fallback = null }: Omit<RoleBasedProps, 'allowedRoles'>) {
  const { user } = useOutletContext<AuthContextType>();
  
  if (!user) {
    return fallback;
  }
  
  return <>{children}</>;
}

// 리소스 소유자나 특정 권한자만 볼 수 있는 컴포넌트
export function OwnerOrRole({ 
  children, 
  ownerId,
  allowedRoles = [UserRole.MODERATOR, UserRole.ADMIN],
  fallback = null 
}: RoleBasedProps) {
  return (
    <RoleGuard allowedRoles={allowedRoles} ownerId={ownerId} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
!!!

## 4. 보안 테스트 및 검증

### API 접근 제어 테스트 파일

API 접근 제어를 테스트하는 스크립트를 `tests/security/api-access.test.ts` 파일에 구현합니다:

!!!typescript
// tests/security/api-access.test.ts
import { test, expect } from '@playwright/test';

// 테스트 사용자 정보
const testUser = {
  email: 'testuser@example.com',
  password: 'securepassword123'
};

const adminUser = {
  email: 'admin@example.com',
  password: 'adminpassword123'
};

test.describe('API 접근 제어 테스트', () => {
  // 각 테스트 전에 로그인
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });
  
  test('인증되지 않은 사용자는 protected API에 접근할 수 없음', async ({ page }) => {
    // 로그인하지 않은 상태에서 보호된 API 접근 시도
    const response = await page.request.get('/api/profile');
    expect(response.status()).toBe(401);
  });
  
  test('일반 사용자는 관리자 리소스에 접근할 수 없음', async ({ page }) => {
    // 일반 사용자로 로그인
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 관리자 API 접근 시도
    const response = await page.request.get('/api/admin/users');
    expect(response.status()).toBe(403);
  });
  
  test('사용자는 자신의 리소스만 수정할 수 있음', async ({ page }) => {
    // 일반 사용자로 로그인
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 다른 사용자의 프로필 수정 시도
    const response = await page.request.put('/api/profile/other-user-id', {
      data: { name: 'Hacked Name' }
    });
    expect(response.status()).toBe(403);
  });
  
  test('관리자는 모든 리소스에 접근할 수 있음', async ({ page }) => {
    // 관리자로 로그인
    await page.fill('input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 관리자 API 접근
    const response = await page.request.get('/api/admin/users');
    expect(response.status()).toBe(200);
    
    // 다른 사용자의 프로필 수정
    const updateResponse = await page.request.put('/api/profile/test-user-id', {
      data: { name: 'Updated By Admin' }
    });
    expect(updateResponse.status()).toBe(200);
  });
});
!!!

### SQL 인젝션 테스트

SQL 인젝션 취약점을 테스트하는 스크립트를 `tests/security/sql-injection.test.ts` 파일에 구현합니다:

!!!typescript
// tests/security/sql-injection.test.ts
import { test, expect } from '@playwright/test';

test.describe('SQL 인젝션 방어 테스트', () => {
  test('제품 검색은 SQL 인젝션을 방어해야 함', async ({ page }) => {
    // SQL 인젝션 시도
    const maliciousQuery = "' OR 1=1; --";
    await page.goto(`/products?search=${encodeURIComponent(maliciousQuery)}`);
    
    // 정상적인 검색 결과 페이지가 로드되어야 함 (인젝션 실패)
    await expect(page).toHaveTitle(/제품 검색/);
    
    // 모든 제품이 표시되지 않아야 함 (인젝션 실패)
    const productCount = await page.locator('.product-card').count();
    const totalProductCount = await page.locator('.total-products').textContent();
    
    // 총 제품 수가 검색 결과와 일치하지 않아야 함 (인젝션이 성공했다면 모든 제품이 표시됨)
    expect(productCount).toBeLessThan(parseInt(totalProductCount || '0'));
  });
  
  test('사용자 프로필 조회는 SQL 인젝션을 방어해야 함', async ({ page }) => {
    // SQL 인젝션 시도
    const maliciousId = "1' OR '1'='1";
    
    // API 요청 직접 테스트
    const response = await page.request.get(`/api/profile/${maliciousId}`);
    
    // 인젝션이 실패하여 404 또는 400 에러가 반환되어야 함
    expect(response.status()).toBeOneOf([404, 400]);
  });
});
!!!

### XSS 방어 테스트

XSS(Cross-Site Scripting) 취약점을 테스트하는 스크립트를 `tests/security/xss.test.ts` 파일에 구현합니다:

!!!typescript
// tests/security/xss.test.ts
import { test, expect } from '@playwright/test';

// 테스트 사용자 정보
const testUser = {
  email: 'testuser@example.com',
  password: 'securepassword123'
};

test.describe('XSS 방어 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('댓글 입력 필드는 XSS 공격을 방어해야 함', async ({ page }) => {
    // 게시글 페이지로 이동
    await page.goto('/posts/1');
    
    // XSS 스크립트를 포함한 댓글 작성
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('textarea[name="comment"]', xssPayload);
    await page.click('button[type="submit"]');
    
    // 페이지가 다시 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    
    // 댓글이 추가되었는지 확인
    await expect(page.locator('.comments-list')).toContainText(xssPayload);
    
    // 스크립트가 실행되지 않고 텍스트로 표시되었는지 확인
    const alertShown = await page.evaluate(() => {
      return window.alertShown || false;
    });
    
    expect(alertShown).toBe(false);
    
    // 스크립트 태그가 이스케이프되어 표시되는지 확인
    const commentHTML = await page.locator('.comments-list .comment:last-child').innerHTML();
    expect(commentHTML).toContain('&lt;script&gt;');
  });
  
  test('제품 설명 필드는 XSS 공격을 방어해야 함', async ({ page }) => {
    // 제품 등록 페이지로 이동
    await page.goto('/products/new');
    
    // XSS 스크립트를 포함한 제품 설명 입력
    const xssPayload = '<img src="x" onerror="alert(\'XSS\')">';
    await page.fill('input[name="title"]', 'Test Product');
    await page.fill('textarea[name="description"]', xssPayload);
    await page.selectOption('select[name="category"]', 'Web App');
    await page.click('button[type="submit"]');
    
    // 제품 상세 페이지로 리디렉션될 때까지 대기
    await page.waitForURL(/\/products\/[\w-]+/);
    
    // 스크립트가 실행되지 않고 안전하게 렌더링되는지 확인
    const alertShown = await page.evaluate(() => {
      return window.alertShown || false;
    });
    
    expect(alertShown).toBe(false);
    
    // 이미지 태그가 이스케이프되어 표시되는지 확인
    const descriptionHTML = await page.locator('.product-description').innerHTML();
    expect(descriptionHTML).toContain('&lt;img');
  });
});
!!!

### 보안 스캔 스크립트

정기적인 보안 스캔을 위한 스크립트를 `scripts/security-scan.sh` 파일에 구현합니다:

!!!bash
#!/bin/bash
# 보안 스캔 스크립트

# 출력 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}YkMake 보안 스캔 시작${NC}"
echo "========================================"

# 1. 의존성 취약점 스캔
echo -e "${YELLOW}1. 의존성 취약점 스캔${NC}"
npm audit
if [ $? -eq 0 ]; then
  echo -e "${GREEN}의존성 취약점 스캔 완료 - 문제 없음${NC}"
else
  echo -e "${RED}의존성 취약점 발견! npm audit fix 실행 필요${NC}"
fi
echo "----------------------------------------"

# 2. 환경 변수 확인
echo -e "${YELLOW}2. 환경 변수 확인${NC}"
if [ -f .env ]; then
  # 필수 환경 변수 확인
  required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SESSION_SECRET")
  missing_vars=0
  
  for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
      echo -e "${RED}[오류] ${var} 환경 변수가 설정되지 않았습니다${NC}"
      missing_vars=1
    fi
  done
  
  # 환경 변수 길이 확인 (보안 키가 충분히 강력한지)
  if grep -q "^SESSION_SECRET=" .env; then
    secret_length=$(grep "^SESSION_SECRET=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'" | wc -c)
    if [ $secret_length -lt 32 ]; then
      echo -e "${RED}[오류] SESSION_SECRET이 너무 짧습니다 (32자 이상 권장)${NC}"
    fi
  fi
  
  if [ $missing_vars -eq 0 ]; then
    echo -e "${GREEN}환경 변수 확인 완료 - 필수 변수 모두 설정됨${NC}"
  fi
else
  echo -e "${RED}[오류] .env 파일이 없습니다${NC}"
fi
echo "----------------------------------------"

# 3. 리버스 프록시 설정 확인
echo -e "${YELLOW}3. 리버스 프록시 설정 확인${NC}"
if [ -f nginx/nginx.conf ]; then
  # HTTP 헤더 확인
  if grep -q "X-Content-Type-Options" nginx/nginx.conf && \
     grep -q "X-Frame-Options" nginx/nginx.conf && \
     grep -q "X-XSS-Protection" nginx/nginx.conf; then
    echo -e "${GREEN}보안 HTTP 헤더 설정 확인됨${NC}"
  else
    echo -e "${RED}[경고] 일부 보안 HTTP 헤더가 설정되지 않았습니다${NC}"
  fi
  
  # HTTPS 리디렉션 확인
  if grep -q "return 301 https" nginx/nginx.conf; then
    echo -e "${GREEN}HTTPS 리디렉션 설정 확인됨${NC}"
  else
    echo -e "${RED}[경고] HTTP에서 HTTPS로의 리디렉션이 설정되지 않았습니다${NC}"
  fi
else
  echo -e "${YELLOW}[정보] nginx 설정 파일이 없습니다${NC}"
fi
echo "----------------------------------------"

# 4. 권한 및 권한 테스트 실행
echo -e "${YELLOW}4. 보안 테스트 실행${NC}"
if [ -d tests/security ]; then
  echo "보안 테스트 실행 중..."
  npx playwright test tests/security
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}보안 테스트 통과${NC}"
  else
    echo -e "${RED}보안 테스트 실패! 로그를 확인하세요${NC}"
  fi
else
  echo -e "${YELLOW}[정보] 보안 테스트 디렉토리가 없습니다${NC}"
fi
echo "----------------------------------------"

# 5. 요약 및 제안
echo -e "${YELLOW}보안 스캔 요약${NC}"
echo "========================================"
echo "일일 보안 스캔 완료. 중요한 보안 문제가 발견되면 즉시 수정하세요."
echo "정기적으로 다음 작업을 수행하는 것이 좋습니다:"
echo "- npm 의존성 업데이트 (npm update)"
echo "- Supabase 프로젝트 설정 확인"
echo "- SSL 인증서 유효 기간 확인"
echo "- 로그 파일 검토"
echo "========================================"
!!!

## 실행 및 테스트

보안 설정을 실행하고 테스트합니다:

!!!bash
# RLS 설정 및 정책 적용
npx supabase db diff -f rls-policies # 변경 사항 확인
npx supabase db push # 변경 사항 적용

# 권한 관리 함수 추가
# app/utils/auth.server.ts 파일 생성됨
# app/components/auth/RoleBasedUI.tsx 파일 생성됨

# 보안 테스트 디렉토리 생성
mkdir -p tests/security
# tests/security/api-access.test.ts 파일 생성됨
# tests/security/sql-injection.test.ts 파일 생성됨
# tests/security/xss.test.ts 파일 생성됨

# 보안 스캔 스크립트 생성
mkdir -p scripts
touch scripts/security-scan.sh
chmod +x scripts/security-scan.sh
# scripts/security-scan.sh 파일에 내용 추가됨

# 보안 테스트 실행
npx playwright test tests/security
!!!

## 다음 단계

보안 및 접근 제어를 설정했습니다! 이제 비공개 페이지를 구현하기 위한 준비가 되었습니다. 다음 Day 22에서는 비공개 페이지 구현 첫 번째 부분을 진행합니다.

- 게시글 작성 페이지 구현
- 구인/구직 등록 페이지 구현
- 팀 생성 페이지 구현
- 댓글 작성 기능 구현
