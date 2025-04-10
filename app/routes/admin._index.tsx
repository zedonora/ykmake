import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
    return [
        { title: "관리자 - YkMake" },
        { name: "description", content: "YkMake 시스템을 관리하세요" },
    ];
};

export default function AdminIndex() {
    return (
        <>
            <h1 className="text-3xl font-bold mb-8">관리자</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">대시보드</h2>
                    <p className="text-muted-foreground mb-4">
                        시스템 현황과 성장 추이를 확인하세요
                    </p>
                    <Button asChild>
                        <Link to="/admin/dashboard">대시보드로 이동</Link>
                    </Button>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">사용자 관리</h2>
                    <p className="text-muted-foreground mb-4">
                        사용자 계정과 권한을 관리하세요
                    </p>
                    <Button asChild>
                        <Link to="/admin/users">사용자 관리로 이동</Link>
                    </Button>
                </Card>
            </div>
        </>
    );
}