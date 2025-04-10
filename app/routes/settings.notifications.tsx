import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getNotificationSettings } from "~/lib/data/mock-settings";
import type { NotificationSettings } from "~/lib/types/settings";

export const meta: MetaFunction = () => {
    return [
        { title: "알림 설정 - YkMake" },
        { name: "description", content: "YkMake 알림 설정을 관리하세요" },
    ];
};

export async function loader() {
    const settings = getNotificationSettings();
    return { settings };
}

export default function NotificationSettings() {
    const { settings } = useLoaderData<typeof loader>();

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">알림 설정</h1>

            <div className="grid gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">이메일 알림</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">새 메시지</p>
                                <p className="text-sm text-muted-foreground">
                                    새로운 메시지가 도착하면 알림을 받습니다
                                </p>
                            </div>
                            <Switch checked={settings.email.newMessage} />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">팀 초대</p>
                                <p className="text-sm text-muted-foreground">
                                    새로운 팀 초대가 있을 때 알림을 받습니다
                                </p>
                            </div>
                            <Switch checked={settings.email.teamInvite} />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">댓글</p>
                                <p className="text-sm text-muted-foreground">
                                    내 게시글에 새 댓글이 달리면 알림을 받습니다
                                </p>
                            </div>
                            <Switch checked={settings.email.comments} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">푸시 알림</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">브라우저 알림</p>
                                <p className="text-sm text-muted-foreground">
                                    브라우저를 통해 실시간 알림을 받습니다
                                </p>
                            </div>
                            <Switch checked={settings.push.browser} />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">데스크톱 알림</p>
                                <p className="text-sm text-muted-foreground">
                                    데스크톱 앱을 통해 알림을 받습니다
                                </p>
                            </div>
                            <Switch checked={settings.push.desktop} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">마케팅 알림</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">뉴스레터</p>
                                <p className="text-sm text-muted-foreground">
                                    주간 뉴스레터를 이메일로 받습니다
                                </p>
                            </div>
                            <Switch checked={settings.marketing.newsletter} />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">제품 업데이트</p>
                                <p className="text-sm text-muted-foreground">
                                    새로운 기능과 업데이트 소식을 받습니다
                                </p>
                            </div>
                            <Switch checked={settings.marketing.productUpdates} />
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}