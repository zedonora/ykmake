import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import { DashboardNav } from "~/components/dashboard/dashboard-nav";
import { RootLayout } from "~/components/layouts/root-layout";

export default function DashboardLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");

        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <div className="bg-muted mb-8 rounded-lg overflow-hidden">
                    <DashboardNav />
                </div>
                <Outlet />
            </div>
        </RootLayout>
    );
}