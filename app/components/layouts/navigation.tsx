import { useState } from "react";
import { Link } from "@remix-run/react";
import { Menu, X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface NavigationProps {
    isLoggedIn?: boolean;
}

export function Navigation({ isLoggedIn = false }: NavigationProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link to="/" className="font-bold text-xl">YkMake</Link>
                    <nav className="hidden md:flex gap-6">
                        <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">제품</Link>
                        <Link to="/community" className="text-sm font-medium transition-colors hover:text-primary">커뮤니티</Link>
                        <Link to="/ideas" className="text-sm font-medium transition-colors hover:text-primary">IdeasGPT</Link>
                        <Link to="/jobs" className="text-sm font-medium transition-colors hover:text-primary">구인/구직</Link>
                        <Link to="/teams" className="text-sm font-medium transition-colors hover:text-primary">팀</Link>
                    </nav>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <Link to="/notifications" className="text-sm font-medium">
                                알림
                            </Link>
                            <Link to="/dashboard">
                                <Button variant="outline" size="sm">대시보드</Button>
                            </Link>
                            <Link to="/profile">
                                <Button size="sm">프로필</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/auth/login">
                                <Button variant="outline" size="sm">로그인</Button>
                            </Link>
                            <Link to="/auth/register">
                                <Button size="sm">회원가입</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* 모바일 메뉴 버튼 */}
                <button
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* 모바일 메뉴 */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t">
                    <div className="container py-4 flex flex-col space-y-4">
                        <Link to="/products" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">제품</Link>
                        <Link to="/community" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">커뮤니티</Link>
                        <Link to="/ideas" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">IdeasGPT</Link>
                        <Link to="/jobs" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">구인/구직</Link>
                        <Link to="/teams" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">팀</Link>

                        <div className="pt-4 border-t flex flex-col gap-2">
                            {isLoggedIn ? (
                                <>
                                    <Link to="/notifications" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">알림</Link>
                                    <Link to="/dashboard" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">대시보드</Link>
                                    <Link to="/profile" className="text-sm font-medium py-2 px-3 hover:bg-muted rounded-md">프로필</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/auth/login" className="w-full">
                                        <Button variant="outline" className="w-full">로그인</Button>
                                    </Link>
                                    <Link to="/auth/register" className="w-full">
                                        <Button className="w-full">회원가입</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}