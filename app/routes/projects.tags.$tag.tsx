import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { ProjectCard } from "~/components/cards/project-card";
import { getProjectsByTag } from "~/lib/data/mock-projects";
import type { Project } from "~/lib/types/project";

export async function loader({ params }: { params: { tag: string } }) {
    const projects = getProjectsByTag(params.tag);
    return Response.json({ projects, tag: params.tag });
}

export default function TagProjectsPage() {
    const { projects, tag } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title={`#${tag} 프로젝트`}
                description={`#${tag} 태그가 포함된 프로젝트들을 탐색해보세요.`}
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
