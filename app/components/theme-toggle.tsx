"use client"; // "use client" 지시문 추가

import * as React from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useFetcher } from "@remix-run/react"; // useFetcher import
import { Theme, useTheme } from "remix-themes"; // Theme 타입 임포트
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [, setTheme] = useTheme(); // setTheme 함수 사용
  const fetcher = useFetcher();

  // 테마 변경 함수 (문자열 리터럴 사용)
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    // Optimistic UI: 즉시 클라이언트 상태 변경 (Theme 타입 사용)
    if (newTheme === 'light') {
      setTheme(Theme.LIGHT);
    } else if (newTheme === 'dark') {
      setTheme(Theme.DARK);
    } else {
      // 'system' 테마는 null로 설정 (remix-themes 동작 방식)
      setTheme(null);
    }

    // 서버에 변경 요청 (문자열 리터럴 전달)
    fetcher.submit(
      { theme: newTheme },
      { method: "post", action: "/action/set-theme" }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">테마 변경</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto min-w-0" align="center">
        <DropdownMenuItem onClick={() => handleThemeChange('system')} className="cursor-pointer justify-center p-2">
          <Monitor className="h-5 w-5" />
          <span className="sr-only">시스템</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('light')} className="cursor-pointer justify-center p-2">
          <Sun className="h-5 w-5" />
          <span className="sr-only">라이트</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="cursor-pointer justify-center p-2">
          <Moon className="h-5 w-5" />
          <span className="sr-only">다크</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}