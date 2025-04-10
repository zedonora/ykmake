import { Link, useLocation } from "@remix-run/react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

interface AdminNavProps {
    className?: string;
}

export function AdminNav({ className }: AdminNavProps) {
    const location = useLocation();

    // 현재 경로에서 마지막 세그먼트를 추출
    const currentPath = location.pathname;
    let activeTab = "dashboard";  // 기본값

    if (currentPath.includes("/admin/users")) {
        activeTab = "users";
    } else if (currentPath.includes("/admin/dashboard")) {
        activeTab = "dashboard";
    }

    return (
        <Tabs defaultValue={activeTab} className={className}>
            <TabsList>
                <TabsTrigger value="dashboard" asChild>
                    <Link to="/admin/dashboard">대시보드</Link>
                </TabsTrigger>
                <TabsTrigger value="users" asChild>
                    <Link to="/admin/users">사용자 관리</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}