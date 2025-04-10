import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";

export default function JobsLayout() {
    return (
        <RootLayout>
            <Outlet />
        </RootLayout>
    );
}