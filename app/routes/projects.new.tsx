import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { PageHeader } from "~/components/layouts/page-header";
import { Badge } from "~/components/ui/badge";
import { X } from "lucide-react";
import { getAllCategories, getAllTags, getAllTechnologies } from "~/lib/data/mock-projects";
import { getCurrentUser } from "~/lib/data/mock-user";

export async function action({ request }: ActionFunctionArgs) {
    // 실제 구현에서는 여기서 데이터를 저장합니다.
    // 현재는 임시 데이터만 사용하므로 단순히 리다이렉트만 합니다.
    return redirect("/projects");
}

export async function loader() {
    const user = getCurrentUser();
    const allCategories = getAllCategories();
    const popularTags = getAllTags().slice(0, 20); // 상위 20개 태그만 표시
    const allTechnologies = getAllTechnologies();

    return Response.json({
        user,
        allCategories,
        popularTags,
        allTechnologies,
    });
}

export default function NewProjectPage() {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <>
            <PageHeader
                title="새 프로젝트"
                description="당신의 프로젝트를 공유하고 다른 메이커들과 소통해보세요."
            />

            <Section>
                <Form method="post" className="space-y-8">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">프로젝트 제목</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="프로젝트의 제목을 입력하세요"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">프로젝트 설명</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="프로젝트에 대해 간단히 설명해주세요"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="content">프로젝트 내용</Label>
                            <Textarea
                                id="content"
                                name="content"
                                placeholder="프로젝트의 상세 내용을 입력하세요"
                                required
                                className="min-h-[200px]"
                            />
                        </div>

                        <div>
                            <Label>카테고리</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="cursor-pointer">
                                    웹 개발
                                </Badge>
                                <Badge variant="outline" className="cursor-pointer">
                                    모바일 앱
                                </Badge>
                                <Badge variant="outline" className="cursor-pointer">
                                    하드웨어
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <Label>기술 스택</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary" className="cursor-pointer">
                                    React
                                    <X className="ml-1 h-3 w-3" />
                                </Badge>
                                <Badge variant="secondary" className="cursor-pointer">
                                    TypeScript
                                    <X className="ml-1 h-3 w-3" />
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <Label>태그</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="cursor-pointer">
                                    #메이커
                                    <X className="ml-1 h-3 w-3" />
                                </Badge>
                                <Badge variant="outline" className="cursor-pointer">
                                    #스타트업
                                    <X className="ml-1 h-3 w-3" />
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">프로젝트 생성</Button>
                    </div>
                </Form>
            </Section>
        </>
    );
}