import { type ActionFunctionArgs, type MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { db } from "~/lib/drizzle.server";
import { jobs, NewJob } from "~/db/schema";
import { cn } from "~/lib/utils";
import { JobPostSchema, type JobPostFormData } from "~/lib/schemas/job.schema";

// Action 반환 타입을 위한 인터페이스 정의
interface ActionData {
  errors?: ZodErrorFlat | { _form?: string[] };
}

// ZodErrorFlat 타입을 좀 더 명확하게 정의 (필요시 Zod에서 직접 가져올 수 있음)
interface ZodErrorFlat {
  formErrors: string[];
  fieldErrors: {
    [key: string]: string[] | undefined;
  };
}

export const meta: MetaFunction = () => {
  return [
    { title: "Post a Job | YkMake" },
    { name: "description", content: "Reach out to the best developers in the world." },
  ];
};

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const { supabase, headers } = await createSupabaseServerClient(request);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return redirect("/login?redirectTo=/jobs/new");
  }

  const formData = await request.formData();
  const submission = JobPostSchema.safeParse(Object.fromEntries(formData));

  if (!submission.success) {
    // return json({ errors: submission.error.flatten() }, { status: 400, headers });
    return Response.json({ errors: submission.error.flatten() } as ActionData, { status: 400, headers });
  }

  try {
    const newJobData: NewJob = {
      ...submission.data,
      userId: user.id, // 현재 로그인한 사용자 ID 추가
      // responsibilities, qualifications, benefits, skills는 텍스트로 저장되므로 별도 변환 불필요
    };

    const insertedJobs = await db.insert(jobs).values(newJobData).returning({ insertedId: jobs.id });
    const jobId = insertedJobs[0]?.insertedId;

    if (jobId) {
      return redirect(`/jobs/${jobId}`, { headers });
    } else {
      throw new Error("Failed to get inserted job ID");
    }

  } catch (error) {
    console.error("Error creating job post:", error);
    // return json({ errors: { _form: ["An error occurred while posting the job. Please try again."] } }, { status: 500, headers });
    return Response.json({ errors: { _form: ["An error occurred while posting the job. Please try again."] } } as ActionData, { status: 500, headers });
  }
};

const jobTypeOptions = ["Full-Time", "Part-Time", "Freelance", "Internship"];
const jobLocationTypeOptions = ["Remote", "In-Person", "Hybrid"];
const salaryRangeOptions = [
  "$0 - $50,000", "$50,000 - $70,000", "$70,000 - $100,000",
  "$100,000 - $120,000", "$120,000 - $150,000", "$150,000 - $250,000",
  "$250,000 - $500,000"
];

