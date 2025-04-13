import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
    isAdmin?: boolean;
}

/**
 * 일관된 간격을 가진 버튼 그룹을 위한 컴포넌트
 * 관리자 모드일 경우 더 넓은 간격을 제공합니다.
 */
export function ButtonGroup({ children, className, isAdmin = false }: ButtonGroupProps) {
    return (
        <div className={cn(
            "flex items-center",
            isAdmin ? "gap-5" : "gap-4",
            className
        )}>
            {children}
        </div>
    );
}

interface ProfileButtonWrapperProps {
    children: ReactNode;
    className?: string;
    isAdmin?: boolean;
}

/**
 * 프로필 버튼 주변 래퍼 컴포넌트
 * 모든 프로필/사용자 관련 버튼에 일관된 마진을 적용합니다.
 * 관리자 모드일 경우 더 넓은 간격을 제공합니다.
 */
export function ProfileButtonWrapper({ children, className, isAdmin = false }: ProfileButtonWrapperProps) {
    return (
        <div className={cn(
            "relative",
            isAdmin ? "ml-8" : "ml-6",
            className
        )}>
            {children}
        </div>
    );
}

interface ActionButtonWrapperProps {
    children: ReactNode;
    className?: string;
}

/**
 * 액션 버튼(수정, 알림, 채팅 등) 래퍼 컴포넌트
 * 프로필 버튼과의 간격을 일관되게 유지합니다.
 */
export function ActionButtonWrapper({ children, className }: ActionButtonWrapperProps) {
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
} 