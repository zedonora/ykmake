import type { AccountSettings, NotificationSettings } from "~/lib/types/settings";
import { SettingResult } from "~/lib/types/settings";

export const accountSettings: AccountSettings = {
    email: "user@example.com",
    username: "홍길동",
    twoFactorEnabled: false,
};

export const notificationSettings: NotificationSettings = {
    email: {
        newMessage: true,
        teamInvite: true,
        comments: true,
    },
    push: {
        browser: true,
        desktop: false,
    },
    marketing: {
        newsletter: false,
        productUpdates: true,
    },
};

export function getAccountSettings(): AccountSettings {
    return accountSettings;
}

export function getNotificationSettings(): NotificationSettings {
    return notificationSettings;
}

// 설정 검색을 위한 더미 데이터
const SETTINGS_SEARCH_DATA: SettingResult[] = [
    {
        id: "account-general",
        title: "계정 정보",
        description: "사용자 이름, 이메일 및 기본 계정 설정을 변경합니다.",
        category: "계정",
        path: "/settings/account",
    },
    {
        id: "account-password",
        title: "비밀번호 변경",
        description: "계정 비밀번호를 업데이트하고 보안을 강화합니다.",
        category: "계정",
        path: "/settings/account",
    },
    {
        id: "notifications-email",
        title: "이메일 알림",
        description: "이메일로 받을 알림 유형을 관리합니다.",
        category: "알림",
        path: "/settings/notifications",
    },
    {
        id: "notifications-app",
        title: "앱 내 알림",
        description: "앱 내에서 표시될 알림을 설정합니다.",
        category: "알림",
        path: "/settings/notifications",
    },
    {
        id: "notifications-project",
        title: "프로젝트 알림",
        description: "프로젝트 업데이트 및 변경사항에 대한 알림을 관리합니다.",
        category: "알림",
        path: "/settings/notifications",
    },
];

/**
 * 설정 검색 함수
 * @param query 검색어
 * @returns 검색 결과 목록
 */
export function searchSettings(query: string): SettingResult[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return SETTINGS_SEARCH_DATA.filter((setting) =>
        setting.title.toLowerCase().includes(lowerQuery) ||
        setting.description.toLowerCase().includes(lowerQuery) ||
        setting.category.toLowerCase().includes(lowerQuery)
    );
}