import { useState } from 'react';
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react";

interface IdeaSuggestion {
    id: string;
    title: string;
    description: string;
}

export function IdeasGpt() {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ideas, setIdeas] = useState<IdeaSuggestion[]>([]);
    const [error, setError] = useState('');

    // 아이디어 생성 요청 처리
    const generateIdeas = async () => {
        if (!prompt.trim()) {
            setError('아이디어를 생성하기 위한 프롬프트를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // 실제 환경에서는 서버 API 호출
            // const response = await fetch('/api/generate-ideas', {
            //    method: 'POST',
            //    headers: { 'Content-Type': 'application/json' },
            //    body: JSON.stringify({ prompt }),
            // });

            // 현재 예시 데이터를 사용
            // 서버 응답 지연 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 임시 아이디어 생성
            const mockIdeas = [
                {
                    id: '1',
                    title: '개발자를 위한 AI 코드 리뷰어',
                    description: '소규모 팀과 개인 개발자를 위한 자동화된 코드 리뷰 도구. 코드 최적화, 보안 문제, 및 스타일 가이드 준수를 검사하고 개선 방안을 제안합니다.'
                },
                {
                    id: '2',
                    title: '실시간 협업 프로토타이핑 도구',
                    description: '디자이너와 개발자가 실시간으로 함께 작업할 수 있는 프로토타이핑 플랫폼. 디자인 변경이 즉시 코드에 반영되고, 코드 변경이 즉시 디자인에 반영됩니다.'
                },
                {
                    id: '3',
                    title: '개발자 건강 관리 앱',
                    description: '장시간 코딩 시 휴식을 알려주고, 눈 건강을 위한 운동, 자세 교정 알림, 수분 섭취 알림 등 개발자의 건강을 관리해주는 앱입니다.'
                }
            ];

            setIdeas(mockIdeas);
        } catch (err) {
            setError('아이디어 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            console.error('Error generating ideas:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    IdeasGPT
                </CardTitle>
                <CardDescription>
                    아이디어가 필요하신가요? AI의 도움을 받아보세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Textarea
                        placeholder="어떤 종류의 아이디어를 찾고 계신가요? (예: '개발자를 위한 생산성 도구', '건강 관리 앱 아이디어')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                </div>

                {ideas.length > 0 && (
                    <div className="space-y-4 mt-6">
                        <h3 className="font-medium text-lg">제안된 아이디어</h3>
                        <div className="space-y-3">
                            {ideas.map((idea) => (
                                <div key={idea.id} className="border rounded-lg p-3">
                                    <h4 className="font-medium">{idea.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={generateIdeas}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            아이디어 생성 중...
                        </>
                    ) : (
                        "아이디어 생성하기"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
} 