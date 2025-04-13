import { useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import ClientOnly from "~/components/ui/client-only";
import { useNavigate } from "@remix-run/react";

interface DashboardNavProps {
    className?: string;
}

export function DashboardNav({ className }: DashboardNavProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        const path = location.pathname;
        if (path === "/dashboard") {
            setActiveTab("overview");
        } else if (path.includes("/dashboard/activity")) {
            setActiveTab("activity");
        } else if (path.includes("/dashboard/products")) {
            setActiveTab("products");
        } else if (path.includes("/dashboard/teams")) {
            setActiveTab("teams");
        }
    }, [location]);

    return (
        <ClientOnly>
            <div className={cn("flex flex-wrap p-2 bg-muted rounded-lg", className)}>
                <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/dashboard")}
                >
                    개요
                </Button>
                <Button
                    variant={activeTab === "activity" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/dashboard/activity")}
                >
                    활동
                </Button>
                <Button
                    variant={activeTab === "products" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/dashboard/products")}
                >
                    제품
                </Button>
                <Button
                    variant={activeTab === "teams" ? "default" : "ghost"}
                    className="flex-1 justify-center"
                    onClick={() => navigate("/dashboard/teams")}
                >
                    팀
                </Button>
            </div>
        </ClientOnly>
    );
}