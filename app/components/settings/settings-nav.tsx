import { useLocation, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import ClientOnly from "~/components/ui/client-only";

interface SettingsNavProps {
    className?: string;
}

export function SettingsNav({ className }: SettingsNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        const path = location.pathname;
        if (path === "/settings") {
            setActiveTab("overview");
        } else if (path.includes("/settings/account")) {
            setActiveTab("account");
        } else if (path.includes("/settings/notifications")) {
            setActiveTab("notifications");
        }
    }, [location]);

    return (
        <ClientOnly>
            <div className={cn("flex flex-wrap p-2 bg-muted rounded-lg", className)}>
                <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/settings">개요</Link>
                </Button>
                <Button
                    variant={activeTab === "account" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/settings/account">계정</Link>
                </Button>
                <Button
                    variant={activeTab === "notifications" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/settings/notifications">알림</Link>
                </Button>
            </div>
        </ClientOnly>
    );
}