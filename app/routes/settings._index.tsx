import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
    return [
        { title: "설정 - YkMake" },
        { name: "description", content: "YkMake 설정을 관리하세요" },
    ];
};

export default function SettingsIndex() {
    return (
        <>
            <h1 className="text-3xl font-bold mb-8">설정</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">계정 설정</h2>
                    <p className="text-muted-foreground mb-4">
                        계정 정보와 보안 설정을 관리하세요
                    </p>
                    <Button asChild>
                        <Link to="/settings/account">계정 설정으로 이동</Link>
                    </Button>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">알림 설정</h2>
                    <p className="text-muted-foreground mb-4">
                        이메일, 푸시, 마케팅 알림 설정을 관리하세요
                    </p>
                    <Button asChild>
                        <Link to="/settings/notifications">알림 설정으로 이동</Link>
                    </Button>
                </Card>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">프로필 설정</h2>
                <Card className="p-6">
                    <p className="text-muted-foreground mb-4">
                        프로필 관련 설정을 관리하려면 프로필 설정 페이지로 이동하세요
                    </p>
                    <Button asChild>
                        <Link to="/profile/settings">프로필 설정으로 이동</Link>
                    </Button>
                </Card>
            </div>
        </>
    );
}