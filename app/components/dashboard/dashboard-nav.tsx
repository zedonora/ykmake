import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> { }

export function DashboardNav({ className }: DashboardNavProps) {
    const location = useLocation();
    const currentPath = location.pathname;
    let activeTab = "overview";  // 기본값

    if (currentPath.includes("/dashboard/products")) {
        activeTab = "products";
    } else if (currentPath.includes("/dashboard/teams")) {
        activeTab = "teams";
    } else if (currentPath.includes("/dashboard/activity")) {
        activeTab = "activity";
    }

    return (
        <nav className={cn("flex p-2", className)}>
            <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/dashboard">대시보드</Link>
            </Button>
            <Button
                variant={activeTab === "products" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/dashboard/products">제품 분석</Link>
            </Button>
            <Button
                variant={activeTab === "teams" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/dashboard/teams">팀 분석</Link>
            </Button>
            <Button
                variant={activeTab === "activity" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/dashboard/activity">활동 분석</Link>
            </Button>
        </nav>
    );
}