import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { getProjectBySlug, getAllCategories, getAllTags, getAllTechnologies } from "~/lib/data/mock-projects";
import { getCurrentUser } from "~/lib/data/mock-user";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { PageHeader } from "~/components/layouts/page-header";
import { Badge } from "~/components/ui/badge";
import { X } from "lucide-react";

export async function action({ request, params }: ActionFunctionArgs) {
    // 실제 구현에서는 여기서 데이터를 업데이트합니다.
    // 현재는 임시 데이터만 사용하므로 단순히 리다이렉트만 합니다.
    const { slug } = params;
    return redirect(`/projects/${slug}`);
}

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;

    if (!slug) {
        throw new Response("프로젝트를 찾을 수 없습니다", { status: 404 });
    }

    const project = getProjectBySlug(slug);

    if (!project) {
        throw new Response("프로젝트를 찾을 수 없습니다", { status: 404 });
    }

    const currentUser = getCurrentUser();

    // 프로젝트 작성자만 편집 가능
    if (currentUser.id !== project.authorId) {
        throw new Response("권한이 없습니다", { status: 403 });
    }

    const allCategories = getAllCategories();
    const popularTags = getAllTags().slice(0, 20);
    const allTechnologies = getAllTechnologies();

    return Response.json({
        project,
        allCategories,
        popularTags,
        allTechnologies,
    });
}

export default function EditProjectPage() {
    const { project, allCategories } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <>
            <PageHeader
                title="프로젝트 수정"
                description="프로젝트 정보를 수정하고 업데이트하세요."
            />

            <Section>
                <Form method="post" className="space-y-8">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">프로젝트 제목</Label>
                            <Input
                                id="title"
                                name="title"
                                defaultValue={project.title}
                                placeholder="프로젝트의 제목을 입력하세요"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">프로젝트 설명</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={project.description}
                                placeholder="프로젝트에 대해 간단히 설명해주세요"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="content">프로젝트 내용</Label>
                            <Textarea
                                id="content"
                                name="content"
                                defaultValue={project.content}
                                placeholder="프로젝트의 상세 내용을 입력하세요"
                                required
                                className="min-h-[200px]"
                            />
                        </div>

                        <div>
                            <Label>카테고리</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {project.category && (
                                    <Badge variant="outline" className="cursor-pointer">
                                        {project.category}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>기술 스택</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {project.technologies.map((tech: string) => (
                                    <Badge key={tech} variant="secondary" className="cursor-pointer">
                                        {tech}
                                        <X className="ml-1 h-3 w-3" />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>태그</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {project.tags.map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="cursor-pointer">
                                        #{tag}
                                        <X className="ml-1 h-3 w-3" />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" asChild>
                            <a href={`/projects/${project.slug}`}>취소</a>
                        </Button>
                        <Button type="submit">프로젝트 수정</Button>
                    </div>
                </Form>
            </Section>
        </>
    );
}