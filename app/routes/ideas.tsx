import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useAuthState } from "~/utils/auth-hooks";
import { getUser } from "~/utils/session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getUser(request);
    return { user };
}

export default function IdeasLayout() {
    const { isLoggedIn, isAdmin } = useAuthState();

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <div className="container py-8">
                <Outlet />
            </div>
        </RootLayout>
    );
} 