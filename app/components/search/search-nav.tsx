import { useLocation, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import ClientOnly from "~/components/ui/client-only";

interface SearchNavProps {
    className?: string;
}

export function SearchNav({ className }: SearchNavProps) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        const path = location.pathname;
        if (path === "/search") {
            setActiveTab("all");
        } else if (path.includes("/search/products")) {
            setActiveTab("products");
        } else if (path.includes("/search/teams")) {
            setActiveTab("teams");
        } else if (path.includes("/search/users")) {
            setActiveTab("users");
        }
    }, [location]);

    return (
        <ClientOnly>
            <div className={cn("flex flex-wrap p-2 bg-muted rounded-lg", className)}>
                <Button
                    variant={activeTab === "all" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/search">전체</Link>
                </Button>
                <Button
                    variant={activeTab === "products" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/search/products">제품</Link>
                </Button>
                <Button
                    variant={activeTab === "teams" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/search/teams">팀</Link>
                </Button>
                <Button
                    variant={activeTab === "users" ? "default" : "ghost"}
                    asChild
                    className="flex-1 justify-center"
                >
                    <Link to="/search/users">사용자</Link>
                </Button>
            </div>
        </ClientOnly>
    );
}