export default function PostJobPage() {
  const actionData = useActionData<ActionData>(); // 명시적 타입 사용
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Helper to get error for a field
  const getError = (field: keyof JobPostFormData | "_form") => {
    if (!actionData?.errors) return undefined;

    // _form 에러 처리 (타입 가드 추가)
    if (field === "_form" && typeof actionData.errors === 'object' && '_form' in actionData.errors && Array.isArray(actionData.errors._form)) {
      return actionData.errors._form[0];
    }

    // Zod 필드 에러 처리 (타입 가드 추가)
    if (typeof actionData.errors === 'object' && 'fieldErrors' in actionData.errors && typeof actionData.errors.fieldErrors === 'object') {
      const fieldErrors = actionData.errors.fieldErrors as { [key: string]: string[] | undefined };
      if (field in fieldErrors && fieldErrors[field as string]) {
        return fieldErrors[field as string]?.[0];
      }
    }
    return undefined;
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Post a Job</h1>
        <p className="text-lg text-muted-foreground">
          Reach out to the best developers in the world
        </p>
      </div>
      <Form method="post" className="space-y-8">
        {/* Position */}
        <FieldWrapper label="Position" error={getError("position")} helpText="(40 characters max)">
          <Input name="position" maxLength={40} required className={cn(getError("position") && "border-destructive")} />
        </FieldWrapper>

        {/* Overview */}
        <FieldWrapper label="Overview" error={getError("overview")} helpText="(400 characters max)">
          <Textarea name="overview" rows={5} maxLength={400} required className={cn(getError("overview") && "border-destructive")} />
        </FieldWrapper>

        {/* Responsibilities */}
        <FieldWrapper label="Responsibilities" error={getError("responsibilities")} helpText="(400 characters max, comma separated)">
          <Textarea name="responsibilities" rows={3} maxLength={400} className={cn(getError("responsibilities") && "border-destructive")} placeholder="Implement new features, Maintain code quality, etc." />
        </FieldWrapper>

        {/* Qualifications */}
        <FieldWrapper label="Qualifications" error={getError("qualifications")} helpText="(400 characters max, comma separated)">
          <Textarea name="qualifications" rows={3} maxLength={400} className={cn(getError("qualifications") && "border-destructive")} placeholder="3+ years of experience, Strong TypeScript skills, etc." />
        </FieldWrapper>

        {/* Benefits */}
        <FieldWrapper label="Benefits" error={getError("benefits")} helpText="(400 characters max, comma separated)">
          <Textarea name="benefits" rows={3} maxLength={400} className={cn(getError("benefits") && "border-destructive")} placeholder="Flexible working hours, Health insurance, etc." />
        </FieldWrapper>

        {/* Skills */}
        <FieldWrapper label="Skills" error={getError("skills")} helpText="(400 characters max, comma separated)">
          <Input name="skills" maxLength={400} className={cn(getError("skills") && "border-destructive")} placeholder="React, TypeScript, Node.js, etc." />
        </FieldWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Name */}
          <FieldWrapper label="Company Name" error={getError("companyName")} helpText="(40 characters max)">
            <Input name="companyName" maxLength={40} required className={cn(getError("companyName") && "border-destructive")} />
          </FieldWrapper>

          {/* Company Logo URL */}
          <FieldWrapper label="Company Logo URL" error={getError("companyLogoUrl")}>
            <Input name="companyLogoUrl" type="url" className={cn(getError("companyLogoUrl") && "border-destructive")} placeholder="https://example.com/logo.png" />
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Location */}
          <FieldWrapper label="Company Location" error={getError("companyLocation")} helpText="(40 characters max)">
            <Input name="companyLocation" maxLength={40} required className={cn(getError("companyLocation") && "border-destructive")} />
          </FieldWrapper>
          {/* Apply URL */}
          <FieldWrapper label="Apply URL" error={getError("applyUrl")}>
            <Input name="applyUrl" type="url" className={cn(getError("applyUrl") && "border-destructive")} placeholder="https://example.com/apply" />
          </FieldWrapper>
          {/* Job Type */}
          <FieldWrapper label="Job Type" error={getError("jobType")}>
            <Select name="jobType" required>
              <SelectTrigger className={cn(getError("jobType") && "border-destructive")}><SelectValue placeholder="Select the type of job" /></SelectTrigger>
              <SelectContent>
                {jobTypeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Job Location Type */}
          <FieldWrapper label="Job Location" error={getError("jobLocationType")}>
            <Select name="jobLocationType" required>
              <SelectTrigger className={cn(getError("jobLocationType") && "border-destructive")}><SelectValue placeholder="Select the location of the job" /></SelectTrigger>
              <SelectContent>
                {jobLocationTypeOptions.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldWrapper>

          {/* Salary Range */}
          <FieldWrapper label="Salary Range" error={getError("salaryRange")}>
            <Select name="salaryRange" required>
              <SelectTrigger className={cn(getError("salaryRange") && "border-destructive")}><SelectValue placeholder="Select the salary range of the job" /></SelectTrigger>
              <SelectContent>
                {salaryRangeOptions.map(range => <SelectItem key={range} value={range}>{range}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldWrapper>
        </div>

        {getError("_form") && (
          <p className="text-sm font-medium text-destructive text-center">{getError("_form")}</p>
        )}

        <div className="text-center pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto min-w-[200px]">
            {isSubmitting ? "Submitting..." : "Post Job for $100"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

// Helper component for form fields
function FieldWrapper({
  label,
  children,
  error,
  helpText,
  htmlFor
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  helpText?: string;
  htmlFor?: string;
}) {
  const id = htmlFor || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className={cn(error && "text-destructive")}>{label}</Label>
        {helpText && <span className="text-xs text-muted-foreground">{helpText}</span>}
      </div>
      {children}
      {error && <p id={`${id}-error`} className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
} 