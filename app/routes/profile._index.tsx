import { Link, useLoaderData } from "@remix-run/react";
import { Edit, MapPin, Globe, Github, Twitter, Linkedin, Users, Bookmark, FileCode, Calendar } from "lucide-react";
import { getCurrentUser } from "~/lib/data/mock-user";
import { getLatestPosts } from "~/lib/data/mock-posts";
import type { Post } from "~/lib/types/post";
import { Section } from "~/components/layouts/section";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { PostCard } from "~/components/cards/post-card";

export async function loader() {
    const user = getCurrentUser();
    const userPosts = getLatestPosts(3);

    return Response.json({
        user,
        userPosts,
    });
}

export default function ProfilePage() {
    const { user, userPosts } = useLoaderData<typeof loader>();

    // 이니셜 생성
    const initials = user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

    return (
        <>
            {/* 커버 이미지 */}
            <div className="w-full h-48 md:h-64 bg-muted relative overflow-hidden">
                {user.coverUrl ? (
                    <img
                        src={user.coverUrl}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40" />
                )}
            </div>

            <Section className="-mt-16 relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end">
                        <Avatar className="h-32 w-32 border-4 border-background">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="mt-4 md:mt-0 md:ml-4 text-center md:text-left">
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <p className="text-muted-foreground">@{user.username}</p>
                            {user.role === "maker" && (
                                <Badge className="mt-2">메이커</Badge>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex space-x-2">
                        <Button asChild variant="outline">
                            <Link to="/profile/settings" className="inline-flex items-center">
                                <Edit size={16} className="mr-2" />
                                프로필 편집
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* 왼쪽 사이드바 - 사용자 정보 */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>정보</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {user.bio && (
                                    <p className="text-sm">{user.bio}</p>
                                )}

                                <div className="space-y-2">
                                    {user.location && (
                                        <div className="flex items-center text-sm">
                                            <MapPin size={16} className="mr-2 text-muted-foreground" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}

                                    {user.website && (
                                        <div className="flex items-center text-sm">
                                            <Globe size={16} className="mr-2 text-muted-foreground" />
                                            <a
                                                href={user.website.startsWith('http') ? user.website : `http://${user.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {user.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}

                                    {user.github && (
                                        <div className="flex items-center text-sm">
                                            <Github size={16} className="mr-2 text-muted-foreground" />
                                            <a
                                                href={`https://github.com/${user.github}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {user.github}
                                            </a>
                                        </div>
                                    )}

                                    {user.twitter && (
                                        <div className="flex items-center text-sm">
                                            <Twitter size={16} className="mr-2 text-muted-foreground" />
                                            <a
                                                href={`https://twitter.com/${user.twitter}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {user.twitter}
                                            </a>
                                        </div>
                                    )}

                                    {user.linkedin && (
                                        <div className="flex items-center text-sm">
                                            <Linkedin size={16} className="mr-2 text-muted-foreground" />
                                            <a
                                                href={`https://linkedin.com/in/${user.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {user.linkedin}
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm">
                                        <Calendar size={16} className="mr-2 text-muted-foreground" />
                                        <span>{user.joinedAt} 가입</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                    <div className="text-center">
                                        <div className="text-lg font-bold">{user.followers}</div>
                                        <div className="text-xs text-muted-foreground">팔로워</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold">{user.following}</div>
                                        <div className="text-xs text-muted-foreground">팔로잉</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold">{user.projects}</div>
                                        <div className="text-xs text-muted-foreground">프로젝트</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>스킬</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map((skill: string) => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>관심사</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {user.interests.map((interest: string) => (
                                        <Badge key={interest} variant="outline">{interest}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 오른쪽 메인 - 컨텐츠 탭 */}
                    <div className="md:col-span-2">
                        <Tabs defaultValue="projects" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="projects" className="flex items-center">
                                    <FileCode size={16} className="mr-2" />
                                    프로젝트
                                </TabsTrigger>
                                <TabsTrigger value="posts" className="flex items-center">
                                    <Bookmark size={16} className="mr-2" />
                                    게시글
                                </TabsTrigger>
                                <TabsTrigger value="community" className="flex items-center">
                                    <Users size={16} className="mr-2" />
                                    커뮤니티
                                </TabsTrigger>
                            </TabsList>

                            {/* 프로젝트 탭 */}
                            <TabsContent value="projects" className="mt-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold">내 프로젝트</h2>
                                        <Button asChild variant="outline" size="sm">
                                            <Link to="/projects/new">새 프로젝트</Link>
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* 실제 프로젝트가 있으면 여기에 매핑 */}
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg">IoT 스마트 홈 허브</CardTitle>
                                                <CardDescription>스마트 홈 기기를 통합 제어하는 중앙 허브</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-between items-center">
                                                    <Badge>진행 중</Badge>
                                                    <span className="text-xs text-muted-foreground">2023.10.15 업데이트</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg">개발자 포트폴리오</CardTitle>
                                                <CardDescription>Next.js 기반 개인 포트폴리오 웹사이트</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-between items-center">
                                                    <Badge variant="outline">완료됨</Badge>
                                                    <span className="text-xs text-muted-foreground">2023.08.20 완료</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Link to="/projects" className="flex items-center justify-center border border-dashed rounded-lg p-6 h-full hover:bg-muted/50 transition-colors">
                                            <span className="text-muted-foreground">모든 프로젝트 보기</span>
                                        </Link>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* 게시글 탭 */}
                            <TabsContent value="posts" className="mt-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold">내 게시글</h2>
                                        <Button asChild variant="outline" size="sm">
                                            <Link to="/community/new">새 글 작성</Link>
                                        </Button>
                                    </div>

                                    {userPosts.length > 0 ? (
                                        <div className="space-y-4">
                                            {userPosts.map((post: Post) => (
                                                <PostCard key={post.id} {...post} />
                                            ))}

                                            <Link to="/community" className="flex items-center justify-center border border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                                <span className="text-muted-foreground">모든 게시글 보기</span>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-muted/20 rounded-lg">
                                            <p className="text-muted-foreground">아직 작성한 게시글이 없습니다.</p>
                                            <Button asChild className="mt-4">
                                                <Link to="/community/new">
                                                    첫 번째 게시글 작성하기
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* 커뮤니티 탭 */}
                            <TabsContent value="community" className="mt-6">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold">커뮤니티 활동</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>참여 중인 챌린지</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span>100일 코딩 챌린지</span>
                                                        <Badge>진행 중</Badge>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                                                    </div>
                                                    <div className="text-xs text-right text-muted-foreground">65/100일 완료</div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>최근 활동</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>게시글 작성</span>
                                                        <span className="text-muted-foreground">3일 전</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>댓글 작성</span>
                                                        <span className="text-muted-foreground">1주일 전</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>새 프로젝트 생성</span>
                                                        <span className="text-muted-foreground">2주일 전</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </Section>
        </>
    );
}