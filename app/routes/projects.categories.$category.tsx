import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProjectCard } from "~/components/cards/project-card";
import { getProjectsByCategory } from "~/lib/data/mock-projects";
import type { Project } from "~/lib/types/project";

export async function loader({ params }: { params: { category: string } }) {
    const projects = getProjectsByCategory(params.category);
    return Response.json({ projects, category: params.category });
}

export default function CategoryProjectsPage() {
    const { projects, category } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title={`${category} 프로젝트`}
                description={`${category} 카테고리의 프로젝트들을 탐색해보세요.`}
            />

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project: Project) => (
                        <ProjectCard key={project.id} {...project} />
                    ))}
                </div>
            </Section>
        </>
    );
}