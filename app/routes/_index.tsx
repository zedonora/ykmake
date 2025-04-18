import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "YkMake | 홈" },
    { name: "description", content: "YkMake 프로젝트 홈페이지" },
  ];
};

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">YkMake 홈페이지</h1>
      <p className="mt-4">프로젝트 설명을 여기에 작성하세요.</p>
      {/* 홈페이지 컨텐츠 추가 */}
    </div>
  );
}