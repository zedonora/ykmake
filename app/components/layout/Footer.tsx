import { Link } from "@remix-run/react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 md:px-8 md:py-0 border-t">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {currentYear}{" "}
          <Link to="/" className="font-medium underline underline-offset-4">
            YkMake
          </Link>
          . All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            to="/terms"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            이용약관
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            개인정보처리방침
          </Link>
          {/* 추가 푸터 링크 (예: 고객센터, FAQ 등) */}
        </nav>
      </div>
    </footer>
  );
}