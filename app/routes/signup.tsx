import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "YkMake | 회원가입" }];
};

export default function Signup() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">회원가입</h1>
      {/* 회원가입 폼 컴포넌트 또는 내용 추가 */}
      <p className="mt-4">회원가입 폼이 여기에 표시됩니다.</p>
    </div>
  );
}