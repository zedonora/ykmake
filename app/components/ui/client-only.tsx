'use client';

import { useEffect, useState, type ReactNode } from "react";

interface ClientOnlyProps {
    children: ReactNode | (() => ReactNode);
    fallback?: ReactNode;
}

/**
 * 클라이언트 측에서만 렌더링되는 컴포넌트입니다.
 * 서버 사이드 렌더링 중에는 fallback을 렌더링하거나 아무것도 렌더링하지 않습니다.
 */
export default function ClientOnly({
    children,
    fallback = null,
}: ClientOnlyProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{fallback}</>;
    }

    return <>{typeof children === 'function' ? children() : children}</>;
} 