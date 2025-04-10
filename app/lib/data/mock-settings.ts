import type { AccountSettings, NotificationSettings } from "~/lib/types/settings";

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