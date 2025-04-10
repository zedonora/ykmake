import { json, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { CreditCard, Plus, Trash2, CreditCard as CardIcon, Wallet, Building2 } from "lucide-react";
import { getUserPaymentMethods, getUserSubscription } from "~/lib/data/mock-user";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

export async function loader() {
    const paymentMethods = getUserPaymentMethods();
    const subscription = getUserSubscription();
    return json({ paymentMethods, subscription });
}

export async function action({ request }: ActionFunctionArgs) {
    // 실제 구현에서는 여기서 결제 정보 업데이트
    return json({ success: true });
}

export default function BillingSettingsPage() {
    const { paymentMethods, subscription } = useLoaderData<typeof loader>();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>구독 정보</CardTitle>
                    <CardDescription>
                        현재 구독 상태와 결제 정보를 확인합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">현재 플랜</h3>
                                <p className="text-sm text-muted-foreground">
                                    {subscription.plan === "free" ? "무료" :
                                        subscription.plan === "basic" ? "기본" :
                                            subscription.plan === "pro" ? "프로" : "엔터프라이즈"} 플랜
                                </p>
                            </div>
                            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                                {subscription.status === "active" ? "활성" :
                                    subscription.status === "canceled" ? "취소됨" :
                                        subscription.status === "expired" ? "만료됨" : "체험"}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium">다음 결제일</h3>
                                <p className="text-sm text-muted-foreground">
                                    {subscription.renewalDate}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium">결제 금액</h3>
                                <p className="text-sm text-muted-foreground">
                                    {subscription.price.toLocaleString()}원 / {subscription.interval === "monthly" ? "월" : "년"}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm">
                                플랜 변경
                            </Button>
                            {subscription.status === "active" && (
                                <Button variant="destructive" size="sm">
                                    구독 취소
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>결제 방법</CardTitle>
                    <CardDescription>
                        결제에 사용할 수 있는 카드와 계정을 관리합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    {method.type === "card" ? (
                                        <CardIcon size={24} className="text-muted-foreground" />
                                    ) : method.type === "paypal" ? (
                                        <Wallet size={24} className="text-muted-foreground" />
                                    ) : (
                                        <Building2 size={24} className="text-muted-foreground" />
                                    )}
                                    <div>
                                        <div className="font-medium">{method.name}</div>
                                        {method.type === "card" && (
                                            <div className="text-sm text-muted-foreground">
                                                •••• {method.last4} | 만료일 {method.expiryDate}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {method.isDefault && (
                                        <Badge variant="secondary">기본</Badge>
                                    )}
                                    <Button variant="ghost" size="icon">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" className="w-full">
                            <Plus size={16} className="mr-2" />
                            결제 방법 추가
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>결제 내역</CardTitle>
                    <CardDescription>
                        지난 12개월간의 결제 내역을 확인합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <div className="font-medium">2024년 3월</div>
                                <div className="text-sm text-muted-foreground">
                                    {subscription.plan === "free" ? "무료" :
                                        subscription.plan === "basic" ? "기본" :
                                            subscription.plan === "pro" ? "프로" : "엔터프라이즈"} 플랜
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">
                                    {subscription.price.toLocaleString()}원
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {subscription.interval === "monthly" ? "월간" : "연간"} 결제
                                </div>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full">
                            전체 결제 내역 보기
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}