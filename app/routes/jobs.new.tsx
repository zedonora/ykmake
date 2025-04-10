import { Form } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function NewJobPage() {
    return (
        <>
            <PageHeader
                title="구인 공고 등록"
                description="YkMake에서 함께할 팀원을 모집해보세요"
            />

            <Section>
                <Card>
                    <CardHeader>
                        <CardTitle>공고 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form method="post" className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">공고 제목</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="채용 포지션을 포함한 제목을 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="company">회사명</Label>
                                    <Input
                                        id="company"
                                        name="company"
                                        placeholder="회사 또는 팀 이름을 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="companyLogo">회사 로고 URL</Label>
                                    <Input
                                        id="companyLogo"
                                        name="companyLogo"
                                        placeholder="회사 로고 이미지 URL을 입력하세요 (선택사항)"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">간략한 설명</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="공고에 대한 간략한 설명을 입력하세요"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="location">근무 지역</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            placeholder="근무 지역을 입력하세요"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="type">근무 형태</Label>
                                        <Select name="type">
                                            <SelectTrigger>
                                                <SelectValue placeholder="선택하세요" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">선택하세요</SelectItem>
                                                <SelectItem value="정규직">정규직</SelectItem>
                                                <SelectItem value="계약직">계약직</SelectItem>
                                                <SelectItem value="인턴">인턴</SelectItem>
                                                <SelectItem value="프리랜서">프리랜서</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="salary">급여</Label>
                                        <Input
                                            id="salary"
                                            name="salary"
                                            placeholder="급여 범위를 입력하세요"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="experienceLevel">경력 요건</Label>
                                        <Input
                                            id="experienceLevel"
                                            name="experienceLevel"
                                            placeholder="필요 경력을 입력하세요"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="requirements">자격 요건</Label>
                                    <Textarea
                                        id="requirements"
                                        name="requirements"
                                        placeholder="자격 요건을 한 줄에 하나씩 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="responsibilities">주요 업무</Label>
                                    <Textarea
                                        id="responsibilities"
                                        name="responsibilities"
                                        placeholder="주요 업무를 한 줄에 하나씩 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="benefits">복리후생</Label>
                                    <Textarea
                                        id="benefits"
                                        name="benefits"
                                        placeholder="복리후생을 한 줄에 하나씩 입력하세요"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tags">기술 스택</Label>
                                    <Input
                                        id="tags"
                                        name="tags"
                                        placeholder="쉼표로 구분하여 입력하세요 (예: React, TypeScript, Node.js)"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="contactEmail">연락처 이메일</Label>
                                        <Input
                                            id="contactEmail"
                                            name="contactEmail"
                                            type="email"
                                            placeholder="지원자 연락처 이메일을 입력하세요"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="contactPhone">연락처 전화번호</Label>
                                        <Input
                                            id="contactPhone"
                                            name="contactPhone"
                                            placeholder="지원자 연락처 전화번호를 입력하세요 (선택사항)"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="deadline">마감일</Label>
                                        <Input
                                            id="deadline"
                                            name="deadline"
                                            type="date"
                                            placeholder="지원 마감일을 입력하세요 (선택사항)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <a href="/jobs">취소</a>
                                </Button>
                                <Button type="submit">등록하기</Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </Section>
        </>
    );
}