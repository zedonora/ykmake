import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";

export default function TeamsLayout() {
    return (
        <RootLayout>
            <Outlet />
        </RootLayout>
    );
}