import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { searchSettings } from "~/lib/data/mock-settings";
import { SettingResult } from "~/lib/types/settings";
import { Link } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    // 실제 환경에서는 서버에서 검색하지만, 여기서는 클라이언트 측에서 처리
    const results = query ? searchSettings(query) : [];

    return Response.json({ results, query });
}

export default function SettingsSearch() {
    const { results, query } = useLoaderData<{ results: SettingResult[], query: string }>();
    const [searchParams] = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // 페이지 로드 시 입력 필드에 포커스
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">설정 검색</h1>
                <p className="text-muted-foreground">모든 설정 옵션에서 검색합니다</p>
            </div>

            <Form method="get" className="mb-8">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="search" className="sr-only">검색</Label>
                        <Input
                            ref={inputRef}
                            id="search"
                            name="q"
                            placeholder="찾고 있는 설정을 검색하세요"
                            defaultValue={searchParams.get("q") || ""}
                            className="w-full"
                        />
                    </div>
                    <Button type="submit">검색</Button>
                </div>
            </Form>

            {query && (
                <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                        "{query}"에 대한 검색 결과: {results.length}개
                    </p>
                </div>
            )}

            {results.length > 0 ? (
                <div className="grid gap-4">
                    {results.map((result) => (
                        <Link
                            to={result.path}
                            key={result.id}
                            className="block transition-colors hover:bg-muted"
                        >
                            <Card>
                                <CardHeader className="py-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{result.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {result.description}
                                            </CardDescription>
                                        </div>
                                        <span className="text-xs rounded-full px-2 py-1 bg-muted">
                                            {result.category}
                                        </span>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : query ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <p className="text-center text-muted-foreground">검색 결과가 없습니다.</p>
                        <p className="text-center text-sm text-muted-foreground mt-1">
                            다른 검색어로 시도해보세요.
                        </p>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
} 