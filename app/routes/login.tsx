import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "YkMake | 로그인" }];
};

export default function Login() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">로그인</h1>
      {/* 로그인 폼 컴포넌트 또는 내용 추가 */}
      <p className="mt-4">로그인 폼이 여기에 표시됩니다.</p>
    </div>
  );
}