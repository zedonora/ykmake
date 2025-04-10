import { json, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { User, Camera } from "lucide-react";
import { getCurrentUser } from "~/lib/data/mock-user";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";

export async function loader() {
    const user = getCurrentUser();
    return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
    // 실제 구현에서는 여기서 사용자 정보 업데이트
    return json({ success: true });
}

export default function AccountSettingsPage() {
    const { user } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    // 이니셜 생성
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>프로필 정보</CardTitle>
                    <CardDescription>
                        다른 사용자에게 표시되는 프로필 정보를 관리합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="avatar">프로필 이미지</Label>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1 text-primary-foreground shadow-sm">
                                        <Camera size={14} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Input id="avatar" name="avatar" type="file" className="hidden" />
                                    <Button type="button" variant="outline" size="sm" onClick={() => {
                                        document.getElementById("avatar")?.click();
                                    }}>
                                        이미지 변경
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPG, PNG, GIF 형식의 5MB 이하 이미지를 업로드하세요.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cover">커버 이미지</Label>
                            <div className="mt-1 relative">
                                <div className="w-full h-24 rounded-md overflow-hidden bg-muted">
                                    {user.coverUrl ? (
                                        <img
                                            src={user.coverUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40" />
                                    )}
                                </div>
                                <div className="mt-2">
                                    <Input id="cover" name="cover" type="file" className="hidden" />
                                    <Button type="button" variant="outline" size="sm" onClick={() => {
                                        document.getElementById("cover")?.click();
                                    }}>
                                        커버 이미지 변경
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user.name}
                                    placeholder="이름을 입력하세요"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">사용자명</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    defaultValue={user.username}
                                    placeholder="사용자명을 입력하세요"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">자기소개</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                defaultValue={user.bio}
                                placeholder="자기소개를 작성하세요"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={user.email}
                                placeholder="이메일을 입력하세요"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">위치</Label>
                            <Input
                                id="location"
                                name="location"
                                defaultValue={user.location}
                                placeholder="위치를 입력하세요"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="skills">기술 스택</Label>
                                <Input
                                    id="skills"
                                    name="skills"
                                    defaultValue={user.skills.join(", ")}
                                    placeholder="기술 스택을 입력하세요 (쉼표로 구분)"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interests">관심사</Label>
                                <Input
                                    id="interests"
                                    name="interests"
                                    defaultValue={user.interests.join(", ")}
                                    placeholder="관심사를 입력하세요 (쉼표로 구분)"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-base font-medium">소셜 미디어 링크</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="website">웹사이트</Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        defaultValue={user.website}
                                        placeholder="https://your-website.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="github">GitHub</Label>
                                    <Input
                                        id="github"
                                        name="github"
                                        defaultValue={user.github}
                                        placeholder="사용자명"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="twitter">Twitter</Label>
                                    <Input
                                        id="twitter"
                                        name="twitter"
                                        defaultValue={user.twitter}
                                        placeholder="사용자명"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <Input
                                        id="linkedin"
                                        name="linkedin"
                                        defaultValue={user.linkedin}
                                        placeholder="사용자명"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "저장 중..." : "변경사항 저장"}
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>비밀번호 변경</CardTitle>
                    <CardDescription>
                        계정 보안을 위해 주기적으로 비밀번호를 변경하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">현재 비밀번호</Label>
                            <Input
                                id="current-password"
                                name="current-password"
                                type="password"
                                placeholder="현재 비밀번호를 입력하세요"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">새 비밀번호</Label>
                                <Input
                                    id="new-password"
                                    name="new-password"
                                    type="password"
                                    placeholder="새 비밀번호를 입력하세요"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">비밀번호 확인</Label>
                                <Input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    placeholder="새 비밀번호를 다시 입력하세요"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" variant="outline">
                                비밀번호 변경
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">계정 삭제</CardTitle>
                    <CardDescription>
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="destructive">계정 삭제</Button>
                </CardFooter>
            </Card>
        </div>
    );
}