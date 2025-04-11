import { useLocation, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import ClientOnly from "~/components/ui/client-only";

interface AdminNavProps {
    className?: string;
}

export function AdminNav({ className }: AdminNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        const path = location.pathname;
        if (path === "/admin") {
            setActiveTab("overview");
        } else if (path.includes("/admin/dashboard")) {
            setActiveTab("dashboard");
        } else if (path.includes("/admin/users")) {
            setActiveTab("users");
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
                    <Link to="/admin">개요</Link>
                </Button>
                <Button
                    variant={activeTab === "dashboard" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/admin/dashboard">대시보드</Link>
                </Button>
                <Button
                    variant={activeTab === "users" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/admin/users">사용자</Link>
                </Button>
            </div>
        </ClientOnly>
    );
}