import { useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { JobCard } from "~/components/cards/job-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { getAllJobs } from "~/lib/data/mock-jobs";
import type { Job } from "~/lib/types/job";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "구인/구직 - YkMake" },
        { name: "description", content: "YkMake에서 함께할 동료를 찾아보세요" },
    ];
};

export async function loader() {
    const jobs = getAllJobs();
    return Response.json({ jobs });
}

export default function JobsIndex() {
    const { jobs } = useLoaderData<typeof loader>();

    return (
        <>
            <PageHeader
                title="구인/구직"
                description="YkMake에서 함께할 동료를 찾아보세요"
            >
                <Button size="lg" asChild>
                    <a href="/jobs/new">구인 공고 등록</a>
                </Button>
            </PageHeader>

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Input placeholder="검색어를 입력하세요" />
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="모든 직무" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">모든 직무</SelectItem>
                            <SelectItem value="frontend">프론트엔드</SelectItem>
                            <SelectItem value="backend">백엔드</SelectItem>
                            <SelectItem value="fullstack">풀스택</SelectItem>
                            <SelectItem value="mobile">모바일</SelectItem>
                            <SelectItem value="devops">DevOps</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="모든 지역" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">모든 지역</SelectItem>
                            <SelectItem value="seoul">서울</SelectItem>
                            <SelectItem value="gyeonggi">경기</SelectItem>
                            <SelectItem value="remote">원격</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job: Job) => (
                        <JobCard key={job.id} {...job} />
                    ))}
                </div>
            </Section>
        </>
    );
}
