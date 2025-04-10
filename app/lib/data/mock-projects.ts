import { Project } from "../types/project";

export const mockProjects: Project[] = [
    {
        id: "1",
        title: "스마트 홈 IoT 허브",
        slug: "smart-home-iot-hub",
        description: "다양한 스마트홈 기기를 통합 제어할 수 있는 오픈소스 IoT 허브 개발 프로젝트",
        content: `# 스마트 홈 IoT 허브
  
  ## 프로젝트 개요
  
  이 프로젝트는 다양한 스마트홈 기기들을 하나의 통합 시스템으로 관리할 수 있는 오픈소스 IoT 허브를 개발하는 것을 목표로 합니다. 시중에 판매되는 다양한 스마트홈 기기들은 각자 다른 프로토콜과 앱을 사용하여 사용자 경험이 분산되어 있습니다. 이 프로젝트는 이러한 문제를 해결하고 사용자가 하나의 인터페이스에서 모든 기기를 제어할 수 있도록 합니다.
  
  ## 주요 기능
  
  1. **기기 통합**
     - 다양한 제조사의 스마트홈 기기 연동 (Philips Hue, LIFX, TP-Link, 샤오미 등)
     - 블루투스, Wi-Fi, Zigbee, Z-Wave 프로토콜 지원
  
  2. **중앙 제어 시스템**
     - 웹 인터페이스를 통한 모든 기기 제어
     - 모바일 앱(iOS, Android) 지원
     - 음성 비서 연동 (구글 어시스턴트, 알렉사, 시리)
  
  3. **자동화 기능**
     - 시간, 위치, 센서 트리거 기반 자동화 규칙 설정
     - 다양한 조건과 액션을 조합한 시나리오 생성
     - 머신러닝 기반 사용자 패턴 학습 및 제안
  
  4. **데이터 분석**
     - 에너지 사용량 모니터링 및 최적화 제안
     - 사용 패턴 분석 및 리포트
     - 익명화된 데이터 공유 옵션 (개발 커뮤니티와 협업)
  
  ## 기술 스택
  
  - **하드웨어**: Raspberry Pi 4, ESP32 마이크로컨트롤러
  - **백엔드**: Node.js, Express, MongoDB, MQTT
  - **프론트엔드**: React, TypeScript, Tailwind CSS
  - **모바일**: React Native
  - **보안**: JWT 인증, TLS/SSL, 데이터 암호화
  
  ## 개발 일정
  
  1. **1단계**: 기초 아키텍처 설계 및 프로토타입 개발 (3개월)
  2. **2단계**: 주요 스마트홈 플랫폼 연동 구현 (2개월)
  3. **3단계**: 웹/모바일 인터페이스 개발 (2개월)
  4. **4단계**: 자동화 및 시나리오 기능 구현 (2개월)
  5. **5단계**: 베타 테스트 및 피드백 수집 (1개월)
  6. **6단계**: 최종 릴리즈 및 문서화 (1개월)
  
  ## 오픈소스 기여
  
  이 프로젝트는 MIT 라이센스로 공개되며, 커뮤니티의 적극적인 참여를 환영합니다. 다음과 같은 방식으로 기여할 수 있습니다:
  
  - 소스 코드 기여
  - 문서화 작업
  - 버그 리포트 및 피드백
  - 새로운 기기 연동 테스트
  - 번역 작업
  
  ## 현재 진행 상황
  
  현재 기본적인 아키텍처 설계가 완료되었으며, Raspberry Pi에서 동작하는 핵심 서버 컴포넌트를 개발 중입니다. Philips Hue와 LIFX 조명 시스템 연동이 첫 번째 목표로 진행 중이며, 웹 인터페이스의 프로토타입을 구현하고 있습니다.`,
        authorId: "1",
        authorName: "김개발",
        authorImageUrl: "https://i.pravatar.cc/300?img=11",
        coverImageUrl: "https://picsum.photos/id/180/1200/600",
        thumbnailUrl: "https://picsum.photos/id/180/600/400",
        status: "in_progress",
        visibility: "public",
        category: "IoT",
        tags: ["스마트홈", "IoT", "오픈소스", "라즈베리파이"],
        technologies: ["Node.js", "React", "MQTT", "MongoDB", "Raspberry Pi"],
        createdAt: "2023-08-15",
        updatedAt: "2023-10-20",
        publishedAt: "2023-08-20",
        likes: 84,
        views: 342,
        isFeatured: true,
        collaborators: [
            {
                id: "c1",
                userId: "2",
                name: "박하드웨어",
                imageUrl: "https://i.pravatar.cc/300?img=12",
                role: "하드웨어 설계",
                joinedAt: "2023-08-18",
            },
            {
                id: "c2",
                userId: "3",
                name: "이백엔드",
                imageUrl: "https://i.pravatar.cc/300?img=13",
                role: "백엔드 개발",
                joinedAt: "2023-08-25",
            },
        ],
        milestones: [
            {
                id: "m1",
                title: "아키텍처 설계",
                description: "시스템 아키텍처 설계 및 기술 스택 결정",
                status: "completed",
                dueDate: "2023-09-15",
                completedAt: "2023-09-12",
            },
            {
                id: "m2",
                title: "핵심 서버 컴포넌트 개발",
                description: "라즈베리파이에서 실행되는 MQTT 기반 핵심 서버 개발",
                status: "in_progress",
                dueDate: "2023-11-30",
            },
            {
                id: "m3",
                title: "웹 인터페이스 프로토타입",
                description: "기본적인 기기 제어가 가능한 웹 인터페이스 개발",
                status: "planned",
                dueDate: "2024-01-15",
            },
        ],
        resources: [
            {
                id: "r1",
                type: "document",
                title: "시스템 아키텍처 문서",
                url: "https://example.com/docs/architecture.pdf",
                description: "상세 시스템 설계 및 통신 프로토콜 정의",
            },
            {
                id: "r2",
                type: "link",
                title: "GitHub 저장소",
                url: "https://github.com/dev_user/smart-home-hub",
                description: "소스 코드 저장소",
            },
            {
                id: "r3",
                type: "image",
                title: "하드웨어 프로토타입",
                url: "https://picsum.photos/id/201/800/600",
                description: "라즈베리파이와 센서 연결 프로토타입",
                thumbnailUrl: "https://picsum.photos/id/201/200/150",
            },
        ],
    },
    {
        id: "2",
        title: "AI 기반 개인 학습 도우미",
        slug: "ai-learning-assistant",
        description: "사용자 학습 패턴을 분석하여 맞춤형 학습 경로를 제공하는 AI 학습 도우미 애플리케이션",
        content: `# AI 기반 개인 학습 도우미
  
  ## 프로젝트 개요
  
  이 프로젝트는 인공지능을 활용하여 사용자의 학습 패턴, 강점 및 약점을 분석하고 개인화된 학습 경로를 제공하는 학습 도우미 애플리케이션을 개발하는 것을 목표로 합니다. 전통적인 교육 방식은 모든 학생에게 동일한 내용을 동일한 속도로 제공하지만, 이 애플리케이션은 각 사용자의 학습 속도와 스타일에 맞춰 최적화된 학습 경험을 제공합니다.
  
  ## 주요 기능
  
  1. **개인화된 학습 분석**
     - 사용자의 학습 패턴, 성과, 약점 분석
     - 정기적인 학습 리포트 제공
     - 학습 시간 및 효율성 추적
  
  2. **맞춤형 학습 계획**
     - AI 기반 개인화된 학습 로드맵 생성
     - 사용자의 목표와 일정에 맞춘 학습 계획
     - 실시간 진행 상황 모니터링 및 조정
  
  3. **인터랙티브 학습 컨텐츠**
     - 다양한 포맷의 학습 자료(비디오, 텍스트, 퀴즈, 인터랙티브 실습)
     - 사용자 이해도에 따른 컨텐츠 난이도 조절
     - 맞춤형 복습 자료 제공
  
  4. **소셜 러닝 기능**
     - 비슷한 학습 목표를 가진 사용자와 연결
     - 스터디 그룹 형성 및 협업 기능
     - 지식 공유 및 질문/답변 커뮤니티
  
  ## 기술 스택
  
  - **백엔드**: Python, Django, PostgreSQL, Redis
  - **ML/AI**: TensorFlow, PyTorch, scikit-learn
  - **프론트엔드**: React, Next.js, TypeScript, Tailwind CSS
  - **인프라**: AWS (EC2, S3, Lambda), Docker, Kubernetes
  - **분석**: Elasticsearch, Kibana
  
  ## 개발 일정
  
  1. **1단계**: 요구사항 분석 및 데이터 모델 설계 (2개월)
  2. **2단계**: 기본 플랫폼 및 사용자 인터페이스 개발 (3개월)
  3. **3단계**: 기초 ML 모델 구현 및 통합 (3개월)
  4. **4단계**: 맞춤형 학습 계획 알고리즘 개발 (2개월)
  5. **5단계**: 소셜 러닝 기능 구현 (2개월)
  6. **6단계**: 베타 테스트 및 피드백 수집 (2개월)
  7. **7단계**: 최종 릴리즈 준비 (1개월)
  
  ## 데이터 및 프라이버시
  
  사용자 데이터는 학습 분석과 개인화에 핵심이지만, 프라이버시를 최우선으로 고려합니다:
  
  - 모든 사용자 데이터는 암호화하여 저장
  - 명시적 동의 없이 제3자와 데이터 공유 없음
  - 사용자가 언제든지 데이터 열람, 다운로드, 삭제 가능
  - 미성년자를 위한 추가 개인정보 보호 조치
  
  ## 비즈니스 모델
  
  이 프로젝트는 교육 접근성을 높이는 것을 목표로 하며, 다음과 같은 비즈니스 모델을 고려하고 있습니다:
  
  - 기본 기능은 무료로 제공
  - 고급 분석 및 맞춤형 기능은 구독 모델로 제공
  - 교육 기관을 위한 엔터프라이즈 라이센싱 옵션
  - 프리미엄 컨텐츠 제공자와의 파트너십
  
  ## 현재 진행 상황
  
  현재 MVP(Minimum Viable Product) 개발 중이며, 기본적인 사용자 인터페이스와 학습 분석 알고리즘의 초기 버전을 구현했습니다. 소규모 테스트 그룹을 통해 사용자 피드백을 수집하고 있으며, 다음 단계로 맞춤형 학습 계획 생성 기능을 개발할 예정입니다.`,
        authorId: "3",
        authorName: "최인공지능",
        authorImageUrl: "https://i.pravatar.cc/300?img=15",
        coverImageUrl: "https://picsum.photos/id/24/1200/600",
        thumbnailUrl: "https://picsum.photos/id/24/600/400",
        status: "in_progress",
        visibility: "public",
        category: "교육",
        tags: ["AI", "교육", "맞춤형 학습", "에듀테크"],
        technologies: ["Python", "TensorFlow", "React", "Django", "AWS"],
        createdAt: "2023-07-10",
        updatedAt: "2023-10-05",
        publishedAt: "2023-07-15",
        likes: 132,
        views: 567,
        isFeatured: true,
        collaborators: [
            {
                id: "c1",
                userId: "4",
                name: "김데이터",
                imageUrl: "https://i.pravatar.cc/300?img=20",
                role: "데이터 과학자",
                joinedAt: "2023-07-20",
            },
            {
                id: "c2",
                userId: "5",
                name: "박프론트",
                imageUrl: "https://i.pravatar.cc/300?img=21",
                role: "프론트엔드 개발자",
                joinedAt: "2023-07-25",
            },
            {
                id: "c3",
                userId: "6",
                name: "이교육",
                imageUrl: "https://i.pravatar.cc/300?img=22",
                role: "교육 컨텐츠 전문가",
                joinedAt: "2023-08-05",
            },
        ],
        milestones: [
            {
                id: "m1",
                title: "요구사항 분석 및 설계",
                description: "사용자 요구사항 수집 및 시스템 아키텍처 설계",
                status: "completed",
                dueDate: "2023-08-15",
                completedAt: "2023-08-10",
            },
            {
                id: "m2",
                title: "기본 플랫폼 개발",
                description: "사용자 인터페이스 및 기본 기능 구현",
                status: "completed",
                dueDate: "2023-09-30",
                completedAt: "2023-09-28",
            },
            {
                id: "m3",
                title: "ML 모델 개발 및 통합",
                description: "기초 학습 패턴 분석 알고리즘 개발",
                status: "in_progress",
                dueDate: "2023-12-15",
            },
        ],
        resources: [
            {
                id: "r1",
                type: "document",
                title: "프로젝트 기획서",
                url: "https://example.com/docs/planning.pdf",
                description: "프로젝트 비전, 목표, 기능 명세",
            },
            {
                id: "r2",
                type: "video",
                title: "개발 데모",
                url: "https://example.com/videos/demo.mp4",
                description: "현재 개발 중인 MVP 기능 데모",
                thumbnailUrl: "https://picsum.photos/id/25/200/150",
            },
        ],
    },
    {
        id: "3",
        title: "지속가능한 도시 교통 솔루션",
        slug: "sustainable-urban-transport",
        description: "도시 교통 문제를 해결하기 위한 종합적인 지속가능 교통 솔루션 디자인 및 개발 프로젝트",
        content: `# 지속가능한 도시 교통 솔루션
  
  ## 프로젝트 개요
  
  이 프로젝트는 증가하는 도시화와 함께 심각해지는 교통 혼잡, 대기 오염, 교통 인프라 효율성 저하 등의 문제를 해결하기 위한 종합적인 도시 교통 솔루션을 개발하는 것을 목표로 합니다. 스마트 시티 기술, 데이터 분석, 지속가능한 모빌리티 컨셉을 통합하여 더 효율적이고 친환경적인 도시 교통 시스템을 구축하고자 합니다.
  
  ## 솔루션 구성요소
  
  1. **통합 교통 관리 시스템**
     - 실시간 교통 흐름 모니터링 및 분석
     - AI 기반 교통 신호 최적화
     - 대중교통 노선 및 일정 동적 조정
  
  2. **스마트 모빌리티 플랫폼**
     - 다양한 교통수단(대중교통, 공유 차량, 자전거, 스쿠터 등) 통합 예약 및 결제
     - 실시간 다중 교통수단 경로 계획
     - 개인화된 이동 추천 서비스
  
  3. **친환경 교통 인프라**
     - 전기차 충전소 네트워크 최적화
     - 자전거 전용도로 및 보행자 친화적 공간 설계
     - 스마트 주차 솔루션
  
  4. **데이터 기반 정책 지원 도구**
     - 교통 패턴 분석 및 예측
     - 환경 영향 평가
     - 정책 시뮬레이션 및 효과 분석
  
  ## 기술 스택
  
  - **데이터 처리**: Apache Kafka, Spark, Hadoop
  - **AI/ML**: Python, TensorFlow, scikit-learn
  - **백엔드**: Java Spring Boot, Node.js, PostgreSQL
  - **프론트엔드**: React, TypeScript, MapboxGL
  - **IoT**: Arduino, Raspberry Pi, LoRaWAN
  - **클라우드**: AWS, Azure
  
  ## 파일럿 도시 및 파트너십
  
  이 프로젝트는 다음 도시들과 파트너십을 맺고 파일럿 프로그램을 진행할 예정입니다:
  
  1. **서울시** - 강남구 일대 교통 혼잡 지역
  2. **부산시** - 해운대 관광 지역 교통 관리
  3. **세종시** - 스마트시티 시범 구역
  
  또한 다음 기관들과 협력하고 있습니다:
  - 한국교통연구원 (KOTI)
  - 현대자동차 모빌리티 연구소
  - 서울대학교 도시공학과
  
  ## 개발 로드맵
  
  1. **1단계** (6개월): 요구사항 분석, 아키텍처 설계, 데이터 수집 인프라 구축
  2. **2단계** (8개월): 기본 플랫폼 개발, 초기 데이터 모델 훈련, 교통 관리 시스템 프로토타입
  3. **3단계** (6개월): 사용자 인터페이스 개발, 통합 테스트, 파일럿 지역 인프라 설치
  4. **4단계** (6개월): 파일럿 프로그램 실행, 데이터 수집, 성능 평가
  5. **5단계** (12개월): 시스템 최적화, 확장 모델 개발, 추가 지역 구현
  
  ## 기대 효과
  
  이 프로젝트를 통해 다음과 같은 효과를 기대합니다:
  
  - 교통 혼잡 20% 감소
  - 도시 탄소 배출량 15% 감소
  - 대중교통 이용률 30% 증가
  - 평균 통근 시간 25% 단축
  - 교통 사고 15% 감소
  
  ## 현재 진행 상황
  
  현재 1단계를 완료하고 2단계에 진입했습니다. 서울시 강남구에서 교통 데이터를 수집 중이며, 기본적인 데이터 처리 파이프라인과 분석 모델을 개발하고 있습니다. 스마트 신호등 프로토타입이 연구실 환경에서 테스트 중이며, 모빌리티 플랫폼의 초기 인터페이스 디자인이 완료되었습니다.`,
        authorId: "7",
        authorName: "정도시계획",
        authorImageUrl: "https://i.pravatar.cc/300?img=25",
        coverImageUrl: "https://picsum.photos/id/37/1200/600",
        thumbnailUrl: "https://picsum.photos/id/37/600/400",
        status: "in_progress",
        visibility: "public",
        category: "스마트시티",
        tags: ["교통", "지속가능성", "도시계획", "스마트시티"],
        technologies: ["IoT", "AI", "빅데이터", "GIS", "모빌리티"],
        createdAt: "2023-05-20",
        updatedAt: "2023-10-12",
        publishedAt: "2023-06-01",
        likes: 96,
        views: 412,
        isFeatured: false,
        collaborators: [
            {
                id: "c1",
                userId: "8",
                name: "김데이터",
                imageUrl: "https://i.pravatar.cc/300?img=30",
                role: "데이터 과학자",
                joinedAt: "2023-06-15",
            },
            {
                id: "c2",
                userId: "9",
                name: "이교통",
                imageUrl: "https://i.pravatar.cc/300?img=31",
                role: "교통 공학 전문가",
                joinedAt: "2023-06-20",
            },
        ],
        milestones: [
            {
                id: "m1",
                title: "요구사항 분석 및 설계",
                description: "도시별 교통 문제 분석 및 솔루션 설계",
                status: "completed",
                dueDate: "2023-08-30",
                completedAt: "2023-08-25",
            },
            {
                id: "m2",
                title: "데이터 수집 인프라 구축",
                description: "교통 데이터 수집을 위한 센서 및 시스템 설치",
                status: "completed",
                dueDate: "2023-10-15",
                completedAt: "2023-10-10",
            },
            {
                id: "m3",
                title: "기본 분석 모델 개발",
                description: "교통 패턴 분석 및 예측 모델 개발",
                status: "in_progress",
                dueDate: "2023-12-30",
            },
        ],
        resources: [
            {
                id: "r1",
                type: "document",
                title: "교통 분석 보고서",
                url: "https://example.com/docs/traffic-analysis.pdf",
                description: "파일럿 도시들의 교통 패턴 분석 보고서",
            },
            {
                id: "r2",
                type: "image",
                title: "시스템 아키텍처",
                url: "https://picsum.photos/id/38/800/600",
                description: "전체 솔루션 아키텍처 다이어그램",
                thumbnailUrl: "https://picsum.photos/id/38/200/150",
            },
        ],
    },
    {
        id: "4",
        title: "개인 포트폴리오 웹사이트",
        slug: "personal-portfolio-website",
        description: "개발자를 위한 모던한 포트폴리오 웹사이트 템플릿",
        content: `# 개인 포트폴리오 웹사이트
  
  ## 프로젝트 개요
  
  이 프로젝트는 개발자, 디자이너 및 창작자들이 자신의 작업물을 효과적으로 선보일 수 있는 현대적이고 반응형의 포트폴리오 웹사이트 템플릿을 개발하는 것을 목표로 합니다. 최신 웹 기술을 활용하여 사용자 친화적이면서도 시각적으로 매력적인 포트폴리오를 쉽게 구축할 수 있는 솔루션을 제공합니다.
  
  ## 주요 기능
  
  1. **모듈식 디자인**
     - 드래그 앤 드롭으로 섹션 구성 가능
     - 다양한 레이아웃 템플릿 제공
     - 커스터마이징 가능한 컴포넌트 라이브러리
  
  2. **반응형 인터페이스**
     - 모든 기기에 최적화된 디자인
     - 모바일 퍼스트 접근법
     - 다크/라이트 모드 지원
  
  3. **포트폴리오 쇼케이스**
     - 프로젝트 갤러리
     - 상세 프로젝트 페이지
     - 필터링 및 카테고리 분류
  
  4. **통합 블로그**
     - 마크다운 기반 콘텐츠 작성
     - 코드 하이라이팅
     - SEO 최적화
  
  5. **연락 및 소셜 통합**
     - 컨택트 폼
     - 소셜 미디어 프로필 연동
     - 뉴스레터 구독 옵션
  
  ## 기술 스택
  
  - **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS
  - **콘텐츠 관리**: Markdown, MDX
  - **배포/호스팅**: Vercel, Netlify
  - **데이터베이스** (옵션): Supabase, Firebase
  - **분석**: Google Analytics, Plausible Analytics
  
  ## 템플릿 카테고리
  
  다양한 직군에 맞춰 최적화된 템플릿을 제공합니다:
  
  1. **개발자 포트폴리오**
     - GitHub 통계 통합
     - 코드 스니펫 쇼케이스
     - 기술 스택 시각화
  
  2. **디자이너 포트폴리오**
     - 고화질 이미지 갤러리
     - 작업 과정 표시
     - 디자인 철학 섹션
  
  3. **프리랜서 포트폴리오**
     - 서비스 소개
     - 가격 정책
     - 고객 추천서
  
  4. **스타트업/회사 랜딩 페이지**
     - 팀 프로필
     - 회사 연혁
     - 제품/서비스 쇼케이스
  
  ## 현재 진행 상황
  
  기본적인 템플릿 디자인과 핵심 컴포넌트 라이브러리 개발이 완료되었습니다. 현재 다양한 직군별 템플릿을 구현 중이며, 콘텐츠 관리 기능을 개선하고 있습니다. 베타 테스터들을 모집하여 실제 사용 사례에 대한 피드백을 수집하고 있습니다.
  
  ## 오픈소스 기여
  
  이 프로젝트는 MIT 라이센스로 공개됩니다. 다음과 같은 방법으로 기여할 수 있습니다:
  
  - 새로운 템플릿 디자인 기여
  - 버그 리포트 및 수정
  - 문서화 개선
  - 접근성 향상 제안
  
  ## 로드맵
  
  1. **1단계**: 핵심 컴포넌트 및 기본 템플릿 개발 (완료)
  2. **2단계**: 직군별 특화 템플릿 개발 (진행 중)
  3. **3단계**: 콘텐츠 관리 시스템 개선
  4. **4단계**: 커스텀 플러그인 시스템 도입
  5. **5단계**: 커뮤니티 갤러리 및 템플릿 마켓플레이스 구축`,
        authorId: "1",
        authorName: "김개발",
        authorImageUrl: "https://i.pravatar.cc/300?img=11",
        coverImageUrl: "https://picsum.photos/id/42/1200/600",
        thumbnailUrl: "https://picsum.photos/id/42/600/400",
        status: "completed",
        visibility: "public",
        category: "웹개발",
        tags: ["포트폴리오", "웹사이트", "프론트엔드", "반응형"],
        technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        createdAt: "2023-04-10",
        updatedAt: "2023-08-15",
        publishedAt: "2023-04-15",
        completedAt: "2023-08-10",
        likes: 215,
        views: 968,
        isFeatured: true,
        resources: [
            {
                id: "r1",
                type: "link",
                title: "라이브 데모",
                url: "https://portfolio-template.example.com",
                description: "템플릿 라이브 데모 사이트",
            },
            {
                id: "r2",
                type: "link",
                title: "GitHub 저장소",
                url: "https://github.com/dev_user/portfolio-template",
                description: "소스 코드 저장소",
            },
            {
                id: "r3",
                type: "image",
                title: "템플릿 쇼케이스",
                url: "https://picsum.photos/id/43/800/600",
                description: "다양한 템플릿 디자인 모음",
                thumbnailUrl: "https://picsum.photos/id/43/200/150",
            },
        ],
    },
    {
        id: "5",
        title: "영양사의 식단 관리 앱",
        slug: "nutritionist-meal-planner",
        description: "영양사와 사용자를 연결하여 맞춤형 식단을 제공하는 건강 관리 플랫폼",
        content: `# 영양사의 식단 관리 앱
  
  ## 프로젝트 개요
  
  이 프로젝트는 영양사와 사용자를 연결하여 개인 맞춤형 식단을 제공하는 건강 관리 플랫폼을 개발하는 것을 목표로 합니다. 바쁜 현대인들이 건강한 식습관을 유지하기 어려운 상황에서, 전문 영양사의 지식과 기술을 활용하여 개인별 건강 상태, 목표, 식이 제한 등을 고려한 맞춤형 식단을 쉽게 접할 수 있게 합니다.
  
  ## 주요 기능
  
  1. **맞춤형 식단 계획**
     - 사용자 건강 상태, 목표, 선호도 기반 식단 제안
     - 식이 제한(알러지, 채식주의 등) 고려
     - 칼로리 및 영양소 계산과 모니터링
  
  2. **영양사 매칭 시스템**
     - 사용자 요구사항에 맞는 영양사 추천
     - 영양사 검색 및 필터링
     - 영양 상담 예약 및 관리
  
  3. **식품 및 레시피 데이터베이스**
     - 방대한 식품 영양 정보
     - 건강한 레시피 제공
     - 사용자 맞춤 대체 식품 추천
  
  4. **건강 모니터링**
     - 식단 준수 여부 추적
     - 체중, 바디 컴포지션 변화 기록
     - 건강 지표 시각화
  
  ## 기술 스택
  
  - **백엔드**: Node.js, Express, MongoDB
  - **프론트엔드**: React Native
  - **데이터 처리**: Python, pandas, NumPy
  - **클라우드**: AWS (EC2, S3, RDS)
  - **인증/보안**: Firebase Authentication, HIPAA 준수 데이터 보호
  
  ## 비즈니스 모델
  
  이 애플리케이션은 다음과 같은 수익 모델을 가지고 있습니다:
  
  1. **구독 모델**
     - 기본 계정: 무료 (제한된 기능)
     - 프리미엄 구독: 월 19,900원 (모든 기능 이용 가능)
     - 가족 계정: 월 34,900원 (최대 5명 계정 관리)
  
  2. **영양사 중개 수수료**
     - 영양사와 사용자 연결 시 중개 수수료 수취
     - 영양 상담 및 맞춤 식단 작성 수수료의 15%
  
  3. **파트너십**
     - 건강 식품 회사, 밀키트 서비스와 제휴
     - 맞춤형 상품 추천 및 할인 제공
  
  ## 개발 로드맵
  
  1. **1단계** (3개월): MVP 개발 - 기본 식단 계획 및 영양사 매칭 기능
  2. **2단계** (3개월): 식품 데이터베이스 확장 및 모바일 앱 출시
  3. **3단계** (2개월): 건강 모니터링 기능 강화
  4. **4단계** (2개월): 파트너십 시스템 구축 및 통합
  5. **5단계** (2개월): 데이터 분석 및 AI 추천 기능 개발
  
  ## 현재 진행 상황
  
  MVP 개발이 완료되어 내부 테스트 중입니다. 기본적인 식단 계획 기능과 영양사 프로필 및 매칭 시스템이 구현되었으며, 초기 식품 데이터베이스가 구축되었습니다. 현재 모바일 앱의 UI/UX를 개선하고 있으며, 다음 단계로 더 많은 레시피와 식품 정보를 데이터베이스에 추가할 예정입니다.`,
        authorId: "10",
        authorName: "박영양",
        authorImageUrl: "https://i.pravatar.cc/300?img=35",
        coverImageUrl: "https://picsum.photos/id/52/1200/600",
        thumbnailUrl: "https://picsum.photos/id/52/600/400",
        status: "in_progress",
        visibility: "public",
        category: "건강",
        tags: ["건강", "영양", "식단", "모바일앱"],
        technologies: ["React Native", "Node.js", "MongoDB", "Python"],
        createdAt: "2023-09-05",
        updatedAt: "2023-10-18",
        publishedAt: "2023-09-10",
        likes: 78,
        views: 310,
        isFeatured: false,
        collaborators: [
            {
                id: "c1",
                userId: "11",
                name: "최디자이너",
                imageUrl: "https://i.pravatar.cc/300?img=36",
                role: "UI/UX 디자이너",
                joinedAt: "2023-09-15",
            },
        ],
        milestones: [
            {
                id: "m1",
                title: "MVP 개발",
                description: "기본 식단 계획 및 영양사 매칭 기능 구현",
                status: "completed",
                dueDate: "2023-10-15",
                completedAt: "2023-10-10",
            },
            {
                id: "m2",
                title: "식품 데이터베이스 확장",
                description: "레시피 및 식품 정보 데이터베이스 구축",
                status: "in_progress",
                dueDate: "2023-12-15",
            },
        ],
        resources: [
            {
                id: "r1",
                type: "image",
                title: "앱 디자인 목업",
                url: "https://picsum.photos/id/53/800/600",
                description: "모바일 앱 디자인 목업",
                thumbnailUrl: "https://picsum.photos/id/53/200/150",
            },
        ],
    },
];

