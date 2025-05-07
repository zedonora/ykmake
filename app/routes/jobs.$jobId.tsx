import { type LoaderFunctionArgs, type MetaFunction, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { db } from "~/lib/drizzle.server";
import { jobs, type Job, users, type Profile } from "~/db/schema";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Briefcase, CalendarDays, DollarSign, MapPin, UserCircle } from "lucide-react";
import { formatDistanceToNowStrict } from 'date-fns'; // 상대 시간 표시

// loader가 반환할 타입 정의 (선택적이지만 권장)
interface LoaderData {
  job: Job & { companyProfile?: Profile | null }; // 회사 프로필 정보 추가 가능성
  // TODO: 현재 로그인한 사용자 정보도 넘겨서 'Apply Now' 버튼 로직 등에 활용 가능
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.jobId, "Missing jobId parameter");
  const jobId = parseInt(params.jobId, 10);

  if (isNaN(jobId)) {
    throw new Response("Invalid Job ID", { status: 400 });
  }

  const jobDetail = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
    // TODO: 회사 정보(profiles 테이블)를 join 해서 가져올 수 있음
    // with: {
    //   user: { // jobs 테이블의 userId가 실제로는 회사(profile)의 ID를 가리킨다고 가정
    //     with: {
    //       profile: true, // 이 부분은 실제 스키마 관계에 따라 수정 필요
    //     }
    //   }
    // }
  });

  if (!jobDetail) {
    throw new Response("Job not found", { status: 404 });
  }

  // 타입 단언을 사용하여 companyProfile 추가 (실제로는 join 결과를 사용해야 함)
  const jobWithPotentiallyCompanyInfo = jobDetail as LoaderData['job'];

  return json<LoaderData>({ job: jobWithPotentiallyCompanyInfo });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const jobTitle = data?.job?.position || "Job Details";
  const companyName = data?.job?.companyName || "Company";
  return [
    { title: `${jobTitle} at ${companyName} | YkMake Jobs` },
    { name: "description", content: data?.job?.overview?.substring(0, 150) || "View job details" },
  ];
};

export default function JobDetailPage() {
  const { job } = useLoaderData<typeof loader>();
  // const params = useParams(); // jobId는 params.jobId로 접근 가능

  // responsibilities, qualifications, benefits를 쉼표 기준으로 배열로 변환 (저장 방식에 따라 수정)
  const responsibilitiesList = job.responsibilities?.split('\n').map(s => s.trim()).filter(Boolean) || [];
  const qualificationsList = job.qualifications?.split('\n').map(s => s.trim()).filter(Boolean) || [];
  const benefitsList = job.benefits?.split('\n').map(s => s.trim()).filter(Boolean) || [];
  const skillsList = job.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
        {/* 상단 헤더 섹션 */}
        <div className="bg-card p-6 md:p-8 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-primary/20">
              <AvatarImage src={job.companyLogoUrl ?? undefined} alt={job.companyName ?? "Company"} />
              <AvatarFallback className="text-3xl">
                {job.companyName?.substring(0, 1).toUpperCase() ?? "C"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{job.position}</h1>
              <p className="text-lg text-muted-foreground mt-1">{job.companyName}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center"><MapPin className="mr-1.5 h-4 w-4" />{job.companyLocation}</span>
                <span className="flex items-center"><Briefcase className="mr-1.5 h-4 w-4" />{job.jobType}</span>
                {job.jobLocationType && <span className="flex items-center"><UserCircle className="mr-1.5 h-4 w-4" />{job.jobLocationType}</span>}
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-2 shrink-0">
              <Button asChild size="lg" className="w-full md:w-auto">
                <Link to={job.applyUrl || "#"} target={job.applyUrl ? "_blank" : "_self"} rel={job.applyUrl ? "noopener noreferrer" : ""}>
                  Apply Now
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Posted {formatDistanceToNowStrict(new Date(job.createdAt))} ago
              </p>
              {job.status === "Closed" && (
                <Badge variant="destructive" className="mt-1">Applications Closed</Badge>
              )}
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 (2단 그리드) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 좌측: 상세 정보 */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-3">Overview</h2>
              <p className="text-muted-foreground whitespace-pre-line">{job.overview}</p>
            </div>

            {responsibilitiesList.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Responsibilities</h2>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {responsibilitiesList.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            )}

            {qualificationsList.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Qualifications</h2>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {qualificationsList.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            )}

            {benefitsList.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Benefits</h2>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {benefitsList.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* 우측: 요약 정보 및 기술 스택 */}
          <aside className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Salary</span>
                  <span className="font-medium">{job.salaryRange}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{job.companyLocation}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{job.jobType}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span className="font-medium">{new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {job.status === "Closed" && (
                  <>
                    <Separator />
                    <div className="flex justify-center pt-2">
                      <Badge variant="destructive" className="text-sm">Applications Closed</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {skillsList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Skills</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {skillsList.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
} 