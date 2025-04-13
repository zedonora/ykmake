import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CollaborationEditor } from "~/components/collaboration/collaboration-editor";

export default function CollaborationIndexPage() {
    const initialContent = "# 문서 제목\n\n이 문서는 실시간으로 협업 편집이 가능합니다.\n\n## 기능 소개\n\n- 여러 사용자가 동시에 편집 가능\n- 실시간으로 변경 사항 반영\n- 마크다운 지원";

    return (
        <>
            <PageHeader title="협업 편집" description="팀원들과 실시간으로 문서를 편집하세요" />
            <Section>
                <Card>
                    <CardHeader>
                        <CardTitle>공유 문서 편집</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CollaborationEditor
                            documentId="doc-1"
                            initialContent={initialContent}
                        />
                    </CardContent>
                </Card>
            </Section>
        </>
    );
}