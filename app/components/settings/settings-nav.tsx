import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface SettingsNavProps extends React.HTMLAttributes<HTMLElement> { }

export function SettingsNav({ className }: SettingsNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("account");  // 기본값

    useEffect(() => {
        const currentPath = location.pathname;

        if (currentPath.includes("/settings/notifications")) {
            setActiveTab("notifications");
        } else {
            setActiveTab("account");
        }
    }, [location.pathname]);

    return (
        <nav className={cn("flex p-2", className)}>
            <Button
                variant={activeTab === "account" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/settings/account">계정 설정</Link>
            </Button>
            <Button
                variant={activeTab === "notifications" ? "default" : "ghost"}
                className="flex-1 justify-center"
                asChild
            >
                <Link to="/settings/notifications">알림 설정</Link>
            </Button>
        </nav>
    );
}