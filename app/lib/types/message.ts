export interface User {
    id: string;
    name: string;
    avatar?: string;
    status: "online" | "offline" | "away";
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    participants: string[];
    lastMessage: Message;
}