import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { db } from "~/lib/drizzle.server";
import { jobs, type Job } from "~/db/schema"; // Job 타입도 import
import { desc, eq, and, or, like, ilike, sql } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { Briefcase, MapPin, DollarSign, Search } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Find Jobs | YkMake" },
    {
      name: "description",
      content: "Search and find your next job opportunity.",
    },
  ];
};

// TODO: 실제 필터링 로직은 추후 구체화
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";
  const jobType = url.searchParams.get("type");
  const locationType = url.searchParams.get("location");
  const salary = url.searchParams.get("salary");

  // Drizzle 쿼리 조건들을 담을 배열
  const conditions = [];
  if (query) {
    conditions.push(or(ilike(jobs.position, `%${query}%`), ilike(jobs.companyName, `%${query}%`), ilike(jobs.overview, `%${query}%`), ilike(jobs.skills, `%${query}%`)));
  }
  if (jobType) {
    conditions.push(eq(jobs.jobType, jobType));
  }
  if (locationType) {
    conditions.push(eq(jobs.jobLocationType, locationType));
  }
  if (salary) {
    conditions.push(eq(jobs.salaryRange, salary));
  }

  const jobList = await db.query.jobs.findMany({
    orderBy: [desc(jobs.createdAt)],
    where: conditions.length > 0 ? and(...conditions) : undefined,
    limit: 20, // 페이지네이션을 위해 추후 수정
  });

  return Response.json({ jobList, query, jobType, locationType, salary });
};

const jobTypeOptions = ["Full-Time", "Part-Time", "Freelance", "Internship"];
const locationTypeOptions = ["Remote", "In-Person", "Hybrid"];
const salaryRangeOptions = [
  "$0 - $50,000",
  "$50,000 - $70,000",
  "$70,000 - $100,000",
  "$100,000 - $120,000",
  "$120,000 - $150,000",
  "$150,000 - $250,000",
  "$250,000 - $500,000",
];

export default function JobsIndexPage() {
  const { jobList, query, jobType, locationType, salary } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleFilterChange = (filterType: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(filterType, value);
    } else {
      newSearchParams.delete(filterType);
    }
    newSearchParams.delete("page"); // 필터 변경 시 페이지 1로 초기화
    setSearchParams(newSearchParams);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (event.target.value) {
      newSearchParams.set("q", event.target.value);
    } else {
      newSearchParams.delete("q");
    }
    newSearchParams.delete("page");
    setSearchParams(newSearchParams);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-center">Jobs</h1>
        <p className="mt-2 text-lg text-muted-foreground text-center">
          Companies looking for makers
        </p>
        <div className="mt-6 max-w-xl mx-auto">
          <form onSubmit={(e) => e.preventDefault()} className="relative">
            <Input
              type="search"
              name="q"
              placeholder="Search by title, company, skills..."
              className="h-11 pl-10 pr-4 w-full rounded-lg bg-background border-border focus:ring-1 focus:ring-primary"
              defaultValue={query}
              onChange={handleSearchChange} // 즉시 URL 변경
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </form>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
        {/* 필터 사이드바 */}
        <aside className="hidden lg:block lg:col-span-1">
          <h3 className="sr-only">Filters</h3>

          <div className="space-y-6 sticky top-20">
            <div>
              <Label htmlFor="filter-type" className="text-base font-semibold">Type</Label>
              <RadioGroup
                id="filter-type"
                defaultValue={jobType || ""}
                onValueChange={(value: string) => handleFilterChange("type", value)}
                className="mt-2 space-y-1"
              >
                {jobTypeOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`type-${option}`} />
                    <Label htmlFor={`type-${option}`} className="font-normal text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <Label htmlFor="filter-location" className="text-base font-semibold">Location</Label>
              <RadioGroup
                id="filter-location"
                defaultValue={locationType || ""}
                onValueChange={(value: string) => handleFilterChange("location", value)}
                className="mt-2 space-y-1"
              >
                {locationTypeOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`location-${option}`} />
                    <Label htmlFor={`location-${option}`} className="font-normal text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <Label htmlFor="filter-salary" className="text-base font-semibold">Salary Range</Label>
              <RadioGroup
                id="filter-salary"
                defaultValue={salary || ""}
                onValueChange={(value: string) => handleFilterChange("salary", value)}
                className="mt-2 space-y-1"
              >
                {salaryRangeOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`salary-${option}`} />
                    <Label htmlFor={`salary-${option}`} className="font-normal text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button variant="outline" onClick={() => setSearchParams("{}")} className="w-full mt-4">
              Clear Filters
            </Button>

          </div>
        </aside>

        {/* 공고 목록 */}
        <main className="lg:col-span-3">
          {jobList.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {jobList.map((job: Job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl hover:underline">
                          <Link to={`/jobs/${job.id}`}>{job.position}</Link>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {job.companyName} - <span className="text-green-600">{job.jobLocationType}</span>
                        </CardDescription>
                      </div>
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={job.companyLogoUrl ?? undefined} alt={job.companyName ?? "Company"} />
                        <AvatarFallback>{job.companyName?.substring(0, 2).toUpperCase() ?? "CO"}</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <MapPin className="mr-1.5 h-4 w-4" /> {job.companyLocation}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <DollarSign className="mr-1.5 h-4 w-4" /> {job.salaryRange}
                    </div>
                    {/* <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {job.overview} 
                    </p> */}
                    <div className="flex space-x-2 mb-4">
                      <Badge variant="secondary">{job.jobType}</Badge>
                      {/* Skills를 Badge로 표시하는 로직 추가 가능 */}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Posted {new Date(job.createdAt).toLocaleDateString()} {/* date-fns 사용 권장 */}
                    </span>
                    <Button asChild size="sm">
                      <Link to={job.applyUrl ?? `/jobs/${job.id}`} target={job.applyUrl ? "_blank" : undefined}>
                        Apply Now
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No jobs found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or check back later.
              </p>
            </div>
          )}
          {/* 페이지네이션 컴포넌트 추가 예정 */}
        </main>
      </div>
    </div>
  );
}
