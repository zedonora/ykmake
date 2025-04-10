import { json, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Bell, Mail, BellRing, UserPlus, MessageSquare, AtSign, Newspaper } from "lucide-react";
import { getUserNotificationSettings } from "~/lib/data/mock-user";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";

export async function loader() {
    const settings = getUserNotificationSettings();
    return json({ settings });
}

export async function action({ request }: ActionFunctionArgs) {
    // 실제 구현에서는 여기서 알림 설정 업데이트
    return json({ success: true });
}

export default function NotificationSettingsPage() {
    const { settings } = useLoaderData<typeof loader>();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>알림 설정</CardTitle>
                    <CardDescription>
                        이메일과 푸시 알림 설정을 관리합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>이메일 알림</Label>
                                    <p className="text-sm text-muted-foreground">
                                        이메일로 알림을 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    name="emailNotifications"
                                    defaultChecked={settings.emailNotifications}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>푸시 알림</Label>
                                    <p className="text-sm text-muted-foreground">
                                        브라우저 푸시 알림을 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    name="pushNotifications"
                                    defaultChecked={settings.pushNotifications}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>마케팅 이메일</Label>
                                    <p className="text-sm text-muted-foreground">
                                        프로모션 및 마케팅 관련 이메일을 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    name="marketingEmails"
                                    defaultChecked={settings.marketingEmails}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-base font-medium">알림 종류</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="flex items-center">
                                            <UserPlus size={16} className="mr-2" />
                                            새 팔로워 알림
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            새로운 팔로워가 생길 때 알림을 받습니다.
                                        </p>
                                    </div>
                                    <Switch
                                        name="newFollowerAlert"
                                        defaultChecked={settings.newFollowerAlert}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="flex items-center">
                                            <MessageSquare size={16} className="mr-2" />
                                            프로젝트 댓글 알림
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            내 프로젝트에 새로운 댓글이 달릴 때 알림을 받습니다.
                                        </p>
                                    </div>
                                    <Switch
                                        name="projectCommentAlert"
                                        defaultChecked={settings.projectCommentAlert}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="flex items-center">
                                            <AtSign size={16} className="mr-2" />
                                            멘션 알림
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            다른 사용자가 나를 멘션할 때 알림을 받습니다.
                                        </p>
                                    </div>
                                    <Switch
                                        name="mentionAlert"
                                        defaultChecked={settings.mentionAlert}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="flex items-center">
                                            <Newspaper size={16} className="mr-2" />
                                            주간 요약
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            주간 활동 요약을 이메일로 받습니다.
                                        </p>
                                    </div>
                                    <Switch
                                        name="weeklyDigest"
                                        defaultChecked={settings.weeklyDigest}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">
                                설정 저장
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}