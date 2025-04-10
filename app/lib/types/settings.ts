export interface AccountSettings {
    email: string;
    username: string;
    twoFactorEnabled: boolean;
}

export interface NotificationSettings {
    email: {
        newMessage: boolean;
        teamInvite: boolean;
        comments: boolean;
    };
    push: {
        browser: boolean;
        desktop: boolean;
    };
    marketing: {
        newsletter: boolean;
        productUpdates: boolean;
    };
}