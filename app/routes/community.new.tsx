import { Form, Link } from "@remix-run/react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

export default function NewPostPage() {
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <>
            <PageHeader
                title="게시글 작성"
                description="커뮤니티에 새로운 게시글을 작성해보세요."
            >
                <Button variant="outline" asChild>
                    <Link to="/community">목록으로 돌아가기</Link>
                </Button>
            </PageHeader>

            <Section>
                <Form className="max-w-4xl mx-auto">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <Label htmlFor="title">제목</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="게시글 제목을 입력하세요"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">내용</Label>
                            <Textarea
                                id="content"
                                name="content"
                                placeholder="게시글 내용을 입력하세요"
                                rows={12}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">태그</Label>
                            <div className="flex gap-2 mb-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} className="inline-flex items-center gap-1">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                                            <X size={12} />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    id="tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="태그를 입력하고 Enter를 누르세요"
                                />
                                <Button type="button" onClick={handleAddTag}>추가</Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button variant="outline" asChild>
                                <Link to="/community">취소</Link>
                            </Button>
                            <Button type="submit">게시하기</Button>
                        </div>
                    </div>
                </Form>
            </Section>
        </>
    );
}