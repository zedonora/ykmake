import { useState, useEffect } from "react";

/**
 * 로그인 및 관리자 상태를 관리하는 커스텀 훅
 * 모든 레이아웃 컴포넌트에서 공통으로 사용할 수 있습니다.
 */
export function useAuthState() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 확인
        if (typeof window === "undefined") return;

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

    return { isLoggedIn, isAdmin };
} 