import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { RootLayout } from "~/components/layouts/root-layout";
import { Section } from "~/components/layouts/section";
import { useLoaderData } from "@remix-run/react";
import { getCurrentUser } from "~/lib/data/mock-user";
import { useState, useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "YkMake - 개발자들의 커뮤니티" },
    { name: "description", content: "아이디어부터 제품까지, 개발자들의 커뮤니티 YkMake" },
  ];
};

export async function loader() {
  const user = getCurrentUser();
  return Response.json({ user });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [isAdmin, setIsAdmin] = useState(true);

  // localStorage에 상태 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isAdmin", isAdmin.toString());
      localStorage.setItem("isLoggedIn", isLoggedIn.toString());
    }
  }, [isAdmin, isLoggedIn]);

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button onClick={() => setIsLoggedIn(!isLoggedIn)}>
          {isLoggedIn ? "로그아웃" : "로그인"}
        </Button>
        {isLoggedIn && (
          <Button
            variant="outline"
            onClick={() => setIsAdmin(!isAdmin)}
          >
            {isAdmin ? "일반 사용자 모드" : "관리자 모드"}
          </Button>
        )}
      </div>
      <RootLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
        {/* 히어로 섹션 */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 z-0" />
          <Section className="py-16 md:py-24 lg:py-32 relative z-10">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                아이디어부터 제품까지
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
                YkMake에서 당신의 아이디어를 현실로 만드세요. 다양한 개발자들과 함께 협업하고, 피드백을 받고, 성장하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button size="lg" asChild>
                  <Link to="/products">인기 제품 보기</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/community">커뮤니티 참여하기</Link>
                </Button>
              </div>
            </div>
          </Section>
        </div>

        {/* 주요 기능 섹션 */}
        <Section className="bg-muted/50">
          <h2 className="text-3xl font-bold text-center mb-12">YkMake의 주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">제품 쇼케이스</h3>
              <p className="text-muted-foreground mb-4">
                당신의 제품을 전 세계 개발자들에게 소개하고 피드백을 받으세요.
              </p>
              <Link to="/products" className="text-sm font-medium text-primary inline-flex items-center">
                제품 둘러보기 <ArrowRight className="ml-1" size={14} />
              </Link>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">AI 아이디어 생성</h3>
              <p className="text-muted-foreground mb-4">
                OpenAI 기반의 아이디어 생성 도구로 새로운 프로젝트 아이디어를 얻으세요.
              </p>
              <Link to="/ideas" className="text-sm font-medium text-primary inline-flex items-center">
                아이디어 생성하기 <ArrowRight className="ml-1" size={14} />
              </Link>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">개발자 매칭</h3>
              <p className="text-muted-foreground mb-4">
                당신의 프로젝트에 필요한 팀원을 찾거나, 흥미로운 프로젝트에 참여하세요.
              </p>
              <Link to="/teams" className="text-sm font-medium text-primary inline-flex items-center">
                팀 찾아보기 <ArrowRight className="ml-1" size={14} />
              </Link>
            </div>
          </div>
        </Section>

        {/* CTA 섹션 */}
        <Section className="py-16 bg-gradient-to-r from-primary/10 to-blue-500/10">
          <div className="rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border bg-background/60 backdrop-blur-sm shadow-sm">
            <div className="text-left max-w-[600px]">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
              <p className="text-muted-foreground mb-6">
                YkMake 커뮤니티에 가입하여 다양한 개발자들과 함께 성장하세요.
                아이디어부터 제품 출시까지 모든 과정에서 도움을 받을 수 있습니다.
              </p>
              <Button size="lg" className="bg-primary/90 hover:bg-primary" asChild>
                <Link to="/auth/register">무료로 가입하기</Link>
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="w-[250px] h-[250px] rounded-full bg-gradient-to-tr from-primary/20 to-primary/40 flex items-center justify-center">
                <ArrowRight size={80} className="text-primary/70" />
              </div>
            </div>
          </div>
        </Section>
      </RootLayout>
    </div>
  );
}