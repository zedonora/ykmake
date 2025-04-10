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