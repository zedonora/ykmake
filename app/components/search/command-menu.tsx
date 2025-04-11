import * as React from "react";
import { useNavigate } from "@remix-run/react";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "~/components/ui/command";
import ClientOnly from "~/components/ui/client-only";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <ClientOnly>
            <>
                <p className="text-sm text-muted-foreground">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </p>
                <CommandDialog open={open} onOpenChange={setOpen}>
                    <CommandInput placeholder="무엇을 찾으시나요?" />
                    <CommandList>
                        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                        <CommandGroup heading="추천">
                            <CommandItem onSelect={() => navigate("/products")}>
                                <span>제품 둘러보기</span>
                            </CommandItem>
                            <CommandItem onSelect={() => navigate("/teams")}>
                                <span>팀 찾기</span>
                            </CommandItem>
                            <CommandItem onSelect={() => navigate("/jobs")}>
                                <span>구인/구직</span>
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="설정">
                            <CommandItem onSelect={() => navigate("/settings/account")}>
                                <User className="mr-2 h-4 w-4" />
                                <span>계정</span>
                            </CommandItem>
                            <CommandItem onSelect={() => navigate("/settings/notifications")}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>알림</span>
                            </CommandItem>
                            <CommandItem onSelect={() => {
                                navigate("/search?q=");
                            }}>
                                <Search className="mr-2 h-4 w-4" />
                                <span>통합 검색</span>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>
            </>
        </ClientOnly>
    );
}