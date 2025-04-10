import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { getAccountSettings } from "~/lib/data/mock-settings";
import type { AccountSettings } from "~/lib/types/settings";

export const meta: MetaFunction = () => {
    return [
        { title: "계정 설정 - YkMake" },
        { name: "description", content: "YkMake 계정 설정을 관리하세요" },
    ];
};

export async function loader() {
    const settings = getAccountSettings();
    return { settings };
}

export default function AccountSettings() {
    const { settings } = useLoaderData<typeof loader>();

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">계정 설정</h1>

            <div className="grid gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                id="email"
                                type="email"
                                value={settings.email}
                                disabled
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="username">사용자명</Label>
                            <Input
                                id="username"
                                defaultValue={settings.username}
                            />
                        </div>

                        <Button>변경사항 저장</Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">보안</h2>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current-password">현재 비밀번호</Label>
                            <Input
                                id="current-password"
                                type="password"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="new-password">새 비밀번호</Label>
                            <Input
                                id="new-password"
                                type="password"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">비밀번호 확인</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                            />
                        </div>

                        <Button>비밀번호 변경</Button>

                        <Separator className="my-6" />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">2단계 인증</p>
                                <p className="text-sm text-muted-foreground">
                                    로그인 시 추가 보안 코드를 요구합니다
                                </p>
                            </div>
                            <Switch checked={settings.twoFactorEnabled} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-destructive">위험 구역</h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="font-medium">계정 삭제</p>
                            <p className="text-sm text-muted-foreground">
                                계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다
                            </p>
                        </div>
                        <Button variant="destructive">계정 삭제</Button>
                    </div>
                </Card>
            </div>
        </>
    );
}