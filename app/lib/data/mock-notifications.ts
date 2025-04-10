import type { Notification } from "~/lib/types/notification";

export const notifications: Notification[] = [
    {
        id: "1",
        title: "새로운 팀 참여 요청이 있습니다",
        content: "AI 기반 제품 추천 시스템 팀에 참여 요청이 도착했습니다.",
        timestamp: "방금 전",
        isRead: false,
    },
    {
        id: "2",
        title: "새로운 댓글이 달렸습니다",
        content: "회원님의 게시글 \"Remix로 풀스택 앱 만들기\"에 새로운 댓글이 달렸습니다.",
        timestamp: "10분 전",
        isRead: false,
    },
    {
        id: "3",
        title: "제품이 추천되었습니다",
        content: "회원님의 제품이 이번 주 추천 제품으로 선정되었습니다.",
        timestamp: "1시간 전",
        isRead: true,
    },
    {
        id: "4",
        title: "새로운 팔로워가 생겼습니다",
        content: "홍길동님이 회원님을 팔로우하기 시작했습니다.",
        timestamp: "3시간 전",
        isRead: true,
    },
    {
        id: "5",
        title: "프로젝트 마감일이 다가옵니다",
        content: "\"모바일 앱 프로토타입\" 프로젝트의 마감일이 3일 남았습니다.",
        timestamp: "어제",
        isRead: true,
    }
];

export function getNotifications() {
    return notifications;
}

export function getUnreadCount() {
    return notifications.filter(notification => !notification.isRead).length;
}