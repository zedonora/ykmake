import { z } from "zod";

// Zod 스키마 정의 (jobs 테이블 스키마와 일치하도록)
export const JobPostSchema = z.object({
  position: z.string().min(3, "Position must be at least 3 characters.").max(40, "Position cannot exceed 40 characters."),
  overview: z.string().min(10, "Overview must be at least 10 characters.").max(400, "Overview cannot exceed 400 characters."),
  responsibilities: z.string().max(400, "Responsibilities cannot exceed 400 characters.").optional(),
  qualifications: z.string().max(400, "Qualifications cannot exceed 400 characters.").optional(),
  benefits: z.string().max(400, "Benefits cannot exceed 400 characters.").optional(),
  skills: z.string().max(400, "Skills cannot exceed 400 characters.").optional(), // Comma separated
  companyName: z.string().min(1, "Company Name is required.").max(40, "Company Name cannot exceed 40 characters."),
  companyLogoUrl: z.string().url("Please enter a valid URL for the company logo.").optional().or(z.literal('')),
  companyLocation: z.string().min(1, "Company Location is required.").max(40, "Company Location cannot exceed 40 characters."),
  applyUrl: z.string().url("Please enter a valid URL to apply.").optional().or(z.literal('')),
  jobType: z.string().min(1, "Job Type is required."),
  jobLocationType: z.string().min(1, "Job Location is required."),
  salaryRange: z.string().min(1, "Salary Range is required."),
});

export type JobPostFormData = z.infer<typeof JobPostSchema>; 