import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { ChevronDown, Bell, MessageCircle, FileEdit, User, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { CommandMenu } from "~/components/search/command-menu";
import { ButtonGroup, ActionButtonWrapper, ProfileButtonWrapper } from "~/components/ui/button-layout";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

interface RootLayoutProps {
    children: ReactNode;
    isLoggedIn?: boolean;
    isAdmin?: boolean;
    hideLoginButton?: boolean;
}

export function RootLayout({
    children,
    isLoggedIn = false,
    isAdmin: propIsAdmin,
    hideLoginButton = false,
}: RootLayoutProps) {
    const location = useLocation();
    const isActive = (path: string) => location.pathname.startsWith(path);

    const [isAdmin, setIsAdmin] = useState(propIsAdmin);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && propIsAdmin === undefined) {
            setIsAdmin(localStorage.getItem("isAdmin") === "true");
        } else {
            setIsAdmin(!!propIsAdmin);
        }
    }, [propIsAdmin]);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("isLoggedIn", "false");
            localStorage.setItem("isAdmin", "false");
            setIsAdmin(false);
            window.dispatchEvent(new Event('logoutEvent'));
        }
    };

    const handleLogin = () => {
        // Implement login logic here
    };

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="font-bold text-xl">
                            YkMake
                        </Link>
                        <nav className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            isActive("/products") && "bg-accent",
                                            "flex items-center gap-1"
                                        )}
                                    >
                                        제품 <ChevronDown size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem asChild>
                                        <Link to="/products">모든 제품</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/products/leaderboard">리더보드</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/products/register">제품 등록</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            isActive("/community") && "bg-accent",
                                            "flex items-center gap-1"
                                        )}
                                    >
                                        커뮤니티 <ChevronDown size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem asChild>
                                        <Link to="/community">토론</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/ideas">IdeasGPT</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/jobs">구인/구직</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/teams">팀 찾기</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* 로그인 사용자는 항상 대시보드 접근 가능 */}
                            {isLoggedIn && (
                                <>
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            isActive("/dashboard") && "bg-accent"
                                        )}
                                    >
                                        <Link to="/dashboard">대시보드</Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            isActive("/settings") && "bg-accent"
                                        )}
                                    >
                                        <Link to="/settings">설정</Link>
                                    </Button>
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            asChild
                                            className={cn(
                                                isActive("/admin") && "bg-accent"
                                            )}
                                        >
                                            <Link to="/admin">관리자</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <CommandMenu />

                        {/* 실시간 기능 버튼들 (로그인 사용자에게만 표시) */}
                        {isLoggedIn && (
                            <ButtonGroup className="mx-2" isAdmin={isAdmin}>
                                <ActionButtonWrapper className="mr-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className={cn(
                                            isActive("/notifications") && "bg-accent"
                                        )}
                                    >
                                        <Link to="/notifications" title="알림">
                                            <Bell className="h-5 w-5" />
                                            <span className="sr-only">알림</span>
                                        </Link>
                                    </Button>
                                </ActionButtonWrapper>

                                <ActionButtonWrapper className="mr-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className={cn(
                                            isActive("/chat") && "bg-accent"
                                        )}
                                    >
                                        <Link to="/chat" title="채팅">
                                            <MessageCircle className="h-5 w-5" />
                                            <span className="sr-only">채팅</span>
                                        </Link>
                                    </Button>
                                </ActionButtonWrapper>

                                <ActionButtonWrapper className="mr-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className={cn(
                                            isActive("/collaboration") && "bg-accent",
                                            "mr-4"
                                        )}
                                    >
                                        <Link to="/collaboration" title="협업 편집">
                                            <FileEdit className="h-5 w-5" />
                                            <span className="sr-only">협업 편집</span>
                                        </Link>
                                    </Button>
                                </ActionButtonWrapper>
                            </ButtonGroup>
                        )}

                        {isLoggedIn ? (
                            <ProfileButtonWrapper className="mr-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full relative"
                                    onClick={() => setProfileOpen(!profileOpen)}
                                >
                                    <Avatar>
                                        <AvatarImage src="/user-avatar.png" alt="User" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    {profileOpen && (
                                        <div className="absolute right-0 top-10 min-w-[240px] rounded-md border border-border bg-card p-2 shadow-md z-10">
                                            <ul className="flex flex-col space-y-1">
                                                <li>
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                                                    >
                                                        <User className="h-4 w-4" />
                                                        <span>프로필</span>
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        to="/notifications"
                                                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                                                    >
                                                        <Bell className="h-4 w-4" />
                                                        <span>알림</span>
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        to="/dashboard"
                                                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                                                    >
                                                        <LayoutDashboard className="h-4 w-4" />
                                                        <span>대시보드</span>
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        to="/settings"
                                                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                        <span>설정</span>
                                                    </Link>
                                                </li>
                                                <li className="border-t border-border pt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex w-full items-center gap-2 rounded-md p-2 text-destructive hover:bg-muted"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        <span>로그아웃</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </Button>
                            </ProfileButtonWrapper>
                        ) : (
                            !hideLoginButton && (
                                <ProfileButtonWrapper>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogin}
                                        className="mr-4"
                                    >
                                        로그인
                                    </Button>
                                </ProfileButtonWrapper>
                            )
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="border-t bg-muted/40">
                <div className="container py-8 md:py-12">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div className="space-y-3">
                            <h3 className="text-lg font-medium">YkMake</h3>
                            <p className="text-sm text-muted-foreground">
                                개발자들의 커뮤니티 플랫폼으로, 아이디어부터 제품까지 함께 성장합니다.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-4 text-sm font-medium">제품</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/products" className="text-muted-foreground transition-colors hover:text-foreground">
                                        모든 제품
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/products/leaderboard" className="text-muted-foreground transition-colors hover:text-foreground">
                                        리더보드
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/products/register" className="text-muted-foreground transition-colors hover:text-foreground">
                                        제품 등록
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-sm font-medium">커뮤니티</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/community" className="text-muted-foreground transition-colors hover:text-foreground">
                                        토론
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/ideas" className="text-muted-foreground transition-colors hover:text-foreground">
                                        IdeasGPT
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/jobs" className="text-muted-foreground transition-colors hover:text-foreground">
                                        구인/구직
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/teams" className="text-muted-foreground transition-colors hover:text-foreground">
                                        팀 찾기
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-sm font-medium">회사</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                                        소개
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                                        개인정보처리방침
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                                        이용약관
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} YkMake. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                GitHub
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                Twitter
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}