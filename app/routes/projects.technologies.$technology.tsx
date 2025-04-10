import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProjectCard } from "~/components/cards/project-card";
import { getProjectsByTechnology } from "~/lib/data/mock-projects";
import type { Project } from "~/lib/types/project";

export async function loader({ params }: { params: { technology: string } }) {
    const projects = getProjectsByTechnology(params.technology);
    return Response.json({ projects, technology: params.technology });
}

export default function TechnologyProjectsPage() {
    const { projects, technology } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title={`${technology} 프로젝트`}
                description={`${technology} 기술을 사용한 프로젝트들을 탐색해보세요.`}
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
