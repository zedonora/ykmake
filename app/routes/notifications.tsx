import { Outlet } from "@remix-run/react";

export default function NotificationsLayout() {
    return (
        <div className="container py-8">
            <Outlet />
        </div>
    );
}