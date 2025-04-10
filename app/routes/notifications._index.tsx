import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { getNotifications } from "~/lib/data/mock-notifications";
import type { Notification } from "~/lib/types/notification";

export const meta: MetaFunction = () => {
    return [
        { title: "알림 - YkMake" },
        { name: "description", content: "YkMake의 알림을 확인하세요" },
    ];
};

export async function loader() {
    const notifications = getNotifications();
    return { notifications };
}

export default function Notifications() {
    const { notifications } = useLoaderData<typeof loader>();

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">알림</h1>
                <Button variant="outline">모두 읽음 표시</Button>
            </div>

            <div className="space-y-4">
                {notifications.map((notification: Notification) => (
                    <Card key={notification.id} className="p-4 hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-start gap-4">
                            <div className={`h-2 w-2 mt-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                            <div className="flex-1">
                                <p className="font-medium">
                                    {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {notification.content}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {notification.timestamp}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
}