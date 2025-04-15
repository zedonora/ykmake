# Day 27: 실시간 협업 기능 구현 (예: 공동 문서 편집)

## 목표

여러 사용자가 동시에 문서를 편집하거나 다른 형태의 실시간 상호작용을 할 수 있는 기능을 구현합니다. 여기서는 공동 문서 편집을 예시로 설명합니다.

## 작업 목록

1. 실시간 협업 기술 스택 선정 (예: Supabase Realtime + CRDT, Liveblocks, WebSockets 등)
2. 협업 기능 백엔드 설정 (예: 실시간 채널, 데이터 동기화 로직)
3. 공동 편집 UI 컴포넌트 구현 (예: Tiptap, Lexical 에디터 활용)
4. 사용자 Presence 표시 기능 구현 (현재 접속/편집 중인 사용자 표시)
5. 변경 사항 충돌 해결 전략 고려 (선택 사항, CRDT 사용 시 자동 처리 가능)

## 파일 생성 명령어

!!!bash
mkdir -p app/components/collaboration app/routes/documents app/services/collaboration app/lib/editor
touch app/components/collaboration/CollaborativeEditor.tsx # 공동 편집 에디터 컴포넌트
touch app/components/collaboration/PresenceIndicator.tsx # 사용자 접속 상태 표시
touch app/routes/documents.$id.tsx # 특정 문서 편집 페이지 라우트
touch app/services/collaboration/realtime.client.ts # 협업 관련 실시간 클라이언트 로직
touch app/lib/editor/setup.ts # Tiptap 또는 Lexical 에디터 설정
# 데이터베이스 스키마 수정 필요 (예: documents 테이블, presence 정보 저장 방식)
# 기존 app/root.tsx 등 관련 파일 수정 필요
!!!

## 필수 라이브러리 설치 (및 도구)

선택한 기술 스택에 따라 필요한 라이브러리가 달라집니다.

!!!bash
# 예시 1: Tiptap + Supabase Realtime (CRDT 미사용 시, 직접 동기화 로직 구현 필요)
# npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor
# npm install @supabase/supabase-js 

# 예시 2: Tiptap + Liveblocks (관리형 서비스)
# npm install @tiptap/react @tiptap/starter-kit
# npm install @liveblocks/react @liveblocks/client

# 예시 3: Lexical + Yjs (CRDT)
# npm install lexical @lexical/react yjs y-webrtc y-websocket # (WebRTC 또는 WebSocket Provider 선택)

# Presence 표시를 위한 아바타 컴포넌트 (shadcn/ui 사용 시)
# npx shadcn-ui@latest add avatar
!!!

**참고:** 여기서는 **Tiptap과 Liveblocks**를 사용하는 예시 코드를 중심으로 설명합니다. Liveblocks는 실시간 협업 기능을 위한 관리형 백엔드 서비스입니다. Supabase Realtime으로 직접 구현할 수도 있지만, 상태 동기화 및 충돌 해결 로직 구현이 더 복잡할 수 있습니다.

## 1. Liveblocks 설정 (가정)

- Liveblocks 계정 생성 및 프로젝트 설정
- API 키 발급
- 인증 엔드포인트 구현: 사용자가 특정 "방"(문서)에 접근할 권한이 있는지 확인하고 Liveblocks 토큰을 발급하는 API 라우트 (예: `/api/liveblocks/auth`) 필요

## 2. 공동 편집 UI 컴포넌트 구현 (`CollaborativeEditor.tsx`)

Liveblocks의 `RoomProvider`와 `useOthers`, `useUpdateMyPresence` 훅, Tiptap의 `Collaboration` 및 `CollaborationCursor` 확장을 사용하여 공동 편집 에디터를 구현합니다.

!!!typescript
import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import {
  RoomProvider,
  useOthers,
  useMyPresence,
  useUpdateMyPresence,
  useRoom,
} from '~/liveblocks.config'; // Liveblocks 설정 파일 경로
import { PresenceIndicator } from './PresenceIndicator';
import type { User } from '~/types'; // 사용자 정보 타입 (예: id, name, color, avatar)

interface CollaborativeEditorProps {
  roomId: string; // 문서 ID 등 고유한 방 ID
  currentUser: User;
  // 초기 문서 내용 로드 방법 (예: loader에서 전달)
  initialContent?: string | null; 
}

