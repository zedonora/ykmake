import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getJobById } from "~/lib/data/mock-jobs";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data || !data.job) {
        return [
            { title: "Job Not Found - YkMake" },
            { name: "description", content: "This job posting could not be found" },
        ];
    }

    return [
        { title: `${data.job.title} - ${data.job.company} - YkMake` },
        { name: "description", content: data.job.description },
    ];
};

export async function loader({ params }: LoaderFunctionArgs) {
    const job = getJobById(params.jobId as string);

    if (!job) {
        throw new Response("Job not found", { status: 404 });
    }

    return Response.json({ job });
}

export default function JobDetail() {
    const { job } = useLoaderData<typeof loader>();

    // 회사 이니셜
    const companyInitials = job.company
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            <PageHeader
                title={job.title}
                description={job.company}
            >
                <Button size="lg">지원하기</Button>
            </PageHeader>

            <Section>
                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={job.companyLogo} alt={job.company} />
                            <AvatarFallback>{companyInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold">{job.company}</h2>
                            <p className="text-muted-foreground">{job.location} · {job.type}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                            <h3 className="font-semibold mb-1">근무 형태</h3>
                            <p>{job.type}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">연봉</h3>
                            <p>{job.salary}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">근무 지역</h3>
                            <p>{job.location}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">경력</h3>
                            <p>{job.experienceLevel}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">주요 업무</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            {job.responsibilities.map((responsibility: string, index: number) => (
                                <li key={index}>{responsibility}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">자격 요건</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            {job.requirements.map((requirement: string, index: number) => (
                                <li key={index}>{requirement}</li>
                            ))}
                        </ul>
                    </div>

                    {job.benefits && job.benefits.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">혜택 및 복지</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                {job.benefits.map((benefit: string, index: number) => (
                                    <li key={index}>{benefit}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">기술 스택</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.tags.map((tag: string, index: number) => (
                                <Badge key={index}>{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button size="lg">지원하기</Button>
                    </div>
                </Card>
            </Section>
        </>
    );
}