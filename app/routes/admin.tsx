import { Outlet, useNavigate } from "@remix-run/react";
import { AdminNav } from "~/components/admin/admin-nav";
import { useEffect, useState } from "react";
import { RootLayout } from "~/components/layouts/root-layout";

export default function AdminLayout() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");

        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");

        // 관리자가 아니면 홈으로 리다이렉트
        if (adminState !== "true") {
            navigate("/");
        }
    }, [navigate]);

    // 관리자가 아닌 경우 접근 거부 메시지 표시
    if (!isAdmin) {
        return (
            <RootLayout isLoggedIn={isLoggedIn} isAdmin={false}>
                <div className="container py-8">
                    <div className="text-center p-8">
                        <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
                        <p className="text-muted-foreground">이 페이지는 관리자만 접근할 수 있습니다.</p>
                    </div>
                </div>
            </RootLayout>
        );
    }

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <div className="mb-8">
                    <AdminNav />
                </div>
                <Outlet />
            </div>
        </RootLayout>
    );
}