import type { User, Message, Conversation } from "~/lib/types/message";

export const users: User[] = [
    {
        id: "1",
        name: "김영희",
        status: "online"
    },
    {
        id: "2",
        name: "이철수",
        status: "online"
    },
    {
        id: "3",
        name: "박민수",
        status: "away"
    },
    {
        id: "4",
        name: "정지원",
        status: "offline"
    }
];

export const messages: Record<string, Message[]> = {
    "1": [
        {
            id: "m1",
            senderId: "current-user",
            receiverId: "1",
            content: "안녕하세요! 프로젝트 관련해서 문의드립니다.",
            timestamp: "2023-06-15T09:00:00",
            isRead: true
        },
        {
            id: "m2",
            senderId: "1",
            receiverId: "current-user",
            content: "네, 어떤 점이 궁금하신가요?",
            timestamp: "2023-06-15T09:02:00",
            isRead: true
        },
        {
            id: "m3",
            senderId: "current-user",
            receiverId: "1",
            content: "현재 진행 중인 AI 기반 제품 추천 시스템 프로젝트에 참여하고 싶습니다.",
            timestamp: "2023-06-15T09:05:00",
            isRead: true
        },
        {
            id: "m4",
            senderId: "1",
            receiverId: "current-user",
            content: "좋습니다! 어떤 기술 스택을 보유하고 계신가요?",
            timestamp: "2023-06-15T09:10:00",
            isRead: true
        }
    ],
    "2": [
        {
            id: "m5",
            senderId: "current-user",
            receiverId: "2",
            content: "팀 참여 신청 관련해서 문의드립니다.",
            timestamp: "2023-06-14T15:30:00",
            isRead: true
        },
        {
            id: "m6",
            senderId: "2",
            receiverId: "current-user",
            content: "팀 참여 신청 관련 답변입니다. 지원해주셔서 감사합니다.",
            timestamp: "2023-06-14T16:00:00",
            isRead: true
        }
    ],
    "3": [
        {
            id: "m7",
            senderId: "3",
            receiverId: "current-user",
            content: "제품 피드백 감사합니다!",
            timestamp: "2023-06-13T10:15:00",
            isRead: true
        }
    ]
};

export const conversations: Conversation[] = [
    {
        id: "c1",
        participants: ["current-user", "1"],
        lastMessage: messages["1"][messages["1"].length - 1]
    },
    {
        id: "c2",
        participants: ["current-user", "2"],
        lastMessage: messages["2"][messages["2"].length - 1]
    },
    {
        id: "c3",
        participants: ["current-user", "3"],
        lastMessage: messages["3"][messages["3"].length - 1]
    }
];

export function getConversations() {
    return conversations.map(conversation => {
        const otherParticipantId = conversation.participants.find(p => p !== "current-user") || "";
        const otherParticipant = users.find(user => user.id === otherParticipantId);

        return {
            ...conversation,
            user: otherParticipant
        };
    });
}

export function getConversation(userId: string) {
    return {
        messages: messages[userId] || [],
        user: users.find(user => user.id === userId)
    };
}