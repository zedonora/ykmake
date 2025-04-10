import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export const meta: MetaFunction = () => {
    return [
        { title: "프로필 편집 - YkMake" },
        { name: "description", content: "프로필 정보를 수정하세요" },
    ];
};

export default function ProfileEdit() {
    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        프로필 편집
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        프로필 정보를 수정하세요
                    </p>
                </div>

                <Card className="p-6">
                    <form className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <Button variant="outline">프로필 이미지 변경</Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    placeholder="이름을 입력하세요"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">자기소개</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="자기소개를 입력하세요"
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">웹사이트</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">기술 스택</Label>
                                <Input
                                    id="skills"
                                    placeholder="기술 스택을 입력하세요 (쉼표로 구분)"
                                />
                            </div>
                        </div>

                        <Button className="w-full" type="submit">
                            저장하기
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
} 