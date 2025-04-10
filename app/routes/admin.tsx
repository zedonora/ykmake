import { Outlet, useNavigate } from "@remix-run/react";
import { AdminNav } from "~/components/admin/admin-nav";
import { useEffect, useState } from "react";
import { RootLayout } from "~/components/layouts/root-layout";

export default function AdminLayout() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const adminStatus = localStorage.getItem("isAdmin") === "true";
            setIsAdmin(adminStatus);

            // 관리자가 아니면 홈으로 리다이렉트
            if (!adminStatus) {
                navigate("/");
            }
        }
    }, [navigate]);

    // 관리자가 아닌 경우 null 반환하여 컨텐츠를 렌더링하지 않음
    if (!isAdmin) return null;

    return (
        <RootLayout isLoggedIn={true} isAdmin={isAdmin}>
            <div className="container py-8">
                <div className="border-b pb-4 mb-8">
                    <AdminNav />
                </div>
                <Outlet />
            </div>
        </RootLayout>
    );
}