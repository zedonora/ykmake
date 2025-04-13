import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { IdeasGpt } from "~/components/idea/ideas-gpt";

export default function IdeasIndexPage() {
    return (
        <>
            <PageHeader
                title="아이디어 생성기"
                description="AI의 도움을 받아 창의적인 개발 아이디어를 생성해보세요."
            />

            <Section>
                <div className="max-w-3xl mx-auto">
                    <IdeasGpt />
                </div>
            </Section>
        </>
    );
} 