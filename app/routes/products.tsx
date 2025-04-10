import { Outlet } from "@remix-run/react";
import { RootLayout } from "~/components/layouts/root-layout";
import { useEffect, useState } from "react";

export default function ProductsLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
            setIsAdmin(localStorage.getItem("isAdmin") === "true");
        }
    }, []);

    return (
        <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <Outlet />
        </RootLayout>
    );
} 