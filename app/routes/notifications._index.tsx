import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { NotificationList } from "~/components/notifications/notification-list";

export default function NotificationsIndexPage() {
    return (
        <>
            <PageHeader title="알림" description="모든 알림을 확인하세요" />
            <Section>
                <Card>
                    <CardHeader>
                        <CardTitle>알림 목록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <NotificationList />
                        </div>
                    </CardContent>
                </Card>
            </Section>
        </>
    );
}