// Liveblocks Provider 내부에서 렌더링될 컴포넌트
function EditorComponent({ roomId, currentUser, initialContent }: CollaborativeEditorProps) {
  const room = useRoom(); // Liveblocks 방 인스턴스
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers(); // 현재 방에 있는 다른 사용자 정보

  // Tiptap 에디터 설정
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Collaboration 사용 시 history는 비활성화
        history: false,
      }),
      Collaboration.configure({
        // Liveblocks와 연동하기 위한 설정 필요
        // document: ... // Yjs 또는 다른 CRDT 연동 시 사용
        // 여기서는 Liveblocks의 상태 동기화 메커니즘을 사용한다고 가정
        // (Liveblocks에서 Tiptap 연동을 위한 별도 가이드 또는 라이브러리가 있을 수 있음)
      }),
      CollaborationCursor.configure({
        provider: room, // Liveblocks를 Provider로 사용 (Liveblocks 설정에 따라 다를 수 있음)
        user: currentUser, // 현재 사용자 정보 (name, color 등 포함)
        onUpdate: (users) => {
           // Presence 업데이트 로직과 연동될 수 있음
        }
      }),
    ],
    // 초기 콘텐츠 설정 방법 확인 필요 (Liveblocks 연동 방식에 따라 다름)
    // content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
    // 에디터 상태 변경 시 Liveblocks 상태 업데이트 (구현 방식 확인 필요)
    // onUpdate: ({ editor }) => { 
    //   room.updateState({ content: editor.getJSON() });
    // },
  });

  // 컴포넌트 마운트/언마운트 시 및 에디터 포커스 시 Presence 업데이트
  useEffect(() => {
    updateMyPresence({ isEditing: true }); // 에디터 로드 시 편집 중 상태로 설정
    
    editor?.on('focus', () => {
      updateMyPresence({ isEditing: true });
    });
    editor?.on('blur', () => {
      updateMyPresence({ isEditing: false });
    });

    return () => {
      // 컴포넌트 언마운트 시 방 나가기 (RoomProvider가 처리할 수도 있음)
    };
  }, [editor, updateMyPresence]);

  // 다른 사용자 Presence 정보 업데이트 (Liveblocks에서 자동으로 처리)

  return (
    <div className="relative">
      <PresenceIndicator others={others} />
      <EditorContent editor={editor} className="min-h-[400px] border rounded-md p-4" />
    </div>
  );
}

// 메인 컴포넌트 (RoomProvider로 감싸기)
export function CollaborativeEditor({ roomId, currentUser, initialContent }: CollaborativeEditorProps) {
  return (
    <RoomProvider 
      id={roomId} 
      initialPresence={{ cursor: null, isEditing: false, ...currentUser }} // 초기 Presence 설정
      // initialStorage={{ content: initialContent || {} }} // 초기 문서 데이터 설정 (Liveblocks Storage 사용 시)
    >
      {/* 로딩 상태 처리 */} 
      {/* <ClientSideSuspense fallback={<div>Loading editor...</div>}> */} 
        <EditorComponent 
          roomId={roomId} 
          currentUser={currentUser} 
          initialContent={initialContent} 
        />
      {/* </ClientSideSuspense> */} 
    </RoomProvider>
  );
}

**참고:**
- 위 코드는 개념적인 예시이며, 실제 Liveblocks와 Tiptap 연동 방식은 Liveblocks 공식 문서 및 예제를 참고해야 합니다. (`liveblocks.config.ts` 설정 포함)
- Tiptap의 `Collaboration` 및 `CollaborationCursor` 확장 설정은 사용하는 실시간 백엔드(Liveblocks, Supabase Realtime 등)에 맞춰 구성해야 합니다.
- 초기 문서 콘텐츠 로딩 및 저장 방식은 선택한 백엔드 및 상태 관리 방법에 따라 달라집니다.
- `ClientSideSuspense`는 Liveblocks에서 비동기 로딩 처리를 위해 제공하는 컴포넌트일 수 있습니다.

## 3. 사용자 Presence 표시 기능 구현 (`PresenceIndicator.tsx`)

현재 문서 편집에 참여 중인 다른 사용자들의 아바타 또는 이름을 표시합니다.

!!!typescript
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import type { Others } from '~/liveblocks.config'; // Liveblocks 타입 경로
import type { User } from '~/types';

interface PresenceIndicatorProps {
  others: Others<User>; // Liveblocks의 useOthers 훅 반환 타입
}

