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

export default function NewTeamPage() {
    return (
        <>
            <PageHeader
                title="팀 만들기"
                description="새로운 프로젝트를 위한 팀을 구성해보세요"
            />

            <Section>
                <Card>
                    <CardHeader>
                        <CardTitle>팀 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form method="post" className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">팀 이름</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="팀 이름을 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">팀 소개</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="팀과 프로젝트에 대한 설명을 입력하세요"
                                        rows={5}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">카테고리</Label>
                                    <Select name="category">
                                        <SelectTrigger>
                                            <SelectValue placeholder="선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">선택하세요</SelectItem>
                                            <SelectItem value="AI">AI</SelectItem>
                                            <SelectItem value="웹">웹</SelectItem>
                                            <SelectItem value="모바일">모바일</SelectItem>
                                            <SelectItem value="블록체인">블록체인</SelectItem>
                                            <SelectItem value="게임">게임</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="maxMembers">최대 팀원 수</Label>
                                    <Input
                                        id="maxMembers"
                                        name="maxMembers"
                                        type="number"
                                        min="2"
                                        defaultValue="5"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="openPositions">모집 포지션</Label>
                                    <Textarea
                                        id="openPositions"
                                        name="openPositions"
                                        placeholder="모집하는 포지션을 한 줄에 하나씩 입력하세요 (예: 프론트엔드 개발자 - 1명)"
                                        required
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
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <a href="/teams">취소</a>
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