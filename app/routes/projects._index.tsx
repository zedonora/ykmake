import { Link, useLoaderData } from "@remix-run/react";
import { PlusCircle, TrendingUp, Clock, Flame, Search } from "lucide-react";
import { getLatestProjects, getPopularProjects, getTrendingProjects, getFeaturedProjects, getAllCategories, getAllTags } from "~/lib/data/mock-projects";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProjectCard } from "~/components/cards/project-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import type { Project } from "~/lib/types/project";

export async function loader() {
    const latestProjects = getLatestProjects(6);
    const popularProjects = getPopularProjects(6);
    const trendingProjects = getTrendingProjects(6);
    const featuredProjects = getFeaturedProjects();
    const allCategories = getAllCategories();
    const popularTags = getAllTags().slice(0, 12);

    return Response.json({
        latestProjects,
        popularProjects,
        trendingProjects,
        featuredProjects,
        allCategories,
        popularTags,
    });
}

export default function ProjectsIndexPage() {
    const {
        latestProjects,
        popularProjects,
        trendingProjects,
        featuredProjects,
        allCategories,
        popularTags
    } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="프로젝트 탐색"
                description="다양한 메이커들의 프로젝트를 발견하고 영감을 얻어보세요."
            >
                <div className="flex gap-2">
                    <Button asChild>
                        <Link to="/projects/new" className="inline-flex items-center">
                            <PlusCircle size={16} className="mr-2" />
                            새 프로젝트
                        </Link>
                    </Button>
                    <form action="/projects/search" method="get" className="hidden md:flex">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="프로젝트 검색..."
                                className="pl-8 w-64"
                            />
                        </div>
                    </form>
                </div>
            </PageHeader>

            {featuredProjects.length > 0 && (
                <Section className="bg-muted/20">
                    <h2 className="text-2xl font-bold mb-6">주목할 만한 프로젝트</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProjects.map((project: Project) => (
                            <ProjectCard key={project.id} {...project} />
                        ))}
                    </div>
                </Section>
            )}

            <Section>
                <Tabs defaultValue="latest" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="latest" className="flex items-center">
                            <Clock size={16} className="mr-2" />
                            최신
                        </TabsTrigger>
                        <TabsTrigger value="popular" className="flex items-center">
                            <Flame size={16} className="mr-2" />
                            인기
                        </TabsTrigger>
                        <TabsTrigger value="trending" className="flex items-center">
                            <TrendingUp size={16} className="mr-2" />
                            트렌딩
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="latest" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {latestProjects.map((project: Project) => (
                                <ProjectCard key={project.id} {...project} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="popular" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {popularProjects.map((project: Project) => (
                                <ProjectCard key={project.id} {...project} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="trending" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trendingProjects.map((project: Project) => (
                                <ProjectCard key={project.id} {...project} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </Section>

            <Section className="bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* 카테고리 */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">카테고리별 탐색</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {allCategories.map((category: string) => (
                                <Link
                                    key={category}
                                    to={`/projects/categories/${category.toLowerCase()}`}
                                    className="bg-background hover:bg-primary/5 border rounded-md p-3 transition-colors"
                                >
                                    <span className="font-medium">{category}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 인기 태그 */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">인기 태그</h2>
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map((tag: string) => (
                                <Link key={tag} to={`/projects/tags/${tag.toLowerCase()}`}>
                                    <Badge variant="outline" className="px-3 py-1 text-sm hover:bg-primary/10 cursor-pointer">
                                        {tag}
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}