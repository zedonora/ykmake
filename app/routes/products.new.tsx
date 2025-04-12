import { Form, useActionData, useNavigation } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { prisma } from "~/utils/api.server";
import { requireUser } from "~/utils/api.server";

export async function action({ request }: ActionFunctionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");
    const image = formData.get("image");

    if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof category !== "string"
    ) {
        return new Response(
            JSON.stringify({ errors: { title: "유효하지 않은 입력입니다" } }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const product = await prisma.product.create({
        data: {
            title,
            description,
            category,
            image: typeof image === "string" ? image : undefined,
            author: {
                connect: { id: user.id },
            },
        },
    });

    return redirect(`/products/${product.id}`);
}

export default function NewProductPage() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <>
            <PageHeader
                title="제품 등록"
                description="YkMake 커뮤니티에 새로운 제품을 등록해보세요"
            />

            <Section>
                <Card>
                    <CardHeader>
                        <CardTitle>제품 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form method="post" className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">제품명</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="제품 이름을 입력하세요"
                                        required
                                    />
                                    {actionData?.errors?.title && (
                                        <p className="text-sm text-red-500 mt-1">{actionData.errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">설명</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="제품에 대한 설명을 입력하세요"
                                        rows={5}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">카테고리</Label>
                                    <Select name="category">
                                        <SelectTrigger>
                                            <SelectValue placeholder="선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">선택하세요</SelectItem>
                                            <SelectItem value="AI">AI</SelectItem>
                                            <SelectItem value="웹">웹</SelectItem>
                                            <SelectItem value="모바일">모바일</SelectItem>
                                            <SelectItem value="블록체인">블록체인</SelectItem>
                                            <SelectItem value="게임">게임</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="image">이미지 URL (선택사항)</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        placeholder="제품 이미지 URL"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <a href="/products">취소</a>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "등록 중..." : "등록하기"}
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </Section>
        </>
    );
}
