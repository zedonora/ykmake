import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const meta: MetaFunction = () => {
    return [
        { title: "OTP 인증 - YkMake" },
        { name: "description", content: "OTP 코드를 입력하세요" },
    ];
};

export default function OTP() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        OTP 인증
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        이메일로 전송된 6자리 코드를 입력하세요
                    </p>
                </div>

                <Card className="p-6">
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">OTP 코드</Label>
                            <div className="flex gap-2">
                                {[...Array(6)].map((_, i) => (
                                    <Input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        className="text-center"
                                        required
                                    />
                                ))}
                            </div>
                        </div>
                        <Button className="w-full" type="submit">
                            인증하기
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        코드를 받지 못하셨나요?{" "}
                        <Button variant="link" className="p-0">
                            다시 보내기
                        </Button>
                    </p>
                </Card>
            </div>
        </div>
    );
} 