import { useEffect, useState } from "react";
import { getSocket } from "~/utils/socket.client";
import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Notification = {
    id: string;
    type: string;
    message: string;
    createdAt: string;
};

export function NotificationList() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const socket = getSocket();

        socket.on("notification", (notification: Notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.off("notification");
        };
    }, []);

    const markAllAsRead = () => {
        setUnreadCount(0);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">알림</h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                            >
                                모두 읽음 표시
                            </Button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <p className="text-center text-muted-foreground">
                                새로운 알림이 없습니다
                            </p>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-start gap-4 p-2 hover:bg-accent rounded-lg"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}