import { Link, useLoaderData } from "@remix-run/react";
import { Image } from "lucide-react";
import { getProjectBySlug } from "~/lib/data/mock-projects";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export async function loader({ params }: { params: { slug: string } }) {
    const project = getProjectBySlug(params.slug);
    if (!project) {
        throw new Response("Not Found", { status: 404 });
    }
    return Response.json({ project });
}

export default function ProjectDetailPage() {
    const { project } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title={project.title}
                description={project.description}
            >
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/projects/${project.slug}/edit`}>
                            프로젝트 수정
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 프로젝트 정보 */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            {project.thumbnailUrl ? (
                                <img
                                    src={project.thumbnailUrl}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image className="w-12 h-12 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        <div className="prose max-w-none">
                            <h2>프로젝트 소개</h2>
                            <p>{project.content}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">기술 스택</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech: string) => (
                                    <Badge key={tech} variant="secondary">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 사이드바 */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage src={project.authorImageUrl} />
                                        <AvatarFallback>
                                            {project.authorName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{project.authorName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {project.createdAt}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">카테고리</p>
                                        <p className="font-medium">{project.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">상태</p>
                                        <Badge variant="outline">{project.status}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">태그</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {project.tags.map((tag: string) => (
                                                <Badge key={tag} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">프로젝트 통계</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">조회수</p>
                                        <p className="text-2xl font-bold">{project.views}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">좋아요</p>
                                        <p className="text-2xl font-bold">{project.likes}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Section>
        </>
    );
}