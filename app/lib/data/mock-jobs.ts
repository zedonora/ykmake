import type { Job } from "~/lib/types/job";

export const mockJobs: Job[] = [
    {
        id: "job-1",
        title: "시니어 프론트엔드 개발자",
        company: "YkMake",
        companyLogo: "https://placehold.co/100x100?text=YkMake",
        description: "YkMake에서 웹 애플리케이션 개발에 참여할 시니어 프론트엔드 개발자를 찾고 있습니다.",
        location: "서울",
        type: "정규직",
        salary: "6000-8000만원",
        experienceLevel: "5년 이상",
        requirements: [
            "React, TypeScript 숙련자",
            "5년 이상의 프론트엔드 개발 경험",
            "웹 표준 및 웹 접근성에 대한 이해",
            "Git을 이용한 협업 경험"
        ],
        responsibilities: [
            "프론트엔드 아키텍처 설계 및 구현",
            "성능 최적화 및 코드 품질 개선",
            "주니어 개발자 멘토링",
            "신규 기술 검토 및 도입"
        ],
        benefits: [
            "유연근무제",
            "원격 근무 가능",
            "4대 보험",
            "연 2회 성과급",
            "점심 식대 제공",
            "업무 관련 도서 지원"
        ],
        tags: ["React", "TypeScript", "Next.js"],
        postedAt: "2023-05-15",
        deadline: "2023-06-15",
        contactEmail: "jobs@ykmake.com",
        contactPhone: "02-1234-5678",
        status: "active"
    },
    {
        id: "job-2",
        title: "백엔드 개발자",
        company: "YkMake",
        companyLogo: "https://placehold.co/100x100?text=YkMake",
        description: "YkMake에서 서버 애플리케이션 개발에 참여할 백엔드 개발자를 찾고 있습니다.",
        location: "원격",
        type: "계약직",
        salary: "4000-6000만원",
        experienceLevel: "3년 이상",
        requirements: [
            "Node.js, Python 기반 개발 경험",
            "RDBMS, NoSQL 활용 능력",
            "REST API 설계 및 개발 경험",
            "클라우드 서비스(AWS, GCP 등) 활용 경험"
        ],
        responsibilities: [
            "백엔드 API 개발 및 유지보수",
            "데이터베이스 설계 및 구현",
            "서버 인프라 관리",
            "백엔드 성능 최적화"
        ],
        benefits: [
            "유연근무제",
            "원격 근무 가능",
            "4대 보험",
            "업무 관련 도서 지원"
        ],
        tags: ["Node.js", "Python", "AWS"],
        postedAt: "2023-05-20",
        deadline: "2023-06-20",
        contactEmail: "jobs@ykmake.com",
        contactPhone: "02-1234-5678",
        status: "active"
    }
];

export function getAllJobs() {
    return mockJobs;
}

export function getJobById(id: string) {
    return mockJobs.find(job => job.id === id);
}

export function getJobsByLocation(location: string) {
    return mockJobs.filter(job => job.location.toLowerCase() === location.toLowerCase());
}

export function getJobsByType(type: string) {
    return mockJobs.filter(job => job.type.toLowerCase() === type.toLowerCase());
}

export function searchJobs(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return mockJobs.filter(job =>
        job.title.toLowerCase().includes(lowercaseQuery) ||
        job.company.toLowerCase().includes(lowercaseQuery) ||
        job.description.toLowerCase().includes(lowercaseQuery) ||
        job.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
}