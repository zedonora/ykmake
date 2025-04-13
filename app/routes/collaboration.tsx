import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";

export default function CollaborationLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
}