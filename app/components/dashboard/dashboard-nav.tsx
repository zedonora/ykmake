import { useLocation, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import ClientOnly from "~/components/ui/client-only";

interface DashboardNavProps {
    className?: string;
}

export function DashboardNav({ className }: DashboardNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        const path = location.pathname;
        if (path === "/dashboard") {
            setActiveTab("overview");
        } else if (path.includes("/dashboard/products")) {
            setActiveTab("products");
        } else if (path.includes("/dashboard/teams")) {
            setActiveTab("teams");
        } else if (path.includes("/dashboard/activity")) {
            setActiveTab("activity");
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
                    <Link to="/dashboard">개요</Link>
                </Button>
                <Button
                    variant={activeTab === "products" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/dashboard/products">제품</Link>
                </Button>
                <Button
                    variant={activeTab === "teams" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/dashboard/teams">팀</Link>
                </Button>
                <Button
                    variant={activeTab === "activity" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/dashboard/activity">활동</Link>
                </Button>
            </div>
        </ClientOnly>
    );
}