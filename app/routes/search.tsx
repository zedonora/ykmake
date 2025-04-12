import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { RootLayout } from "~/components/layouts/root-layout";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { SearchNav } from "~/components/search/search-nav";
import { prisma } from "~/utils/api.server";
import { getUser } from "~/utils/session.server";

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
    const user = await getUser(request);

    const [products, teams, users] = await Promise.all([
        type === "all" || type === "products"
            ? prisma.product.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                },
                include: {
                    author: { select: { name: true } },
                    _count: { select: { likes: true, comments: true } },
                },
            })
            : [],
        type === "all" || type === "teams"
            ? prisma.team.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                },
                include: {
                    _count: { select: { members: true } },
                },
            })
            : [],
        type === "all" || type === "users"
            ? prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { email: { contains: query, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    bio: true,
                    _count: { select: { products: true } },
                },
            })
            : [],
    ]);

    const results = {
        results: [
            ...products.map((product) => ({
                id: product.id,
                title: product.title,
                description: product.description,
                type: "product" as const,
                url: `/products/${product.id}`,
                metadata: {
                    views: product.views,
                    likes: product._count.likes,
                    comments: product._count.comments,
                    author: product.author.name,
                },
            })),
            ...teams.map((team) => ({
                id: team.id,
                title: team.name,
                description: team.description,
                type: "team" as const,
                url: `/teams/${team.id}`,
                metadata: {
                    members: team._count.members,
                },
            })),
            ...users.map((user) => ({
                id: user.id,
                title: user.name || user.email,
                description: user.bio || "",
                type: "user" as const,
                url: `/users/${user.id}`,
                metadata: {
                    products: user._count.products,
                },
            })),
        ]
    };

    return { results, user, query, type };
}

export default function SearchResults() {
    const { results, query, type } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(query);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ q: searchQuery, type: searchParams.get("type") || "all" });
    };

    return (
        <RootLayout>
            <div className="container py-8">
                <div className="flex items-center gap-4 mb-8">
                    <form onSubmit={handleSearch} className="flex items-center gap-4 w-full">
                        <Input
                            className="max-w-xl"
                            placeholder="검색어를 입력하세요"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit">검색</Button>
                    </form>
                </div>

                <div className="mb-8">
                    <SearchNav />
                </div>

                <Tabs defaultValue={type} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all" onClick={() => setSearchParams({ q: searchQuery, type: "all" })}>전체</TabsTrigger>
                        <TabsTrigger value="products" onClick={() => setSearchParams({ q: searchQuery, type: "products" })}>제품</TabsTrigger>
                        <TabsTrigger value="teams" onClick={() => setSearchParams({ q: searchQuery, type: "teams" })}>팀</TabsTrigger>
                        <TabsTrigger value="users" onClick={() => setSearchParams({ q: searchQuery, type: "users" })}>사용자</TabsTrigger>
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