// 프로젝트 검색 함수
export function searchProjects(query: string): Project[] {
    const searchTerms = query.toLowerCase().split(' ');
    return mockProjects.filter(project => {
        const searchText = `${project.title} ${project.description} ${project.content} ${project.tags.join(' ')} ${project.technologies.join(' ')} ${project.category} ${project.authorName}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
    });
}

// 카테고리별 프로젝트 가져오기
export function getProjectsByCategory(category: string): Project[] {
    return mockProjects.filter(project => project.category.toLowerCase() === category.toLowerCase());
}

// 태그별 프로젝트 가져오기
export function getProjectsByTag(tag: string): Project[] {
    return mockProjects.filter(project => project.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
}

// 기술 스택별 프로젝트 가져오기
export function getProjectsByTechnology(technology: string): Project[] {
    return mockProjects.filter(project => project.technologies.some(t => t.toLowerCase() === technology.toLowerCase()));
}

// 인기 프로젝트 가져오기 (좋아요 기준)
export function getPopularProjects(limit: number = 3): Project[] {
    return [...mockProjects].sort((a, b) => b.likes - a.likes).slice(0, limit);
}

// 주목받는 프로젝트 가져오기 (조회수 기준)
export function getTrendingProjects(limit: number = 3): Project[] {
    return [...mockProjects].sort((a, b) => b.views - a.views).slice(0, limit);
}

// 추천 프로젝트 가져오기 (featured 기준)
export function getFeaturedProjects(): Project[] {
    return mockProjects.filter(project => project.isFeatured);
}

// 최신 프로젝트 가져오기 (생성일 기준)
export function getLatestProjects(limit: number = 3): Project[] {
    return [...mockProjects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
}

// 특정 사용자의 프로젝트 가져오기
export function getUserProjects(userId: string): Project[] {
    return mockProjects.filter(project => project.authorId === userId);
}

// 프로젝트 상세 정보 가져오기
export function getProjectBySlug(slug: string): Project | undefined {
    return mockProjects.find(project => project.slug === slug);
}

// 모든 카테고리 가져오기
export function getAllCategories(): string[] {
    const categories = new Set<string>();
    mockProjects.forEach(project => {
        categories.add(project.category);
    });
    return Array.from(categories);
}

// 모든 태그 가져오기
export function getAllTags(): string[] {
    const tags = new Set<string>();
    mockProjects.forEach(project => {
        project.tags.forEach(tag => {
            tags.add(tag);
        });
    });
    return Array.from(tags);
}

// 모든 기술 스택 가져오기
export function getAllTechnologies(): string[] {
    const technologies = new Set<string>();
    mockProjects.forEach(project => {
        project.technologies.forEach(tech => {
            technologies.add(tech);
        });
    });
    return Array.from(technologies);
}