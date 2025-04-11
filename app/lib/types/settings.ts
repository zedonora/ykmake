export interface AccountSettings {
    username: string;
    email: string;
    name: string;
    bio: string;
    language: string;
    theme: string;
}

export interface NotificationSettings {
    email: boolean;
    push: boolean;
    marketing: boolean;
    activity: boolean;
    mentions: boolean;
    updates: boolean;
}

export interface SettingResult {
    id: string;
    title: string;
    description: string;
    category: string;
    path: string;
}