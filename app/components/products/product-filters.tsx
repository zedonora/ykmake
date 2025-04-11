import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "~/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import ClientOnly from "~/components/ui/client-only";

const categories = [
    { value: "all", label: "전체" },
    { value: "web", label: "웹" },
    { value: "mobile", label: "모바일" },
    { value: "ai", label: "AI" },
    { value: "blockchain", label: "블록체인" },
];

const sortOptions = [
    { value: "latest", label: "최신순" },
    { value: "popular", label: "인기순" },
    { value: "views", label: "조회순" },
];

export function ProductFilters() {
    const [category, setCategory] = React.useState("");
    const [sort, setSort] = React.useState("latest");
    const [open, setOpen] = React.useState(false);
    const [openSort, setOpenSort] = React.useState(false);

    return (
        <ClientOnly>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[200px] justify-between"
                            >
                                {category
                                    ? categories.find((cat) => cat.value === category)?.label
                                    : "카테고리"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="카테고리 검색..." />
                                <CommandEmpty>카테고리를 찾을 수 없습니다.</CommandEmpty>
                                <CommandGroup>
                                    {categories.map((cat) => (
                                        <CommandItem
                                            key={cat.value}
                                            onSelect={() => {
                                                setCategory(cat.value);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    category === cat.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {cat.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {category && (
                        <Badge
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setCategory("")}
                        >
                            {categories.find((cat) => cat.value === category)?.label} ✕
                        </Badge>
                    )}
                </div>

                <Popover open={openSort} onOpenChange={setOpenSort}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openSort}
                            className="w-[150px] justify-between"
                        >
                            {sortOptions.find((option) => option.value === sort)?.label}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[150px] p-0">
                        <Command>
                            <CommandGroup>
                                {sortOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            setSort(option.value);
                                            setOpenSort(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                sort === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </ClientOnly>
    );
}