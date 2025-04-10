import { Outlet, Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Users, Bell, CreditCard } from "lucide-react";
import { Section } from "~/components/layouts/section";
import { RootLayout } from "~/components/layouts/root-layout";

export default function ProfileSettingsLayout() {
    const location = useLocation();
    const currentPath = location.pathname;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
        const loginState = localStorage.getItem("isLoggedIn");
        const adminState = localStorage.getItem("isAdmin");

        setIsLoggedIn(loginState === "true");
        setIsAdmin(adminState === "true");
    }, []);

    const isActive = (path: string) => {
        return currentPath === path;
    };

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <Section>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* 좌측 사이드바 - 설정 메뉴 */}
                    <div className="md:col-span-1">
                        <nav className="space-y-1">
                            <Link
                                to="/profile/settings/account"
                                className={`flex items-center px-4 py-2 rounded-md ${isActive("/profile/settings/account")
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                <Users size={16} className="mr-2" />
                                계정 정보
                            </Link>
                            <Link
                                to="/profile/settings/notifications"
                                className={`flex items-center px-4 py-2 rounded-md ${isActive("/profile/settings/notifications")
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                <Bell size={16} className="mr-2" />
                                알림 설정
                            </Link>
                            <Link
                                to="/profile/settings/billing"
                                className={`flex items-center px-4 py-2 rounded-md ${isActive("/profile/settings/billing")
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                <CreditCard size={16} className="mr-2" />
                                결제 정보
                            </Link>
                        </nav>
                    </div>

                    {/* 우측 메인 - 설정 컨텐츠 */}
                    <div className="md:col-span-3">
                        <Outlet />
                    </div>
                </div>
            </Section>
        </RootLayout>
    );
}