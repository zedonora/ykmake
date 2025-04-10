export interface Job {
    id: string;
    title: string;
    company: string;
    companyLogo?: string;
    description: string;
    location: string;
    type: "정규직" | "계약직" | "인턴" | "프리랜서";
    salary: string;
    experienceLevel: string;
    requirements: string[];
    responsibilities: string[];
    benefits?: string[];
    tags: string[];
    postedAt: string;
    deadline?: string;
    contactEmail: string;
    contactPhone?: string;
    status: "active" | "filled" | "expired";
}