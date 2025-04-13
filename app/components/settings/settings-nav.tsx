import { useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import ClientOnly from "~/components/ui/client-only";
import { useNavigate } from "@remix-run/react";

interface SettingsNavProps {
    className?: string;
}

export function SettingsNav({ className }: SettingsNavProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        const path = location.pathname;
        if (path === "/settings") {
            setActiveTab("general");
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
                    variant={activeTab === "general" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/settings")}
                >
                    일반
                </Button>
                <Button
                    variant={activeTab === "account" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/settings/account")}
                >
                    계정
                </Button>
                <Button
                    variant={activeTab === "notifications" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/settings/notifications")}
                >
                    알림
                </Button>
            </div>
        </ClientOnly>
    );
}