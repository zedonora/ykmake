import { Link } from "@remix-run/react";
import { Users, Bell, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function SettingsIndexPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">설정</h1>
            <p className="text-muted-foreground">
                계정 및 프로필 설정을 관리합니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/profile/settings/account">
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users size={20} className="mr-2" />
                                계정 정보
                            </CardTitle>
                            <CardDescription>
                                프로필 정보, 비밀번호, 계정 삭제 등을 관리합니다.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link to="/profile/settings/notifications">
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bell size={20} className="mr-2" />
                                알림 설정
                            </CardTitle>
                            <CardDescription>
                                이메일, 푸시 알림, 마케팅 수신 등을 설정합니다.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link to="/profile/settings/billing">
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CreditCard size={20} className="mr-2" />
                                결제 정보
                            </CardTitle>
                            <CardDescription>
                                구독, 결제 방법, 결제 내역을 관리합니다.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}