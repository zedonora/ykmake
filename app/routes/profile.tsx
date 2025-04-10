import { Outlet, Link, useLocation } from "@remix-run/react";
import { User, Settings } from "lucide-react";
import { RootLayout } from "~/components/layouts/root-layout";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";

export default function ProfileLayout() {
    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path: string) => {
        return currentPath === path;
    };

    return (
        <RootLayout>
            <PageHeader
                title="프로필"
                description="내 프로필과 계정 설정을 관리합니다."
            />

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* 좌측 사이드바 - 프로필 메뉴 */}
                    <div className="md:col-span-1">
                        <nav className="space-y-1">
                            <Link
                                to="/profile"
                                className={`flex items-center px-4 py-2 rounded-md ${isActive("/profile")
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                <User size={16} className="mr-2" />
                                프로필
                            </Link>
                            <Link
                                to="/profile/settings"
                                className={`flex items-center px-4 py-2 rounded-md ${currentPath.startsWith("/profile/settings")
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                <Settings size={16} className="mr-2" />
                                설정
                            </Link>
                        </nav>
                    </div>

                    {/* 우측 메인 - 컨텐츠 */}
                    <div className="md:col-span-3">
                        <Outlet />
                    </div>
                </div>
            </Section>
        </RootLayout>
    );
}