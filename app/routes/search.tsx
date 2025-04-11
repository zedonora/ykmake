import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { RootLayout } from "~/components/layouts/root-layout";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { SearchNav } from "~/components/search/search-nav";
import { search } from "~/lib/data/mock-search";
import type { SearchResult } from "~/lib/types/search";

export const meta: MetaFunction = () => {
    return [
        { title: "검색 결과 - YkMake" },
        { name: "description", content: "YkMake에서 검색 결과를 확인하세요" },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const type = url.searchParams.get("type") || "all";

    const results = search(query, type);
    return { results, query, type };
}

export default function SearchResults() {
    const { results, query, type } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(query);

    return (
        <RootLayout>
            <div className="container py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Input
                        className="max-w-xl"
                        placeholder="검색어를 입력하세요"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button>검색</Button>
                </div>

                <div className="mb-8">
                    <SearchNav />
                </div>

                <Tabs defaultValue={type} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all">전체</TabsTrigger>
                        <TabsTrigger value="products">제품</TabsTrigger>
                        <TabsTrigger value="teams">팀</TabsTrigger>
                        <TabsTrigger value="users">사용자</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">제품</h2>
                            <div className="space-y-4">
                                {results.results
                                    .filter((result) => result.type === "product")
                                    .map((result) => (
                                        <div key={result.id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{result.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.description}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                조회수 {result.metadata?.views}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">팀</h2>
                            <div className="space-y-4">
                                {results.results
                                    .filter((result) => result.type === "team")
                                    .map((result) => (
                                        <div key={result.id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{result.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.description}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {result.metadata?.members}명의 멤버
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">사용자</h2>
                            <div className="space-y-4">
                                {results.results
                                    .filter((result) => result.type === "user")
                                    .map((result) => (
                                        <div key={result.id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{result.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.description}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {result.metadata?.products}개의 제품
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products">
                        <Card className="p-6">
                            <div className="space-y-4">
                                {results.results
                                    .filter((result) => result.type === "product")
                                    .map((result) => (
                                        <div key={result.id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{result.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.description}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                조회수 {result.metadata?.views}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="teams">
                        <Card className="p-6">
                            <div className="space-y-4">
                                {results.results
                                    .filter((result) => result.type === "team")
                                    .map((result) => (
                                        <div key={result.id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{result.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.description}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {result.metadata?.members}명의 멤버
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card className="p-6">
                            <div className="space-y-4">
                                {results.results
                                    .filter((result) => result.type === "user")
                                    .map((result) => (
                                        <div key={result.id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{result.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.description}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {result.metadata?.products}개의 제품
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </RootLayout>
    );
}