export function PresenceIndicator({ others }: PresenceIndicatorProps) {
  // 현재 접속 중인 다른 사용자들만 필터링 (presence가 있는 사용자)
  const activeUsers = others.filter(other => other.presence);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="absolute top-2 right-2 flex -space-x-2">
        {activeUsers.slice(0, 4).map(({ connectionId, presence, info }) => {
          // info 객체에 사용자 정보 (name, avatar_url, color 등)가 있다고 가정
          const user = { ...info, ...presence }; // info와 presence 정보 결합
          return (
            <Tooltip key={connectionId}>
              <TooltipTrigger asChild>
                <Avatar className={"h-8 w-8 border-2 border-background" style={{ borderColor: user.color || 'transparent' }}>
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback style={{ backgroundColor: user.color }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                {user.name}{user.isEditing ? ' (편집 중)' : ''}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {activeUsers.length > 4 && (
           <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback>+{activeUsers.length - 4}</AvatarFallback>
           </Avatar>
        )}
      </div>
    </TooltipProvider>
  );
}
!!!

## 4. 문서 페이지 라우트 구현 (`app/routes/documents.$id.tsx`)

특정 문서 ID에 해당하는 편집 페이지입니다. `loader`에서 문서 데이터와 현재 사용자 정보를 로드하고, Liveblocks 인증에 필요한 정보를 클라이언트에 전달할 수 있습니다.

!!!typescript
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { createClient } from "@supabase/supabase-js";
import { CollaborativeEditor } from "~/components/collaboration/CollaborativeEditor"; // 경로 확인
import { getUserInfo } from "~/utils/user.server"; // 사용자 정보 조회 함수 (가정)
import type { User } from '~/types';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.document?.title || '문서'} 편집 - YkMake` }];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const documentId = params.id;

  if (!documentId) {
    throw new Response("잘못된 문서 ID입니다.", { status: 400 });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  // 1. 문서 정보 로드
  const { data: document, error: docError } = await supabase
    .from('documents') // documents 테이블 가정
    .select('id, title, content') // content 필드는 초기 로드용
    .eq('id', documentId)
    .single();

  // TODO: 문서 접근 권한 확인 로직 추가

  if (docError || !document) {
    console.error("문서 로드 오류:", docError);
    throw new Response("문서를 찾을 수 없습니다.", { status: 404 });
  }

  // 2. 현재 사용자 정보 로드 (Liveblocks Presence 및 커서에 필요)
  const userInfo = await getUserInfo(userId); // 이름, 아바타 URL, 고유 색상 등 포함 가정
  if (!userInfo) {
     throw new Response("사용자 정보를 가져올 수 없습니다.", { status: 500 });
  }
  
  // Liveblocks 인증 엔드포인트에서 사용할 정보 또는 직접 인증 처리 로직 필요
  const liveblocksToken = ""; // 서버에서 생성된 Liveblocks 토큰 (인증 엔드포인트 통해 발급 권장)

  return json({ 
    document, 
    currentUser: userInfo as User, 
    // liveblocksToken // 인증 엔드포인트 분리 시 불필요
  });
}

export default function DocumentEditPage() {
  const { document, currentUser } = useLoaderData<typeof loader>();

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{document.title}</h1>
      
      {/* Liveblocks 인증 처리 (예: API 라우트 사용) */}
      {/* 클라이언트 측에서 fetch로 인증 토큰 요청 후 RoomProvider에 전달 가능 */}
      
      <CollaborativeEditor 
        roomId={document.id} 
        currentUser={currentUser} 
        initialContent={document.content} // 초기 콘텐츠 전달 방식 확인
      />
    </div>
  );
}
!!!

## 실행 및 테스트

1.  Liveblocks 프로젝트 설정 및 인증 엔드포인트를 구현합니다.
2.  여러 브라우저 또는 시크릿 창에서 동일한 문서 페이지(` /documents/<id>`)에 접속합니다.
3.  한쪽 에디터에서 내용을 입력/수정하면 다른 쪽 에디터에도 실시간으로 반영되는지 확인합니다.
4.  다른 사용자의 커서 위치와 아바타가 Presence 영역에 정상적으로 표시되는지 확인합니다.
5.  사용자가 페이지를 나가거나 브라우저를 닫으면 Presence 목록에서 사라지는지 확인합니다.

!!!bash
# 개발 서버 실행
npm run dev

# 브라우저에서 문서 편집 페이지 접근하여 테스트
# 예: /documents/doc_abc123
!!!

## 다음 단계

실시간 협업 기능 구현이 완료되었습니다! Day 28에서는 애플리케이션 배포 준비 및 최종 점검을 진행합니다. 

``` 