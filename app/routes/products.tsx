import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useEffect, useState } from "react";
import ClientOnly from "~/components/ui/client-only";
import { getUser } from "~/utils/session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getUser(request);
    return { user };
}

export default function ProductsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <ClientOnly fallback={null}>
                {() => {
                    useEffect(() => {
                        // 로컬 스토리지에서 로그인 상태 및 관리자 상태 가져오기
                        const loginState = localStorage.getItem("isLoggedIn");
                        const adminState = localStorage.getItem("isAdmin");

                        setIsLoggedIn(loginState === "true");
                        setIsAdmin(adminState === "true");

                        // 로그아웃 이벤트 리스너 추가
                        const handleLogout = () => {
                            setIsLoggedIn(false);
                            setIsAdmin(false);
                        };

                        window.addEventListener('logoutEvent', handleLogout);

                        // 컴포넌트 언마운트 시 이벤트 리스너 제거
                        return () => {
                            window.removeEventListener('logoutEvent', handleLogout);
                        };
                    }, []);

                    return null;
                }}
            </ClientOnly>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
} 