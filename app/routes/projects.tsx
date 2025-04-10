import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";

export default function ProjectsLayout() {
    return (
        <RootLayout>
            <Outlet />
        </RootLayout>
    );
} 