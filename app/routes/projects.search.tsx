import { Form, useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Input } from "~/components/ui/input";
import { ProjectCard } from "~/components/cards/project-card";
import { searchProjects } from "~/lib/data/mock-projects";
import type { Project } from "~/lib/types/project";

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const projects = searchProjects(query);
    return Response.json({ projects, query });
}

export default function SearchProjectsPage() {
    const { projects, query } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="프로젝트 검색"
                description="관심 있는 프로젝트를 검색해보세요."
            />

            <Section>
                <Form method="get" className="mb-8">
                    <Input
                        type="search"
                        name="q"
                        placeholder="프로젝트 검색..."
                        defaultValue={query}
                        className="max-w-md"
                    />
                </Form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project: Project) => (
                        <ProjectCard key={project.id} {...project} />
                    ))}
                </div>
            </Section>
        </>
    );
}