import { useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import ClientOnly from "~/components/ui/client-only";
import { useNavigate } from "@remix-run/react";

interface AdminNavProps {
    className?: string;
}

export function AdminNav({ className }: AdminNavProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        const path = location.pathname;
        if (path === "/admin") {
            setActiveTab("dashboard");
        } else if (path.includes("/admin/users")) {
            setActiveTab("users");
        } else if (path.includes("/admin/settings")) {
            setActiveTab("settings");
        }
    }, [location]);

    return (
        <ClientOnly>
            <div className={cn("flex flex-wrap p-2 bg-muted rounded-lg", className)}>
                <Button
                    variant={activeTab === "dashboard" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/admin")}
                >
                    대시보드
                </Button>
                <Button
                    variant={activeTab === "users" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/admin/users")}
                >
                    사용자
                </Button>
                <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/admin/settings")}
                >
                    설정
                </Button>
            </div>
        </ClientOnly>
    );
}